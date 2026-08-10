import { readFileSync } from 'node:fs';

const th = readFileSync('dist/about/action-plan/index.html', 'utf8');
const en = readFileSync('dist/en/about/action-plan/index.html', 'utf8');

console.log('TH has "147 กิจกรรม" (resultCount):', th.includes('147 กิจกรรม'));
console.log('TH summary card >147</p>:', th.includes('>147</p>'));
console.log('TH summary card >65</p>:', th.includes('>65</p>'));
console.log('EN summary card >65</p>:', en.includes('>65</p>'));
console.log('EN summary card >147</p>:', en.includes('>147</p>'));

// extract summary card value+label pairs (TH)
const thCards = [...th.matchAll(/<p class="text-2xl font-bold text-green-700"[^>]*>([^<]+)<\/p>\s*<p class="mt-1[^"]*"[^>]*>([^<]+)<\/p>/g)].map((m) => `${m[1]} ${m[2]}`);
console.log('TH summary cards:', JSON.stringify(thCards));
const enCards = [...en.matchAll(/<p class="text-2xl font-bold text-green-700"[^>]*>([^<]+)<\/p>\s*<p class="mt-1[^"]*"[^>]*>([^<]+)<\/p>/g)].map((m) => `${m[1]} ${m[2]}`);
console.log('EN summary cards:', JSON.stringify(enCards));
