#!/usr/bin/env node
/**
 * GO-SP-2: Verify canonical RAE site and create Green Office Evidence library.
 * Uses persistent Edge profile (researchmju) — never clears cookies.
 */
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/sharepoint');
const CANONICAL_SITE = 'https://maejo365.sharepoint.com/sites/msteams_54adc4';
const EXPECTED_ACCOUNT = 'researchmju@mju.ac.th';
const LIB_INTERNAL = 'GreenOfficeEvidence';
const LIB_TITLE = 'หลักฐานสำนักงานสีเขียว';
const LIB_DESC =
  'คลังหลักฐานกลางสำหรับการดำเนินงานและการประเมินสำนักงานสีเขียวของสำนักวิจัยและส่งเสริมวิชาการการเกษตร';

const PROFILE =
  process.env.M365_PROFILE || 'D:\\AgentProfiles\\M365\\researchmju';
const LOGIN_WAIT_MS = Number(process.env.GO_SP2_LOGIN_WAIT_MS || 180000);
const PHASE = process.env.GO_SP2_PHASE || 'all'; // verify | create | all

mkdirSync(OUT, { recursive: true });

const SITE_COLUMNS = [
  { internal: 'GO_DocumentID', title: 'GO Document ID', type: 'Text' },
  { internal: 'GO_IndicatorCode', title: 'GO Indicator Code', type: 'Text' },
  {
    internal: 'GO_Category',
    title: 'GO Category',
    type: 'Choice',
    choices: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5', 'Category 6'],
  },
  {
    internal: 'GO_ResourceDomain',
    title: 'GO Resource Domain',
    type: 'Choice',
    choices: ['Water', 'Electricity', 'Fuel', 'Paper', 'Waste', 'Greenhouse Gas', 'Other'],
  },
  { internal: 'GO_FiscalYear', title: 'GO Fiscal Year', type: 'Choice', choices: ['2568', '2569'] },
  {
    internal: 'GO_EvidenceType',
    title: 'GO Evidence Type',
    type: 'Choice',
    choices: ['PDF Document', 'Workbook', 'Image', 'Form', 'Report', 'Certificate', 'Other'],
  },
  {
    internal: 'GO_EvidenceStatus',
    title: 'GO Evidence Status',
    type: 'Choice',
    choices: ['Draft', 'Under Review', 'Verified', 'Approved', 'Superseded', 'Archived'],
  },
  { internal: 'GO_EvidenceDate', title: 'GO Evidence Date', type: 'DateTime', format: 'DateOnly' },
  {
    internal: 'GO_MappingConfidence',
    title: 'GO Mapping Confidence',
    type: 'Choice',
    choices: ['Confirmed', 'Probable', 'Needs Review'],
  },
  { internal: 'GO_SHA256', title: 'GO SHA256', type: 'Text' },
  { internal: 'GO_OriginalFileName', title: 'GO Original File Name', type: 'Text' },
  { internal: 'GO_LegacyURL', title: 'GO Legacy URL', type: 'URL' },
  { internal: 'GO_OriginalSharePointURL', title: 'GO Original SharePoint URL', type: 'URL' },
  { internal: 'GO_JoomlaArticleID', title: 'GO Joomla Article ID', type: 'Text' },
  { internal: 'GO_LegacySourcePath', title: 'GO Legacy Source Path', type: 'Note' },
  {
    internal: 'GO_Visibility',
    title: 'GO Visibility',
    type: 'Choice',
    choices: ['Internal', 'Auditor', 'Public Candidate', 'Public'],
  },
  { internal: 'GO_PublicDistributionURL', title: 'GO Public Distribution URL', type: 'URL' },
  { internal: 'GO_VerifiedDate', title: 'GO Verified Date', type: 'DateTime', format: 'DateOnly' },
  { internal: 'GO_ImportedDate', title: 'GO Imported Date', type: 'DateTime' },
];

