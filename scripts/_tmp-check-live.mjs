const r = await fetch('https://numtip.github.io/goffice2026/about/action-plan/', { cache: 'no-store' });
const html = await r.text();
console.log('status:', r.status);
console.log('has >65</p>:', html.includes('>65</p>'));
console.log('has >147</p>:', html.includes('>147</p>'));
console.log('has 65 ตัวชี้วัด:', html.includes('65 ตัวชี้วัด'));
const m = [...html.matchAll(/text-2xl font-bold text-green-700"[^>]*>([^<]+)<\/p>\s*<p class="mt-1[^"]*"[^>]*>([^<]+)<\/p>/g)].map((x) => `${x[1]} ${x[2]}`);
console.log('cards:', JSON.stringify(m));
