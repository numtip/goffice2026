/**
 * Knowledge 8-Practice visual asset contract — central manifest.
 *
 * Single source of truth for the Magnific-generated asset slots of the
 * /knowledge/ practice pages. Mirrors the engage visual system contract
 * (`src/data/engageVisuals.ts`): local WebP only, availability is detected
 * at build time via existsSync, and components render an accent/icon fallback
 * (never a broken image) while a slot is pending.
 *
 * Naming contract (files under public/images/knowledge/):
 *   {slug}-hero.webp          · 16:9  · 1920×1080  · practice page hero + card thumbnail
 *   {slug}-campaign.webp      · 4:5  · 1080×1350  · campaign / feature slot
 *   {slug}-social.webp        · 9:16 · 1080×1920  · social media / reel slot
 *   {slug}-infographic.webp   · 1:1  · 1200×1200  · optional, only where later supplied
 *
 * To supply an asset: drop the WebP at the documented path (see
 * docs/design/KNOWLEDGE_MEDIA_ASSET_MANIFEST.md). No code change is required —
 * the renderer picks it up automatically. Do NOT hotlink remote Magnific URLs.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

const KNOWLEDGE_IMG_DIR = 'images/knowledge/';

export type PracticeAssetType = 'hero' | 'campaign' | 'social' | 'infographic';

export interface PracticeAssetSlot {
  /** Logical slot id — see manifest for intended use. */
  type: PracticeAssetType;
  /** Local asset filename per the naming contract ({slug}-{type}.webp). */
  file: string;
  /** Recommended aspect ratio, e.g. '16:9'. */
  ratio: string;
  /** Recommended pixel dimensions of the source asset. */
  width: number;
  height: number;
  /** Alt-text intent (Thai / English) — refine after the final artwork exists. */
  altTh: string;
  altEn: string;
  /** Infographic is optional — only render where later supplied. */
  optional: boolean;
}

export interface PracticeAssetContract {
  /** Matches the practice slug in src/data/knowledge/practices.json. */
  slug: string;
  titleTh: string;
  titleEn: string;
  slots: PracticeAssetSlot[];
}