const VIEWS = [
  {
    title: 'หลักฐานทั้งหมด',
    query: '',
    fields: ['LinkFilename', 'GO_Category', 'GO_IndicatorCode', 'GO_EvidenceType', 'GO_EvidenceStatus', 'GO_FiscalYear', 'Modified'],
  },
  {
    title: 'ตามหมวด',
    query: '',
    fields: ['LinkFilename', 'GO_Category', 'GO_IndicatorCode', 'GO_EvidenceStatus', 'GO_FiscalYear', 'Modified'],
    groupBy: 'GO_Category',
  },
  {
    title: 'ตามตัวชี้วัด',
    query: '',
    fields: ['LinkFilename', 'GO_IndicatorCode', 'GO_Category', 'GO_EvidenceStatus', 'GO_FiscalYear', 'Modified'],
    groupBy: 'GO_IndicatorCode',
  },
  {
    title: 'รอตรวจสอบ',
    query: "<Where><Or><Eq><FieldRef Name='GO_EvidenceStatus'/><Value Type='Text'>Draft</Value></Eq><Or><Eq><FieldRef Name='GO_EvidenceStatus'/><Value Type='Text'>Under Review</Value></Eq><Eq><FieldRef Name='GO_MappingConfidence'/><Value Type='Text'>Needs Review</Value></Eq></Or></Or></Where>",
    fields: ['LinkFilename', 'GO_Category', 'GO_IndicatorCode', 'GO_EvidenceStatus', 'GO_MappingConfidence', 'Modified'],
  },
  {
    title: 'พร้อมเผยแพร่',
    query: "<Where><Or><Eq><FieldRef Name='GO_Visibility'/><Value Type='Text'>Public Candidate</Value></Eq><Eq><FieldRef Name='GO_Visibility'/><Value Type='Text'>Public</Value></Eq></Or></Where>",
    fields: ['LinkFilename', 'GO_Category', 'GO_IndicatorCode', 'GO_Visibility', 'GO_EvidenceStatus', 'GO_PublicDistributionURL', 'Modified'],
  },
  {
    title: 'ปี 2568',
    query: "<Where><Eq><FieldRef Name='GO_FiscalYear'/><Value Type='Text'>2568</Value></Eq></Where>",
    fields: ['LinkFilename', 'GO_Category', 'GO_IndicatorCode', 'GO_EvidenceType', 'Modified'],
  },
  {
    title: 'ปี 2569',
    query: "<Where><Eq><FieldRef Name='GO_FiscalYear'/><Value Type='Text'>2569</Value></Eq></Where>",
    fields: ['LinkFilename', 'GO_Category', 'GO_IndicatorCode', 'GO_EvidenceType', 'Modified'],
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForSharePointAuth(page, maxMs) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const url = page.url();
    if (/sharepoint\.com/i.test(url) && !/login\.microsoftonline/i.test(url)) {
      try {
        const ok = await page.evaluate(async (site) => {
          const r = await fetch(`${site}/_api/web/currentuser`, {
            credentials: 'include',
            headers: { Accept: 'application/json;odata=nometadata' },
          });
          return r.ok;
        }, CANONICAL_SITE);
        if (ok) return true;
      } catch (_) {}
    }
    await sleep(3000);
  }
  return false;
}

