#!/usr/bin/env node
/* DATA TYCOON QA — lexical global / window erişim kontrolü
   Amaç: top-level `let foo` / `const foo` ile tanımlanan değişkenlere `window.foo`
   üzerinden erişilmesini release öncesi hata olarak yakalamak.

   Çalıştırma: node qa-global-scope.js
   Exit 0 = temiz, Exit 1 = hata bulundu.
*/
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SELF = path.basename(__filename);
const files = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.js') && f !== SELF)
  .sort();

function maskCommentsAndStrings(src) {
  let out = '', i = 0, mode = 'code', quote = '';
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (mode === 'code') {
      if (c === '/' && n === '/') { out += '  '; i += 2; mode = 'line'; continue; }
      if (c === '/' && n === '*') { out += '  '; i += 2; mode = 'block'; continue; }
      if (c === '"' || c === "'" || c === '`') { quote = c; out += ' '; i++; mode = 'string'; continue; }
      out += c; i++; continue;
    }
    if (mode === 'line') {
      if (c === '\n') { out += '\n'; i++; mode = 'code'; } else { out += ' '; i++; }
      continue;
    }
    if (mode === 'block') {
      if (c === '*' && n === '/') { out += '  '; i += 2; mode = 'code'; }
      else { out += c === '\n' ? '\n' : ' '; i++; }
      continue;
    }
    // string/template: içerik taranmaz; satır numarası korunur.
    if (c === '\\') { out += ' '; if (i + 1 < src.length) { out += src[i + 1] === '\n' ? '\n' : ' '; i += 2; } else i++; continue; }
    if (c === quote) { out += ' '; i++; mode = 'code'; continue; }
    out += c === '\n' ? '\n' : ' '; i++;
  }
  return out;
}

function topLevelLexicals(masked, file) {
  const found = [];
  let depth = 0;
  const lines = masked.split(/\r?\n/);
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (depth === 0) {
      // DATA TYCOON kaynaklarında top-level lexical tanımlar tek satırda başlıyor.
      const m = line.match(/^\s*(?:export\s+)?(let|const)\s+([A-Za-z_$][\w$]*)\b/);
      if (m) found.push({ name: m[2], kind: m[1], file, line: li + 1 });
    }
    for (const ch of line) {
      if (ch === '{') depth++;
      else if (ch === '}') depth = Math.max(0, depth - 1);
    }
  }
  return found;
}

const maskedByFile = new Map();
const lexical = new Map();
for (const file of files) {
  const masked = maskCommentsAndStrings(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  maskedByFile.set(file, masked);
  for (const d of topLevelLexicals(masked, file)) {
    if (!lexical.has(d.name)) lexical.set(d.name, []);
    lexical.get(d.name).push(d);
  }
}

const errors = [];
for (const [file, masked] of maskedByFile) {
  const lines = masked.split(/\r?\n/);
  for (let li = 0; li < lines.length; li++) {
    const re = /\bwindow\.([A-Za-z_$][\w$]*)\b/g;
    let m;
    while ((m = re.exec(lines[li]))) {
      const defs = lexical.get(m[1]);
      if (defs?.length) errors.push({ file, line: li + 1, name: m[1], defs });
    }
  }
}

if (errors.length) {
  console.error('\n❌ GLOBAL SCOPE QA FAILED\n');
  for (const e of errors) {
    const where = e.defs.map(d => `${d.file}:${d.line} (${d.kind})`).join(', ');
    console.error(`- ${e.file}:${e.line}: window.${e.name} kullanılıyor; lexical tanım: ${where}`);
    console.error(`  Düzeltme: \`${e.name}\` kullan veya değişkeni bilinçli bir API ile window'a export et.`);
  }
  console.error(`\n${errors.length} hata bulundu. Release durduruldu.\n`);
  process.exit(1);
}

console.log(`✅ Global scope QA temiz: ${files.length} JS dosyası, ${lexical.size} top-level let/const isim tarandı.`);
process.exit(0);
