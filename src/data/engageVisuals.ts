/**
 * Engage Landing visual system — central asset manifest.
 *
 * Single source of truth for the 8 PO-approved visual assets.
 * All image paths are resolved from the naming contract below — components must
 * never hardcode image paths; always import from this manifest.
 *
 * Naming contract (files under public/images/engage/2026/):
 *   web/<id>-master.webp — runtime card assets (16:9, optimized from master PNGs)
 *   web/<id>-4x5.webp · web/<id>-9x16.webp · web/<id>-1x1.webp — ratio derivatives
 *   legacy root *2.webp files (energy2.webp, …) retained for compatibility
 *
 * Images are local optimized WebP only (never hotlink remote Magnific URLs).
 * While an asset file is pending, EngageVisualSection renders an accent-colored
 * placeholder instead of a broken image.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ENGAGE_DIR = 'images/engage/2026/';

/** Resolve a public asset path relative to the Astro base URL (mirrors wow2-images.ts). */
function engageAssetUrl(filename: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}${ENGAGE_DIR}${filename}`.replace(/\/{2,}/g, '/').replace(':/', '://');
}

/** True when the local asset file exists at build time (avoids broken <img> while assets are pending). */
export function engageImageAvailable(file: string): boolean {
  try {
    return existsSync(join(process.cwd(), 'public', ENGAGE_DIR, file));
  } catch {
    return false;
  }
}

export interface EngageVisual {
  /** Stable identifier — also the asset filename stem. */
  id: string;
  /** Local asset filename per the naming contract (web/<id>-master.webp). */
  file: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  /** Resolved local asset path (WebP). */
  image: string;
  altTh: string;
  altEn: string;
  /** Linked resource dashboard metric id (when the practice maps to a measured resource). */
  relatedMetric?: string;
  /** Linked Green Office assessment category id (cat1–cat7). */
  relatedCategory?: string;
  /** Knowledge hub slug (practices.json) when this practice has a detailed hub page. */
  knowledgeSlug?: string;
  /** Accent color used for the placeholder while the asset is pending. */
  accent: string;
  accentLight: string;
}

export const engageVisuals: EngageVisual[] = [
  {
    id: 'mindset',
    titleTh: 'รู้จัก Green Office',
    titleEn: 'What is Green Office?',
    descriptionTh:
      'ทำความรู้จัก Green Office ว่าคืออะไร เชื่อมโยงพฤติกรรมในสำนักงานกับผลกระทบต่อสิ่งแวดล้อมและก๊าซเรือนกระจกอย่างไร',
    descriptionEn:
      'Understand what Green Office means and how everyday office behaviour connects to environmental impact and greenhouse gas.',
    file: 'web/mindset-master.webp',
    image: engageAssetUrl('web/mindset-master.webp'),
    altTh: 'ภาพประกอบแนวคิด Green Office สำนักงานสีเขียวเริ่มต้นจากความคิดของทุกคน',
    altEn: 'Illustration of the Green Office mindset — a green office starts with how we think',
    relatedCategory: 'cat2',
    knowledgeSlug: 'green-office-mindset',
    accent: '#0891b2',
    accentLight: '#cffafe',
  },
  {
    id: 'energy',
    titleTh: 'พลังงาน',
    titleEn: 'Energy',
    descriptionTh:
      'ปิดไฟและถอดปลั๊กอุปกรณ์เมื่อไม่ใช้งาน เลือกใช้เครื่องใช้ไฟฟ้าประหยัดพลังงานเบอร์ 5 เพื่อลดการใช้ไฟฟ้าขององค์กร',
    descriptionEn:
      'Turn off lights and unplug devices when idle. Choose high-efficiency appliances to cut organizational electricity use.',
    file: 'web/energy-master.webp',
    image: engageAssetUrl('web/energy-master.webp'),
    altTh: 'ภาพประกอบการประหยัดพลังงานไฟฟ้าในสำนักงาน',
    altEn: 'Illustration of saving electricity in the office',
    relatedMetric: 'energy',
    relatedCategory: 'cat3',
    knowledgeSlug: 'energy-smart',
    accent: '#b45309',
    accentLight: '#fef3c7',
  },
  {
    id: 'water',
    titleTh: 'น้ำ',
    titleEn: 'Water',
    descriptionTh:
      'ปิดก๊อกน้ำให้สนิททุกครั้ง ตรวจสอบการรั่วซึมของท่อและสุขภัณฑ์ เพื่อการอนุรักษ์น้ำอย่างเป็นระบบ',
    descriptionEn:
      'Close taps fully every time and monitor leaks in pipes and fixtures for systematic water conservation.',
    file: 'web/water-master.webp',
    image: engageAssetUrl('web/water-master.webp'),
    altTh: 'ภาพประกอบการอนุรักษ์น้ำในสำนักงาน',
    altEn: 'Illustration of water conservation in the office',
    relatedMetric: 'water',
    relatedCategory: 'cat3',
    knowledgeSlug: 'water-wise',
    accent: '#0369a1',
    accentLight: '#e0f2fe',
  },
  {
    id: 'waste',
    titleTh: 'ขยะ',
    titleEn: 'Waste',
    descriptionTh:
      'คัดแยกขยะตามประเภท ทั้งขยะย่อยสลาย รีไซเคิล และอันตราย พร้อมสนับสนุนการนำกลับมาใช้ซ้ำ',
    descriptionEn:
      'Sort waste by type — compostable, recyclable, and hazardous — and support reuse across operations.',
    file: 'web/waste-master.webp',
    image: engageAssetUrl('web/waste-master.webp'),
    altTh: 'ภาพประกอบการคัดแยกขยะและนำกลับมาใช้ใหม่',
    altEn: 'Illustration of waste sorting and reuse',
    relatedMetric: 'waste',
    relatedCategory: 'cat4',
    knowledgeSlug: 'zero-waste',
    accent: '#15803d',
    accentLight: '#dcfce7',
  },
  {
    id: 'paper',
    titleTh: 'กระดาษ',
    titleEn: 'Paper',
    descriptionTh:
      'เปลี่ยนสู่การทำงานไร้กระดาษ พิมพ์สองหน้าทั้งสองด้าน และใช้กระดาษรีไซเคิลเพื่อลดการใช้ทรัพยากร',
    descriptionEn:
      'Go paperless with digital workflows; print double-sided and choose recycled paper to reduce resource use.',
    file: 'web/paper-master.webp',
    image: engageAssetUrl('web/paper-master.webp'),
    altTh: 'ภาพประกอบการทำงานไร้กระดาษ',
    altEn: 'Illustration of a paperless workflow',
    relatedMetric: 'paper',
    relatedCategory: 'cat3',
    knowledgeSlug: 'paper-smart',
    accent: '#a16207',
    accentLight: '#fefce8',
  },
  {
    id: 'ghg',
    titleTh: 'ก๊าซเรือนกระจก',
    titleEn: 'GHG',
    descriptionTh:
      'ติดตามและรายงานการปล่อยก๊าซเรือนกระจก พร้อมส่งเสริมกิจกรรมลดคาร์บอนในชีวิตประจำวันของบุคลากร',
    descriptionEn:
      'Measure and report GHG emissions while promoting low-carbon habits in daily staff activities.',
    file: 'web/ghg-master.webp',
    image: engageAssetUrl('web/ghg-master.webp'),
    altTh: 'ภาพประกอบการวัดและลดก๊าซเรือนกระจก',
    altEn: 'Illustration of GHG measurement and low-carbon awareness',
    relatedMetric: 'ghg',
    relatedCategory: 'cat3',
    accent: '#0f766e',
    accentLight: '#ccfbf1',
  },
  {
    id: 'green-meeting',
    titleTh: 'การประชุมสีเขียว',
    titleEn: 'Green Meeting',
    descriptionTh:
      'จัดการประชุมแบบผสมและไร้กระดาษ ลดการเดินทาง และให้เอกสารอิเล็กทรอนิกส์แทนเอกสารพิมพ์',
    descriptionEn:
      'Run hybrid, paperless meetings — reduce travel and share documents electronically instead of printing.',
    file: 'web/green-meeting-master.webp',
    image: engageAssetUrl('web/green-meeting-master.webp'),
    altTh: 'ภาพประกอบการประชุมสีเขียวแบบไร้กระดาษ',
    altEn: 'Illustration of a sustainable green meeting',
    relatedCategory: 'cat2',
    knowledgeSlug: 'green-meeting',
    accent: '#4338ca',
    accentLight: '#e0e7ff',
  },
  {
    id: '5s',
    titleTh: '5ส',
    titleEn: '5S',
    descriptionTh:
      'จัดระเบียบพื้นที่ทำงานให้สะอาด ปลอดภัย และเป็นระบบด้วยหลัก 5ส — สะสาง สะดวก สะอาด สุขลักษณะ สร้างนิสัย',
    descriptionEn:
      'Keep the workplace clean, safe, and organized with 5S — Sort, Set, Shine, Standardize, Sustain.',
    file: 'web/5s-master.webp',
    image: engageAssetUrl('web/5s-master.webp'),
    altTh: 'ภาพประกอบการจัดระเบียบสำนักงานด้วยหลัก 5ส',
    altEn: 'Illustration of an organized office following 5S',
    relatedCategory: 'cat5',
    knowledgeSlug: 'green-workplace',
    accent: '#334155',
    accentLight: '#e2e8f0',
  },
];

/** Resolve a visual by id. */
export function engageVisualById(id: string): EngageVisual | undefined {
  return engageVisuals.find((v) => v.id === id);
}

/** Resolve the related page href for a visual — Knowledge hub page when available, else dashboard metric or assessment category. */
export function engageHref(visual: EngageVisual): string {
  if (visual.knowledgeSlug) return `/knowledge/${visual.knowledgeSlug}`;
  return visual.relatedMetric ? `/dashboard/${visual.relatedMetric}` : `/categories/${visual.relatedCategory}`;
}