async function spRest(page, siteUrl, path, options = {}) {
  return page.evaluate(
    async ({ siteUrl, path, options }) => {
      const headers = {
        Accept: 'application/json;odata=verbose',
        ...(options.headers || {}),
      };
      if (options.method === 'POST' || options.method === 'PATCH' || options.method === 'DELETE') {
        const digestResp = await fetch(`${siteUrl}/_api/contextinfo`, {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json;odata=verbose' },
        });
        const digestJson = await digestResp.json();
        const digest =
          digestJson.d?.GetContextWebInformation?.FormDigestValue ||
          digestJson.GetContextWebInformation?.FormDigestValue;
        headers['X-RequestDigest'] = digest;
        if (options.method === 'POST') headers['Content-Type'] = 'application/json;odata=verbose';
        if (options.method === 'PATCH') {
          headers['Content-Type'] = 'application/json;odata=verbose';
          headers['IF-MATCH'] = '*';
          headers['X-HTTP-Method'] = 'MERGE';
        }
        if (options.method === 'DELETE') {
          headers['IF-MATCH'] = '*';
          headers['X-HTTP-Method'] = 'DELETE';
        }
      }
      const r = await fetch(`${siteUrl}${path}`, {
        method: options.method || 'GET',
        credentials: 'include',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      let json = null;
      let text = '';
      try {
        text = await r.text();
        json = text ? JSON.parse(text) : null;
      } catch (_) {}
      return { status: r.status, ok: r.ok, json, text: text.slice(0, 500) };
    },
    { siteUrl, path, options },
  );
}

async function verifySite(page, { allowExistingLibrary = false } = {}) {
  const result = {
    siteUrl: CANONICAL_SITE,
    reachable: false,
    account: null,
    accountOk: false,
    siteTitle: null,
    siteTitleOk: false,
    canCreateList: false,
    greenOfficeExists: false,
    documentCenterSnapshot: [],
    blockers: [],
  };

  await page.goto(`${CANONICAL_SITE}?login_hint=researchmju%40mju.ac.th`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });

  const authed = await waitForSharePointAuth(page, LOGIN_WAIT_MS);
  if (!authed) {
    result.blockers.push('LOGIN_REQUIRED: Complete PO login/MFA in Edge for researchmju@mju.ac.th');
    return result;
  }

  const user = await spRest(page, CANONICAL_SITE, '/_api/web/currentuser');
  if (!user.ok) {
    result.blockers.push(`currentuser_${user.status}`);
    return result;
  }
  result.account = user.json?.d?.Email || user.json?.d?.LoginName;
  result.accountOk = (result.account || '').toLowerCase() === EXPECTED_ACCOUNT;
  if (!result.accountOk) {
    result.blockers.push(`WRONG_ACCOUNT: ${result.account}`);
    return result;
  }

  const web = await spRest(
    page,
    CANONICAL_SITE,
    '/_api/web?$select=Title,Description,Url,ServerRelativeUrl,HasUniqueRoleAssignments',
  );
  if (!web.ok) {
    result.blockers.push(`web_${web.status}`);
    return result;
  }
  result.reachable = true;
  result.siteTitle = web.json?.d?.Title;
  result.siteTitleOk = /สำนักวิจัย|วิจัยและส่งเสริม/i.test(result.siteTitle || '');

  const lists = await spRest(
    page,
    CANONICAL_SITE,
    '/_api/web/lists?$filter=Hidden eq false&$select=Title,BaseTemplate,ItemCount,RootFolder/ServerRelativeUrl,HasUniqueRoleAssignments&$expand=RootFolder&$top=200',
  );
  const allLists = lists.json?.d?.results || [];
  result.documentCenterSnapshot = allLists
    .filter((l) => /document|center|เอกสาร/i.test(l.Title))
    .map((l) => ({ title: l.Title, items: l.ItemCount, path: l.RootFolder?.ServerRelativeUrl }));

  result.greenOfficeExists = allLists.some(
    (l) =>
      l.RootFolder?.ServerRelativeUrl?.endsWith(`/${LIB_INTERNAL}`) ||
      /GreenOfficeEvidence/i.test(l.RootFolder?.ServerRelativeUrl || '') ||
      l.Title === LIB_TITLE,
  );
  if (result.greenOfficeExists && !allowExistingLibrary) {
    result.blockers.push('LIBRARY_EXISTS: GreenOfficeEvidence already present');
  }

  // Permission probe: attempt to read list creation capability via web effective permissions
  const perm = await spRest(page, CANONICAL_SITE, '/_api/web/effectivebasepermissions');
  const perms = perm.json?.d?.EffectiveBasePermissions;
  const high = perm.json?.d?.High;
  const low = perm.json?.d?.Low;
  // ManageLists = 0x00000008 in Low order — simplified: try OPTIONS on lists endpoint
  const probe = await spRest(page, CANONICAL_SITE, '/_api/web/lists', {
    method: 'POST',
    body: {
      __metadata: { type: 'SP.List' },
      Title: '__GO_SP2_PERM_PROBE__',
      BaseTemplate: 101,
    },
  });
  if (probe.status === 403 || probe.status === 401) {
    result.canCreateList = false;
    result.blockers.push(`INSUFFICIENT_PERMISSION: lists POST returned ${probe.status}`);
  } else if (probe.ok) {
    result.canCreateList = true;
    const id = probe.json?.d?.Id;
    if (id) {
      await spRest(page, CANONICAL_SITE, `/_api/web/lists(guid'${id}')`, { method: 'DELETE' });
    }
  } else if (probe.status === 400 || probe.status === 500) {
    // Likely validation error but permission OK
    result.canCreateList = true;
  } else {
    result.blockers.push(`PERM_PROBE_UNKNOWN: ${probe.status}`);
  }

  result.permissions = { high, low, effective: perms };
  return result;
}

async function ensureSiteSession(page) {
  await page.goto(`${CANONICAL_SITE}?login_hint=researchmju%40mju.ac.th`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  const authed = await waitForSharePointAuth(page, LOGIN_WAIT_MS);
  if (!authed) throw new Error('LOGIN_REQUIRED');
}

async function createLibrary(page, report) {
  const steps = [];
  await ensureSiteSession(page);

  let listId = null;
  let listPath = null;

  const resolveExisting = async () => {
    const byTitle = await spRest(
      page,
      CANONICAL_SITE,
      `/_api/web/lists/getbytitle('${LIB_TITLE.replace(/'/g, "''")}')?$select=Id,RootFolder/ServerRelativeUrl&$expand=RootFolder`,
    );
    if (byTitle.ok) {
      return { id: byTitle.json?.d?.Id, path: byTitle.json?.d?.RootFolder?.ServerRelativeUrl };
    }
    const byUrl = await spRest(
      page,
      CANONICAL_SITE,
      `/_api/web/GetList('%2Fsites%2Fmsteams_54adc4%2F${LIB_INTERNAL}')?$select=Id,RootFolder/ServerRelativeUrl&$expand=RootFolder`,
    );
    if (byUrl.ok) {
      return { id: byUrl.json?.d?.Id, path: byUrl.json?.d?.RootFolder?.ServerRelativeUrl };
    }
    return null;
  };

  const existing = await resolveExisting();
  if (existing?.id) {
    listId = existing.id;
    listPath = existing.path || `/sites/msteams_54adc4/${LIB_INTERNAL}`;
    steps.push({ step: 'create_library', status: 'exists', listId, listPath });
  } else {
    let createResp = await spRest(page, CANONICAL_SITE, '/_api/web/lists/add', {
      method: 'POST',
      body: {
        parameters: {
          __metadata: { type: 'SP.ListCreationInformation' },
          Title: LIB_TITLE,
          Description: LIB_DESC,
          Url: LIB_INTERNAL,
          TemplateType: 101,
        },
      },
    });

    if (!createResp.ok) {
      createResp = await spRest(page, CANONICAL_SITE, '/_api/web/lists', {
        method: 'POST',
        body: {
          __metadata: { type: 'SP.List' },
          Title: LIB_TITLE,
          Description: LIB_DESC,
          BaseTemplate: 101,
          ContentTypesEnabled: true,
        },
      });
    }

    if (createResp.ok) {
      const listObj = createResp.json?.d?.List || createResp.json?.d?.Add || createResp.json?.d;
      listId = listObj?.Id;
      listPath = listObj?.RootFolder?.ServerRelativeUrl;
      if (!listPath && listId) {
        const detail = await spRest(
          page,
          CANONICAL_SITE,
          `/_api/web/lists(guid'${listId}')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder`,
        );
        listPath = detail.json?.d?.RootFolder?.ServerRelativeUrl;
      }
      if (!listPath) listPath = `/sites/msteams_54adc4/${LIB_INTERNAL}`;
      steps.push({ step: 'create_library', status: 'created', listId, listPath });
    } else {
      steps.push({ step: 'create_library', status: 'failed', code: createResp.status, text: createResp.text });
      report.creation = { steps, success: false };
      return report;
    }
  }

  if (!listId) {
    steps.push({ step: 'resolve_library', status: 'failed' });
    report.creation = { steps, success: false };
    return report;
  }

  // Versioning settings
  const verBody = {
    __metadata: { type: 'SP.List' },
    EnableVersioning: true,
    EnableMinorVersions: false,
    MajorVersionLimit: 50,
    ForceCheckout: false,
    EnableModeration: false,
    OnQuickLaunch: false,
  };
  const verResp = await spRest(page, CANONICAL_SITE, `/_api/web/lists(guid'${listId}')`, {
    method: 'PATCH',
    body: verBody,
  });
  steps.push({ step: 'versioning', status: verResp.ok ? 'ok' : 'failed', code: verResp.status });

  // Enable content types on list
  await spRest(page, CANONICAL_SITE, `/_api/web/lists(guid'${listId}')`, {
    method: 'PATCH',
    body: { __metadata: { type: 'SP.List' }, ContentTypesEnabled: true },
  });

  // Create site columns (web fields) and add to list
  const columnResults = [];
  for (const col of SITE_COLUMNS) {
    const fieldXml = buildFieldXml(col);
    let fieldResp = await spRest(page, CANONICAL_SITE, '/_api/web/fields', {
      method: 'POST',
      body: {
        __metadata: { type: 'SP.Field' },
        FieldTypeKind: fieldTypeKind(col.type),
        Title: col.title,
        StaticName: col.internal,
        Name: col.internal,
        ...(col.type === 'Choice' ? { Choices: { results: col.choices } } : {}),
      },
    });

    if (!fieldResp.ok && fieldResp.status === 400) {
      // Try createFromXml
      fieldResp = await spRest(page, CANONICAL_SITE, '/_api/web/fields/createfieldasxml', {
        method: 'POST',
        body: {
          parameters: {
            __metadata: { type: 'SP.XmlSchemaFieldCreationInformation' },
            SchemaXml: fieldXml,
          },
        },
      });
    }

    const exists = fieldResp.status === 400 && /already exists/i.test(fieldResp.text || '');
    columnResults.push({
      internal: col.internal,
      status: fieldResp.ok ? 'created' : exists ? 'reused' : 'failed',
      code: fieldResp.status,
    });

    // Add field to list
    const addField = await spRest(
      page,
      CANONICAL_SITE,
      `/_api/web/lists(guid'${listId}')/fields/createfieldasxml`,
      {
        method: 'POST',
        body: {
          parameters: {
            __metadata: { type: 'SP.XmlSchemaFieldCreationInformation' },
            SchemaXml: `<Field Type='${xmlFieldType(col)}' Name='${col.internal}' DisplayName='${col.title}' StaticName='${col.internal}'${col.type === 'Choice' ? `><CHOICES>${col.choices.map((c) => `<CHOICE>${c}</CHOICE>`).join('')}</CHOICES>` : col.type === 'Note' ? " NumLines='6' RichText='FALSE'" : ''}${col.format === 'DateOnly' ? " Format='DateOnly'" : ''} />`.replace(
              '/>',
              col.type === 'Choice' ? '</Field>' : '/>',
            ),
          },
        },
      },
    );
    if (!addField.ok && !/already exists|duplicate/i.test(addField.text || '')) {
      columnResults[columnResults.length - 1].listAdd = { status: 'failed', code: addField.status };
    } else {
      columnResults[columnResults.length - 1].listAdd = { status: 'ok' };
    }
  }
  steps.push({ step: 'columns', results: columnResults });

  // Content types
  const ctResults = [];
  for (const ct of [
    { name: 'Green Office Evidence Document', id: 'GOEVDoc' },
    { name: 'Green Office Evidence Workbook', id: 'GOEVWb' },
  ]) {
    const ctResp = await spRest(page, CANONICAL_SITE, '/_api/web/contenttypes', {
      method: 'POST',
      body: {
        __metadata: { type: 'SP.ContentType' },
        Name: ct.name,
        Group: 'Green Office Evidence',
        Description: `${ct.name} for Green Office 2026 evidence library`,
      },
    });
    ctResults.push({
      name: ct.name,
      status: ctResp.ok ? 'created' : ctResp.status === 400 ? 'limited' : 'failed',
      code: ctResp.status,
      text: ctResp.text?.slice(0, 200),
    });
  }
  steps.push({ step: 'content_types', results: ctResults });

  // Folders 2568, 2569
  const folderResults = [];
  for (const year of ['2568', '2569']) {
    const fr = await spRest(
      page,
      CANONICAL_SITE,
      `/_api/web/GetFolderByServerRelativeUrl('${listPath.replace(/'/g, "''")}')/folders`,
      {
        method: 'POST',
        body: {
          __metadata: { type: 'SP.Folder' },
          ServerRelativeUrl: `${listPath}/${year}`,
        },
      },
    );
    folderResults.push({ folder: year, status: fr.ok || fr.status === 409 ? 'ok' : 'failed', code: fr.status });
  }
  steps.push({ step: 'folders', results: folderResults });

  // Views — create via CSOM-like REST is limited; use addview or modify default
  const viewResults = [];
  for (const v of VIEWS) {
    const viewXml = buildViewXml(v);
    const vr = await spRest(page, CANONICAL_SITE, `/_api/web/lists(guid'${listId}')/views`, {
      method: 'POST',
      body: {
        __metadata: { type: 'SP.View' },
        Title: v.title,
        ViewQuery: v.query || '',
        PersonalView: false,
        RowLimit: 100,
      },
    });
    viewResults.push({
      title: v.title,
      status: vr.ok ? 'created' : vr.status === 400 && /already exists/i.test(vr.text || '') ? 'exists' : 'failed',
      code: vr.status,
    });
  }
  steps.push({ step: 'views', results: viewResults });

  // Final validation read
  const finalList = await spRest(
    page,
    CANONICAL_SITE,
    `/_api/web/lists(guid'${listId}')?$select=Title,Description,EnableVersioning,EnableMinorVersions,MajorVersionLimit,ForceCheckout,EnableModeration,HasUniqueRoleAssignments,ItemCount,RootFolder/ServerRelativeUrl&$expand=RootFolder`,
  );
  const fields = await spRest(
    page,
    CANONICAL_SITE,
    `/_api/web/lists(guid'${listId}')/fields?$select=Title,InternalName,TypeAsString&$filter=startswith(InternalName,'GO_')&$top=50`,
  );
  const views = await spRest(
    page,
    CANONICAL_SITE,
    `/_api/web/lists(guid'${listId}')/views?$select=Title,DefaultView&$top=30`,
  );

  report.creation = {
    steps,
    success: true,
    library: finalList.json?.d,
    columns: (fields.json?.d?.results || []).map((f) => ({
      title: f.Title,
      internal: f.InternalName,
      type: f.TypeAsString,
    })),
    views: (views.json?.d?.results || []).map((v) => v.Title),
    libraryUrl: `${CANONICAL_SITE}/${LIB_INTERNAL}`,
  };
  return report;
}

function fieldTypeKind(type) {
  const map = { Text: 2, Note: 3, DateTime: 4, Choice: 6, URL: 11 };
  return map[type] || 2;
}

function xmlFieldType(col) {
  const map = { Text: 'Text', Note: 'Note', DateTime: 'DateTime', Choice: 'Choice', URL: 'URL' };
  return map[col.type] || 'Text';
}

function buildFieldXml(col) {
  if (col.type === 'Choice') {
    return `<Field Type='Choice' Name='${col.internal}' DisplayName='${col.title}' StaticName='${col.internal}'><CHOICES>${col.choices.map((c) => `<CHOICE>${c}</CHOICE>`).join('')}</CHOICES></Field>`;
  }
  if (col.type === 'DateTime') {
    return `<Field Type='DateTime' Name='${col.internal}' DisplayName='${col.title}' StaticName='${col.internal}' Format='${col.format === 'DateOnly' ? 'DateOnly' : 'DateTime'}' />`;
  }
  if (col.type === 'Note') {
    return `<Field Type='Note' Name='${col.internal}' DisplayName='${col.title}' StaticName='${col.internal}' NumLines='6' RichText='FALSE' />`;
  }
  if (col.type === 'URL') {
    return `<Field Type='URL' Name='${col.internal}' DisplayName='${col.title}' StaticName='${col.internal}' />`;
  }
  return `<Field Type='Text' Name='${col.internal}' DisplayName='${col.title}' StaticName='${col.internal}' />`;
}

function buildViewXml(v) {
  return `<View><Query>${v.query || ''}</Query><ViewFields>${(v.fields || []).map((f) => `<FieldRef Name='${f}'/>`).join('')}</ViewFields><RowLimit>100</RowLimit></View>`;
}

async function main() {
  const report = {
    generated_at: new Date().toISOString(),
    phase: PHASE,
    canonical_site: CANONICAL_SITE,
    profile: PROFILE,
  };

  let context;
  try {
    context = await chromium.launchPersistentContext(PROFILE, {
      channel: 'msedge',
      headless: false,
      args: ['--no-first-run', '--no-default-browser-check'],
    });
    const page = context.pages()[0] || (await context.newPage());

    if (PHASE === 'verify' || PHASE === 'all') {
      report.verification = await verifySite(page);
      writeFileSync(join(OUT, 'go-sp2-verify-raw.json'), JSON.stringify(report, null, 2));

      if (report.verification.blockers?.length) {
        report.verdict = 'GO_SP2_BLOCKED';
        console.log(JSON.stringify({ verdict: report.verdict, blockers: report.verification.blockers }, null, 2));
        writeFileSync(join(OUT, 'go-sp2-run-raw.json'), JSON.stringify(report, null, 2));
        process.exit(2);
      }
    }

    if (PHASE === 'create' || PHASE === 'all') {
      if (PHASE === 'create') {
        report.verification = await verifySite(page, { allowExistingLibrary: true });
        if (report.verification.blockers?.length) {
          report.verdict = 'GO_SP2_BLOCKED';
          writeFileSync(join(OUT, 'go-sp2-run-raw.json'), JSON.stringify(report, null, 2));
          console.log(JSON.stringify({ verdict: report.verdict, blockers: report.verification.blockers }, null, 2));
          process.exit(2);
        }
      }
      await createLibrary(page, report);
      report.verdict = report.creation?.success ? 'GO_SP2_LIBRARY_READY' : 'GO_SP2_FAILED';
    }

    writeFileSync(join(OUT, 'go-sp2-run-raw.json'), JSON.stringify(report, null, 2));
    console.log(
      JSON.stringify(
        {
          verdict: report.verdict,
          site: report.verification?.siteTitle,
          account: report.verification?.account?.replace(/(.{4}).+(@.+)/, '$1***$2'),
          library: report.creation?.libraryUrl,
          columns: report.creation?.columns?.length,
          views: report.creation?.views?.length,
        },
        null,
        2,
      ),
    );
  } finally {
    if (context) await context.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
