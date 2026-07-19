// scripts/list-asar.mjs — list top-level + main entries
import * as asar from '@electron/asar';
const ASAR = process.argv[2] || 'S:/ZCode/resources/app.asar';

const list = asar.listPackage(ASAR);
const tops = new Set();
for (const p of list) {
  const parts = p.replace(/\\/g, '/').split('/').slice(0, 2);
  if (parts[0]) tops.add(parts.join('/'));
}
console.log('=== top-2-level prefixes (count=' + tops.size + ') ===');
[...tops].sort().slice(0, 60).forEach(p => console.log(' ', p));

console.log('\n=== candidates for main entry ===');
list
  .filter(p => /main|index|entry/i.test(p.replace(/\\/g, '/')))
  .slice(0, 30)
  .forEach(p => console.log(' ', p));

console.log('\n=== package.json head/lines ===');
try {
  const pkgBuf = asar.extractFile(ASAR, 'package.json');
  const pkgHead = pkgBuf.toString('utf8').split('\n').slice(0, 30).join('\n');
  console.log(pkgHead);
} catch (e) {
  console.log('(cannot read package.json: ' + e.message + ')');
}

console.log('\n=== preload/.cjs files ===');
list.filter(p => /\.cjs$/.test(p)).slice(0, 10).forEach(p => console.log(' ', p));
