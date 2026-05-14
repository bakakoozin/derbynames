/**
 * Import des associations depuis https://derby-fr.ben-to.fr/clubs (réponse JSON).
 * Filtre heuristique « pertinent derby » via clubs-filter-config.json à côté de ce script.
 *
 * Usage : node scripts/import-clubs-ben-to.mjs [--dry-run]
 * Sortie : scripts/clubs-ben-to-filtered.json (liste prête pour insertion Drizzle ou revue manuelle).
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

let raw;
if (process.argv.includes('--stdin')) {
  raw = readFileSync(0, 'utf8');
} else {
  raw = await fetchText('https://derby-fr.ben-to.fr/clubs');
}

const data = JSON.parse(raw);

const cfg = JSON.parse(readFileSync(join(__dirname, 'clubs-filter-config.json'), 'utf8'));

function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toUpperCase();
}

function deptFromPostal(cp) {
  const c = String(cp || '').trim();
  if (!c || c.length < 2) return null;
  if (c.startsWith('97') || c.startsWith('98')) return c.slice(0, 3);
  return c.slice(0, 2);
}

function scoreRecord(row) {
  const titre = norm(row.titre || '') + ' ' + norm(row.titre_court || '');
  const objet = norm(row.objet || '').slice(0, 600);
  let score = 0;
  for (const kw of cfg.includeKeywords) {
    const k = norm(kw);
    if (titre.includes(k) || objet.includes(k)) score += 1;
  }
  for (const kw of cfg.excludeKeywords || []) {
    const k = norm(kw);
    if (titre.includes(k)) score -= 3;
  }
  return score;
}

const dry = process.argv.includes('--dry-run');

const filtered = [];

for (const row of data) {
  const score = scoreRecord(row);
  if (score < (cfg.minKeywordScore ?? 1)) continue;

  const cp = row.adrs_codepostal || row.adrg_codepostal || '';
  const dept = deptFromPostal(cp);

  filtered.push({
    id: row.id,
    name: row.titre_court?.trim() || row.titre?.trim() || row.id,
    website: row.siteweb?.trim() || '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    logoUrl: '',
    department: dept || null,
    source: 'import_ben_to',
  });
}

filtered.sort((a, b) => a.name.localeCompare(b.name));

const outPath = join(__dirname, 'clubs-ben-to-filtered.json');
writeFileSync(outPath, JSON.stringify(filtered, null, 2), 'utf8');

console.log(`Total source: ${data.length}, après filtre: ${filtered.length}`);
console.log(`Écrit : ${outPath}`);
if (dry) {
  console.log(filtered.slice(0, 15));
}
