import { readFileSync } from 'fs';

const files = ['pages', 'documents', 'images', 'missing-content'];
let allValid = true;

for (const f of files) {
  try {
    const content = readFileSync(`src/data/about/${f}.json`, 'utf8');
    const data = JSON.parse(content);
    
    // Check for duplicate IDs
    if (f === 'pages' && data.pages) {
      const ids = data.pages.map(p => p.id);
      const dups = ids.filter((item, index) => ids.indexOf(item) !== index);
      if (dups.length > 0) {
        console.log(`FAIL ${f}.json: duplicate IDs: ${dups.join(', ')}`);
        allValid = false;
        continue;
      }
    }
    
    console.log(`OK  src/data/about/${f}.json`);
  } catch (e) {
    console.log(`FAIL src/data/about/${f}.json: ${e.message}`);
    allValid = false;
  }
}

if (!allValid) process.exit(1);
console.log('\nAll About JSON files valid.');