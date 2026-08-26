import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLatestPublished, getPublishedItems } from '../src/utils/content-presentation.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const HISTORICAL_IDS = [
  'ACT-2568-001',
  'ACT-2568-002',
  'ACT-2568-003',
  'ACT-2568-004',
  'ACT-2568-005',
  'ACT-2568-006',
  'ACT-2568-007',
  'ACT-2568-008',
  'ACT-2567-001',
  'ACT-2567-002',
  'ACT-2567-003',
  'ACT-2567-004',
  'ACT-2567-005',
  'ACT-2567-006',
  'ACT-2567-007',
  'ACT-2567-008',
  'ACT-2567-009',
  'ACT-2566-001',
  'ACT-2566-002',
];

const DRAFTS = [
  {
    id: 'ACT-2569-001',
    slug: 'committee-ops-1-2569',
    intakeId: 'FY2569-FB-01',
    publishDate: '2026-02-09',
    categoryId: 'meeting',
    typeId: 'committee',
    shareUrl: 'https://www.facebook.com/share/p/1DMe5HQKNd/',
    displayTitle:
      'ประชุมคณะกรรมการดำเนินงานสำนักงานสีเขียว (Green Office) ครั้งที่ 1/2569',
    sha256: [
      'f54ea7f5b4ef5efebe7ab16b33e655aed8302faafebc590aaa79f2cd77e5bf14',
      '2d71ab9b326dfa78b3f04b46979dfa714c6e9ce0329516e07a43f4d8397dfe5c',
      '6fb7934296c500a9f56044489dfd0a139560a5807904537bb3874a8ddd6ae33b',
      'b5910bd145ce267414a5d728f879dbbba96f860e1cb1b120df7051d53906d6a0',
      'c5150402604637481b3aa7372da55c415aa99dbe7d5df7b72a96ba8ca93ffb20',
    ],
  },
  {
    id: 'ACT-2569-002',
    slug: 'internal-audit-2569',
    intakeId: 'FY2569-FB-03',
    publishDate: '2026-03-17',
    categoryId: 'assessment',
    typeId: null,
    shareUrl: 'https://www.facebook.com/share/p/19AE1vgSut/',
    sha256: [
      '13b6376716d917bf8cc792af0348480f3a624f82dceb05d52334469f29cd9f09',
      'aa1cb91242a283c7ed01a2a6c2c871d468314ac7ddb75093446909d4d9d5cb60',
      '9ea28383c2df20387c524e3bf0e67d2a47907e54b6d9152d6a2b9858e6577ce7',
      'aa60b6b207dc8e9ac3de1626cd03a61c56e5ea65a339e6e93109fccd9d046d98',
      '65a63ad92c8ed4b120b92e3f4655c5a906cca77162aa51493b57c8272cc075b2',
    ],
  },
  {
    id: 'ACT-2569-003',
    slug: 'emergency-first-aid-2569',
    intakeId: 'FY2569-FB-04',
    publishDate: '2026-05-08',
    categoryId: 'preparedness',
    typeId: 'workshop',
    shareUrl: 'https://www.facebook.com/share/p/1EhpBgJ5FN/',
    displayTitle:
      'กิจกรรมการเตรียมความพร้อมกรณีฉุกเฉิน เพลิงไหม้ และการปฐมพยาบาลเบื้องต้น',
    sha256: [
      '5a3181b7993ca0027222533fd0c873d5e1ef5b257eba59ab2a86d029bb36b514',
      '6c7a7a4dc301513fa426e1a83b8c118ab932c6210d8ec79b525996982abc6bac',
      'f883ef5e94e964982b26eb24007aed5ac8c30558ad0ef4d8b2ea202521ee72fa',
      '1114f7c5e4016cf7bf6b4eeb8e5d15efd953bea725418221efed3bd10635ccff',
      '879dd44c8e0e4967dbb7aa691f1148ac96e4d2eec5cac3a5141becd16f126057',
    ],
  },
  {
    id: 'ACT-2569-004',
    slug: 'green-synergy-2569',
    intakeId: 'FY2569-FB-05',
    publishDate: '2026-06-05',
    categoryId: 'campaign',
    typeId: 'eco-event',
    shareUrl: 'https://www.facebook.com/share/p/1HZ6VEp74X/',
    sha256: [
      '131ea57f9981dafcb94407d6335f2404015888a20b600cc7b42fe13c8b0ff290',
      'a36e6a16263d9a2da339a601f9841e3b80b577ce3fdac02e41c5a0f6de11d0d5',
      'adb2d715691dc5b83fdcb7f31490b6520bc7b648c50432eb96c202b864cae32b',
      '2d678dfdc5068da47e8aae944044e6dcff112e64188a9db2f2feb7ccb3858679',
      '1b8515035e380df49c7d41168777c8f8781bacc6fea995e4d88da77fd9b8a1d4',
    ],
  },
  {
    id: 'ACT-2569-005',
    slug: 'big-cleaning-1-2569',
    intakeId: 'FY2569-FB-02',
    publishDate: '2026-03-13',
    categoryId: 'campaign',
    typeId: 'cleaning',
    shareUrl: 'https://www.facebook.com/share/p/1Jk6bSDKhg/',
    displayTitle: 'กิจกรรม Big Cleaning Day ครั้งที่ 1 ประจำปี 2569',
    sha256: [
      '51cb1d4ed76f2ebfa6ba44ecc4fc1dda127777fd94f8b38ddfd826c4e22978ec',
      'a07c120f148af8b93ee9f56001b86edf42a1821a1e1a54344cd432c7a2a24c5b',
      '3e54c09e97a64f2d4908eda4890502f3e63f02a6c0115de5bff5fb96edb267b4',
      '2a79f2d0c5a2f651ba3460f7e63ef03e252eb2c74d509cce7850624a72ec419e',
      '212011728b590c5f21c7ccef7033f93c1842a826c8b07d213459046a3dbfec0c',
    ],
  },
  {
    id: 'ACT-2569-006',
    slug: 'compost-organic-waste-2569',
    intakeId: 'FY2569-FB-06',
    publishDate: '2026-07-21',
    categoryId: 'campaign',
    typeId: 'community',
    shareUrl: 'https://www.facebook.com/share/p/1BEkSTdbVT/',
    displayTitle: 'กิจกรรมการทำปุ๋ยหมักฯ จากเศษวัสดุอินทรีย์',
    poBody:
      'เมื่อวันที่ 21 กรกฎาคม 2569 สำนักวิจัยฯ มหาวิทยาลัยแม่โจ้ ร่วมกับหน่วยงายภายในอาคารเฉลิมพระเกียรติสมเด็จพระเทพรัตนราชสุดา ร่วมกิจกรรม Green Office รักษ์โลก "การทำปุ๋ยหมักฯ จากเศษวัสดุอินทรีย์" ณ บริเวณด้านหลังอาคารเฉลิมพระเกียรติสมเด็จพระเทพรัตนราชสุดา มหาวิทยาลัยแม่โจ้',
    sha256: [
      '0f60c1246fd54491ccc1bf910a55fc2081c76f7986754d8d7d01c95e67966131',
      'feed3ea9d4c4a944cde52c9fb34ebd29785592531c874266f4a5516c25b939ea',
      'c34d540f448578a97b991e188ac62cb67d10295e9cec28112c79e5525437ff95',
      '407a26a31d910b149a37e8a20c792b395b022af296d85ba39001a4d2c87bc36b',
      '01fecef959d952e164ed05f976de6a0342fdc3b897ceede43c1abb09647d1ece',
    ],
  },
];

