#!/usr/bin/env node
/**
 * Auth probe for M365 bootstrap — persistent Edge profile only.
 * Does not clear cookies, log out, or write secrets.
 */
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] ?? 'true']);
    return acc;
  }, []),
);

const userDataDir = args['user-data-dir'];
const targetUrl = args.url;
const expectedHost = (args['expected-host'] || '').replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
const expectedSitePath = (args['expected-site-path'] || '').replace(/\/$/, '').toLowerCase();
const expectedUpn = (args['expected-upn'] || '').toLowerCase();

if (!userDataDir || !targetUrl) {
  console.log(JSON.stringify({ status: 'CONFIGURATION_ERROR', reason: 'missing_args' }));
  process.exit(5);
}

if (!existsSync(userDataDir)) {
  console.log(JSON.stringify({ status: 'LOGIN_REQUIRED', reason: 'profile_missing' }));
  process.exit(1);
}

function safePath(url) {
  try {
    return new URL(url).pathname.replace(/\/$/, '').toLowerCase();
  } catch {
    return '';
  }
}

function isLoginPage(url, title) {
  return /login\.microsoftonline\.com/i.test(url) || /sign in to your account/i.test(title);
}

function isTenantRootOnly(pathname) {
  if (!pathname || pathname === '/') return true;
  if (/^\/sitepages\//i.test(pathname) && !pathname.includes('/sites/')) return true;
  if (/^\/_layouts\//i.test(pathname) && !pathname.includes('/sites/')) return true;
  return false;
}

let context;
try {
  context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'msedge',
    headless: false,
    args: ['--no-first-run', '--no-default-browser-check'],
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(4000);

  const url = page.url();
  const title = await page.title();
  const host = new URL(url).hostname.toLowerCase();
  const pathname = safePath(url);

  if (isLoginPage(url, title)) {
    console.log(JSON.stringify({ status: 'LOGIN_REQUIRED', host, path: pathname, title: title.slice(0, 80) }));
    process.exit(1);
  }

  if (expectedHost && host !== expectedHost) {
    console.log(JSON.stringify({ status: 'WRONG_SITE_CONTEXT', host, path: pathname, reason: 'unexpected_host' }));
    process.exit(7);
  }

  if (expectedSitePath) {
    if (!pathname.startsWith(expectedSitePath)) {
      const reason = isTenantRootOnly(pathname) ? 'tenant_root_not_canonical_rae' : 'path_outside_expected_site';
      console.log(JSON.stringify({ status: 'WRONG_SITE_CONTEXT', host, path: pathname, expectedSitePath, reason }));
      process.exit(7);
    }
  }

  if (expectedUpn && expectedSitePath) {
    const siteBase = `https://${host}${expectedSitePath}`;
    const accountCheck = await page.evaluate(async (base) => {
      try {
        const r = await fetch(`${base}/_api/web/currentuser`, {
          credentials: 'include',
          headers: { Accept: 'application/json;odata=nometadata' },
        });
        if (!r.ok) return { ok: false, status: r.status };
        const user = await r.json();
        return { ok: true, email: (user.Email || user.LoginName || '').toLowerCase() };
      } catch (e) {
        return { ok: false, error: String(e.message || e).slice(0, 80) };
      }
    }, siteBase);

    if (!accountCheck.ok) {
      console.log(JSON.stringify({ status: 'SESSION_PRESENT_AUTH_UNVERIFIED', host, path: pathname, reason: 'currentuser_unavailable' }));
      process.exit(6);
    }

    const email = accountCheck.email || '';
    if (!email.includes(expectedUpn.split('@')[0]) || !email.endsWith(`@${expectedUpn.split('@')[1]}`)) {
      const masked = email.replace(/(.{4}).+(@.+)/, '$1***$2');
      console.log(JSON.stringify({ status: 'WRONG_ACCOUNT', host, path: pathname, detected: masked || 'unknown' }));
      process.exit(8);
    }
  }

  console.log(JSON.stringify({ status: 'READY', host, path: pathname, title: title.slice(0, 80) }));
  process.exit(0);
} catch (e) {
  const msg = String(e.message || e);
  if (/existing browser session/i.test(msg)) {
    console.log(JSON.stringify({ status: 'PROFILE_IN_USE', reason: 'profile_in_use_by_edge' }));
    process.exit(2);
  }
  console.log(JSON.stringify({ status: 'SESSION_PRESENT_AUTH_UNVERIFIED', reason: msg.slice(0, 120) }));
  process.exit(6);
} finally {
  if (context) await context.close();
}
