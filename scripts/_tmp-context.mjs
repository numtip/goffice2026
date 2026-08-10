const r = await fetch('https://numtip.github.io/goffice2026/about/action-plan/', { cache: 'no-store' });
const html = await r.text();

// Find all unique contexts containing กิจกรรม with surrounding text
const seen = new Set();
const re = /[\u0E00-\u0E7Fa-zA-Z0-9()/…'"\s.,:;]{0,40}กิจกรรม[\u0E00-\u0E7Fa-zA-Z0-9()/…'"\s.,:;]{0,40}/g;
let m;
while ((m = re.exec(html))) {
  const s = m[0].replace(/\s+/g, ' ').trim();
  if (!seen.has(s)) seen.add(s);
}
let i = 0;
for (const s of seen) {
  console.log(`${++i}. …${s}…`);
}
console.log('---');
// Also count occurrences of ตัวชี้วัด contexts
const seen2 = new Set();
const re2 = /[\u0E00-\u0E7Fa-zA-Z0-9()/…'"\s.,:;]{0,30}ตัวชี้วัด[\u0E00-\u0E7Fa-zA-Z0-9()/…'"\s.,:;]{0,20}/g;
while ((m = re2.exec(html))) {
  const s = m[0].replace(/\s+/g, ' ').trim();
  if (!seen2.has(s)) seen2.add(s);
}
let j = 0;
for (const s of seen2) {
  console.log(`I${++j}. …${s}…`);
}