const SKIPPED_INTAKE_IDS = ['FY2568-FB-07'];

function loadJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

function publicFromSrc(src) {
  return join(ROOT, 'public', ...src.replace(/^\//, '').split('/'));
}

describe('FY2569 Facebook activities (canonical intake + publish batch)', () => {
  const activities = loadJson('src/data/content/activities.json');
  const audit = loadJson('src/data/migration/facebook-fy2569-intake-audit.json');
  const search = loadJson('src/data/search-index.json');

  it('converts only READY_FOR_DRAFT audit records', () => {
    const ready = audit.items.filter((i) => i.intakeVerdict === 'READY_FOR_DRAFT');
    assert.equal(ready.length, 4);
    assert.deepEqual(
      ready.map((i) => i.id),
      ['FY2569-FB-01', 'FY2569-FB-03', 'FY2569-FB-04', 'FY2569-FB-05'],
    );
  });

  it('FY2569 records are published with audited or PO-resolved identity', () => {
    for (const expected of DRAFTS) {
      const rec = activities.items.find((i) => i.id === expected.id);
      const sourceItem = audit.items.find((i) => i.id === expected.intakeId);
      assert.ok(rec, expected.id);
      assert.equal(rec.status, 'published');
      assert.equal(rec.slug, expected.slug);
      assert.equal(rec.fiscalYear, 2569);
      assert.equal(rec.publishDate, expected.publishDate);
      const expectedTitle = expected.displayTitle ?? sourceItem.exactTitle;
      assert.equal(rec.titleTh, expectedTitle);
      const expectedBody = expected.poBody ?? sourceItem.exactPostText;
      assert.equal(rec.bodyTh, expectedBody);
      assert.equal(rec.source.exactTitle ?? rec.titleTh, sourceItem.exactTitle);
      if (expected.displayTitle) {
        assert.notEqual(rec.titleTh, sourceItem.exactTitle);
        assert.equal(rec.source.exactPostText, sourceItem.exactPostText);
      }
      if (expected.poBody) {
        assert.equal(rec.source.poAuthorityBody, expected.poBody);
        assert.match(rec.bodyTh, /หน่วยงาย/);
      }
      assert.equal(rec.translationPending, true);
      assert.equal(rec.titleEn, '');
      assert.equal(rec.bodyEn, '');
      assert.equal(rec.category.id, expected.categoryId);
      assert.equal(rec.activityType?.id ?? null, expected.typeId);
      assert.deepEqual(rec.relatedIndicators, []);
      assert.equal(rec.evidenceIds, undefined);
      assert.equal(rec.source.system, 'manual');
      assert.equal(rec.source.facebookShareUrl, expected.shareUrl);
      assert.equal(rec.source.intakeId, expected.intakeId);
      assert.equal(rec.source.joomlaArticleId, undefined);
      assert.ok(!rec.relatedLinks?.some((l) => String(l.route ?? '').includes('facebook.com')));
    }
  });

  it('PO-resolved backlog intake records are drafted', () => {
    for (const id of ['FY2569-FB-02', 'FY2569-FB-06']) {
      const item = audit.items.find((i) => i.id === id);
      assert.equal(item.intakeVerdict, 'PO_RESOLVED');
      assert.ok(item.canonicalDraftId?.startsWith('ACT-2569-'));
    }
  });

  it('publish batch — 25 published, 0 draft, historical 19 unchanged', () => {
    const published = activities.items.filter((i) => i.status === 'published');
    const drafts = activities.items.filter((i) => i.status === 'draft');
    assert.equal(published.length, 25);
    assert.equal(drafts.length, 0);
    assert.equal(activities.items.length, 25);

    const historicalPublished = published.filter((i) => HISTORICAL_IDS.includes(i.id));
    assert.equal(historicalPublished.length, 19);
    assert.deepEqual(
      historicalPublished.map((i) => i.id).sort(),
      [...HISTORICAL_IDS].sort(),
    );

    const fy2569 = activities.items.filter((i) => i.fiscalYear === 2569);
    assert.equal(fy2569.length, 6);
    assert.ok(fy2569.every((i) => i.status === 'published'));
    assert.ok(fy2569.every((i) => Array.isArray(i.relatedIndicators) && i.relatedIndicators.length === 0));
    assert.ok(fy2569.every((i) => i.translationPending === true));
  });

  it('does not convert OUT_OF_SCOPE records', () => {
    const intakeIds = new Set(activities.items.map((i) => i.source?.intakeId).filter(Boolean));
    for (const skipped of SKIPPED_INTAKE_IDS) {
      assert.equal(intakeIds.has(skipped), false, skipped);
    }
  });

  it('published FY2569 activities appear in search index and published helpers', () => {
    const published = getPublishedItems(activities);
    assert.equal(published.length, 25);
    assert.ok(published.some((i) => i.id === 'ACT-2569-006'));

    const latest = getLatestPublished(activities, 3);
    assert.equal(latest.length, 3);
    assert.ok(latest.every((i) => i.status === 'published'));
    assert.ok(latest.some((i) => String(i.id).startsWith('ACT-2569-')));

    const searchIds = new Set(search.items.map((i) => i.id));
    for (const expected of DRAFTS) {
      assert.equal(searchIds.has(expected.id), true, expected.id);
      assert.ok(search.items.some((i) => i.route === `/activities/${expected.slug}/`));
    }
  });

  it('detail routes remain published-only', () => {
    for (const rel of ['src/pages/activities/[slug].astro', 'src/pages/en/activities/[slug].astro']) {
      const src = readFileSync(join(ROOT, rel), 'utf8');
      assert.match(src, /status === 'published'/);
    }
  });

  it('resolves copied draft media and all activity media paths', () => {
    for (const expected of DRAFTS) {
      const rec = activities.items.find((i) => i.id === expected.id);
      assert.equal(rec.media.length, 5);
      rec.media.forEach((m, idx) => {
        assert.equal(m.src, `/images/activities/2569/${expected.slug}/${String(idx + 1).padStart(2, '0')}.jpg`);
        const abs = publicFromSrc(m.src);
        assert.equal(existsSync(abs), true, abs);
        const hash = createHash('sha256').update(readFileSync(abs)).digest('hex');
        assert.equal(hash, expected.sha256[idx], m.src);
      });
    }

    for (const item of activities.items) {
      for (const media of item.media ?? []) {
        if (media.type !== 'image') continue;
        const abs = publicFromSrc(media.src);
        assert.equal(existsSync(abs), true, `${item.id} missing ${media.src}`);
      }
    }
  });
});
