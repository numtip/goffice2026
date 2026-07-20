#!/usr/bin/env node
/**
 * Optional auth probe for M365 bootstrap (CheckOnly).
 * Uses persistent Edge profile — does not clear cookies or log out.
 * Outputs JSON only; no secrets written.
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
const expectedHost = args['expected-host'] || '';

if (!userDataDir || !targetUrl) {
  console.log(JSON.stringify({ status: 'CONFIGURATION_ERROR', reason: 'missing_args' }));
  process.exit(5);
}

if (!existsSync(userDataDir)) {
  console.log(JSON.stringify({ status: 'LOGIN_REQUIRED', reason: 'profile_missing' }));
  process.exit(1);
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

  if (/login\.microsoftonline\.com/i.test(url) || /sign in to your account/i.test(title)) {
    console.log(JSON.stringify({ status: 'LOGIN_REQUIRED', host, title: title.slice(0, 80) }));
    process.exit(1);
  }

  if (expectedHost && !host.includes(expectedHost.replace(/^https?:\/\//, '').split('/')[0])) {
    console.log(JSON.stringify({ status: 'SESSION_PRESENT_AUTH_UNVERIFIED', host, title: title.slice(0, 80) }));
    process.exit(6);
  }

  console.log(JSON.stringify({ status: 'READY', host, title: title.slice(0, 80) }));
  process.exit(0);
} catch (e) {
  console.log(JSON.stringify({ status: 'SESSION_PRESENT_AUTH_UNVERIFIED', reason: String(e.message || e).slice(0, 120) }));
  process.exit(6);
} finally {
  if (context) await context.close();
}