/** Resolve a public asset path relative to the Astro base URL (mirrors engageVisuals.ts). */
function knowledgeAssetUrl(file: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}${KNOWLEDGE_IMG_DIR}${file}`.replace(/\/{2,}/g, '/').replace(':/', '://');
}

/** True when the local asset file exists at build time (avoids broken <img> while pending). */
export function practiceImageAvailable(file: string): boolean {
  try {
    return existsSync(join(process.cwd(), 'public', KNOWLEDGE_IMG_DIR, file));
  } catch {
    return false;
  }
}

/** Resolve the public URL for an asset slot, or null while the file is pending. */
export function practiceImageUrl(file: string): string | null {
  return practiceImageAvailable(file) ? knowledgeAssetUrl(file) : null;
}

const makeSlots = (
  slug: string,
  alt: {
    heroTh: string; heroEn: string;
    campaignTh: string; campaignEn: string;
    socialTh: string; socialEn: string;
    infographicTh?: string; infographicEn?: string;
  },
): PracticeAssetSlot[] => {
  const slots: PracticeAssetSlot[] = [
    {
      type: 'hero',
      file: `${slug}-hero.webp`,
      ratio: '16:9',
      width: 1920,
      height: 1080,
      altTh: alt.heroTh,
      altEn: alt.heroEn,
      optional: false,
    },
    {
      type: 'campaign',
      file: `${slug}-campaign.webp`,
      ratio: '4:5',
      width: 1080,
      height: 1350,
      altTh: alt.campaignTh,
      altEn: alt.campaignEn,
      optional: false,
    },
    {
      type: 'social',
      file: `${slug}-social.webp`,
      ratio: '9:16',
      width: 1080,
      height: 1920,
      altTh: alt.socialTh,
      altEn: alt.socialEn,
      optional: false,
    },
  ];
  if (alt.infographicTh && alt.infographicEn) {
    slots.push({
      type: 'infographic',
      file: `${slug}-infographic.webp`,
      ratio: '1:1',
      width: 1200,
      height: 1200,
      altTh: alt.infographicTh,
      altEn: alt.infographicEn,
      optional: true,
    });
  }
  return slots;
};

export const practiceAssetContracts: PracticeAssetContract[] = [
  {
    slug: 'green-office-mindset',
    titleTh: 'รู้จัก Green Office',
    titleEn: 'What is Green Office?',
    slots: makeSlots('green-office-mindset', {
      heroTh: 'ภาพประกอบแนวคิด Green Office สำนักงานสีเขียวเริ่มต้นจากความคิดของทุกคน',
      heroEn: 'Illustration of the Green Office mindset — a green office starts with how we think',
      campaignTh: 'ภาพรณรงค์ รู้จัก Green Office — ทำความรู้จัก Green Office ก่อนลงมือทำ',
      campaignEn: 'What is Green Office? campaign image — understand Green Office before acting',
      socialTh: 'ภาพแนวตั้งสำหรับโซเชียล — เริ่มต้นด้วยความคิดสีเขียว',
      socialEn: 'Vertical social graphic — start with a green mindset',
    }),
  },
  {
    slug: 'energy-smart',
    titleTh: 'ใช้พลังงานอย่างฉลาด',
    titleEn: 'Energy Smart',
    slots: makeSlots('energy-smart', {
      heroTh: 'ภาพประกอบการประหยัดพลังงานไฟฟ้าในสำนักงาน เช่น ไฟ เครื่องปรับอากาศ และอุปกรณ์',
      heroEn: 'Illustration of saving office electricity — lighting, air conditioning and equipment',
      campaignTh: 'ภาพรณรงค์ ปิดเมื่อไม่ใช้ — ลดการใช้ไฟฟ้าในสำนักงาน',
      campaignEn: 'Energy Smart campaign image — switch off what you do not use',
      socialTh: 'ภาพแนวตั้งสำหรับโซเชียล — ประหยัดไฟง่าย ๆ ตั้งแต่วันนี้',
      socialEn: 'Vertical social graphic — easy office energy savings starting today',
      infographicTh: 'อินโฟกราฟิกแนวทางประหยัดพลังงาน 5 ข้อในสำนักงาน',
      infographicEn: 'Infographic of 5 office energy-saving actions',
    }),
  },
  {
    slug: 'water-wise',
    titleTh: 'ใช้น้ำรู้คุณค่า',
    titleEn: 'Water Wise',
    slots: makeSlots('water-wise', {
      heroTh: 'ภาพประกอบการอนุรักษ์น้ำในสำนักงาน เช่น ปิดก๊อกน้ำสนิทและตรวจสอบการรั่วซึม',
      heroEn: 'Illustration of office water conservation — closing taps and checking for leaks',
      campaignTh: 'ภาพรณรงค์ ทุกหยดมีค่า — ใช้น้ำอย่างรู้คุณค่า',
      campaignEn: 'Water Wise campaign image — every drop counts',
      socialTh: 'ภาพแนวตั้งสำหรับโซเชียล — ปิดก๊อกน้ำให้สนิททุกครั้ง',
      socialEn: 'Vertical social graphic — always close taps fully',
    }),
  },
  {
    slug: 'paper-smart',
    titleTh: 'ลดกระดาษ ใช้ทรัพยากรอย่างคุ้มค่า',
    titleEn: 'Paper Smart',
    slots: makeSlots('paper-smart', {
      heroTh: 'ภาพประกอบการทำงานไร้กระดาษ คิดก่อนพิมพ์และพิมพ์สองหน้า',
      heroEn: 'Illustration of a paper-smart workflow — think before you print and print duplex',
      campaignTh: 'ภาพรณรงค์ คิดก่อนพิมพ์ — ลดการใช้กระดาษ',
      campaignEn: 'Paper Smart campaign image — think before you print',
      socialTh: 'ภาพแนวตั้งสำหรับโซเชียล — ตรวจทานเอกสารบนหน้าจอก่อนพิมพ์',
      socialEn: 'Vertical social graphic — review documents on screen before printing',
    }),
  },
  {
    slug: 'zero-waste',
    titleTh: 'ลดขยะ แยกให้ถูก ใช้ให้คุ้ม',
    titleEn: 'Zero Waste',
    slots: makeSlots('zero-waste', {
      heroTh: 'ภาพประกอบการคัดแยกขยะและหลัก 3R ลด ใช้ซ้ำ รีไซเคิล',
      heroEn: 'Illustration of waste sorting and the 3R principle — reduce, reuse, recycle',
      campaignTh: 'ภาพรณรงค์ แยกขยะให้ถูกถัง — เพิ่มพลังให้โลก',
      campaignEn: 'Zero Waste campaign image — sort waste into the right bins',
      socialTh: 'ภาพแนวตั้งสำหรับโซเชียล — ลดขยะเริ่มจากถังแยกในสำนักงาน',
      socialEn: 'Vertical social graphic — zero waste starts with sorting bins at the office',
      infographicTh: 'อินโฟกราฟิกแนวทางคัดแยกขยะตามหลัก 3R',
      infographicEn: 'Infographic of waste segregation by the 3R principle',
    }),
  },
  {
    slug: 'green-mobility',
    titleTh: 'เดินทางแบบรักษ์โลก',
    titleEn: 'Green Mobility',
    slots: makeSlots('green-mobility', {
      heroTh: 'ภาพประกอบการเดินทางอย่างยั่งยืน เดิน ปั่นจักรยาน และโดยสารร่วมกัน',
      heroEn: 'Illustration of sustainable travel — walking, cycling and shared transport',
      campaignTh: 'ภาพรณรงค์ เดินทางแบบรักษ์โลก — ลดการใช้น้ำมันเชื้อเพลิง',
      campaignEn: 'Green Mobility campaign image — plan greener trips',
      socialTh: 'ภาพแนวตั้งสำหรับโซเชียล — วางแผนเดินทางล่วงหน้าเพื่อประหยัดพลังงาน',
      socialEn: 'Vertical social graphic — plan trips ahead to save energy',
    }),
  },
  {
    slug: 'green-meeting',
    titleTh: 'ประชุมและจัดซื้ออย่างเป็นมิตร',
    titleEn: 'Green Meeting & Procurement',
    slots: makeSlots('green-meeting', {
      heroTh: 'ภาพประกอบการประชุมแบบดิจิทัลไร้กระดาษและการจัดซื้อที่เป็นมิตรกับสิ่งแวดล้อม',
      heroEn: 'Illustration of paperless digital meetings and environmentally friendly procurement',
      campaignTh: 'ภาพรณรงค์ ประชุมและจัดซื้ออย่างเป็นมิตรกับสิ่งแวดล้อม',
      campaignEn: 'Green Meeting & Procurement campaign image',
      socialTh: 'ภาพแนวตั้งสำหรับโซเชียล — ส่งเอกสารประชุมผ่านระบบดิจิทัล',
      socialEn: 'Vertical social graphic — share meeting documents digitally',
    }),
  },
  {
    slug: 'green-workplace',
    titleTh: 'สำนักงานน่าอยู่ ปลอดภัย มีระเบียบ',
    titleEn: 'Green Workplace',
    slots: makeSlots('green-workplace', {
      heroTh: 'ภาพประกอบการจัดระเบียบพื้นที่ทำงานด้วยหลัก 5ส สะสาง สะดวก สะอาด สุขลักษณะ สร้างนิสัย',
      heroEn: 'Illustration of an organized workplace following 5S — sort, set, shine, standardize, sustain',
      campaignTh: 'ภาพรณรงค์ สำนักงานน่าอยู่ ปลอดภัย มีระเบียบด้วย 5ส',
      campaignEn: 'Green Workplace campaign image — a clean, safe and organized office',
      socialTh: 'ภาพแนวตั้งสำหรับโซเชียล — เริ่ม 5ส จากพื้นที่ทำงานของคุณ',
      socialEn: 'Vertical social graphic — start 5S from your own work area',
      infographicTh: 'อินโฟกราฟิกขั้นตอน 5ส ในสำนักงาน',
      infographicEn: 'Infographic of the 5S steps in the office',
    }),
  },
];

/** Find the asset contract for a practice slug. */
export function getPracticeAssetContract(slug: string): PracticeAssetContract | undefined {
  return practiceAssetContracts.find((c) => c.slug === slug);
}

/** Find one slot by type within a contract. */
export function getPracticeAssetSlot(slug: string, type: PracticeAssetType): PracticeAssetSlot | undefined {
  return getPracticeAssetContract(slug)?.slots.find((s) => s.type === type);
}

/** Resolve public URL + availability for a slot. Returns null while the file is pending. */
export function resolvePracticeAsset(slug: string, type: PracticeAssetType): { url: string; slot: PracticeAssetSlot } | null {
  const slot = getPracticeAssetSlot(slug, type);
  if (!slot) return null;
  const url = practiceImageUrl(slot.file);
  return url ? { url, slot } : null;
}
