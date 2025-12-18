import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const examplePath = resolve(root, ".env.exemple");
const outPath = resolve(root, ".env");

if (!existsSync(examplePath)) {
  console.error("⚠️  Fichier .env.exemple introuvable, aucun .env généré.");
  process.exit(0);
}

const content = readFileSync(examplePath, "utf8");
const lines = content.split(/\r?\n/);

const outLines = lines.map((line) => {
  const trimmed = line.trim();

  // Garder commentaires et lignes vides telles quelles
  if (!trimmed || trimmed.startsWith("#")) return line;

  // On ne traite que les lignes de type KEY=...
  const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  if (!match) return line;

  const key = match[1];
  const value = process.env[key];

  if (value == null) {
    // Pas de valeur dans l'env → laisser vide pour montrer que la clé existe
    return `${key}=`;
  }

  const escaped = String(value).replace(/"/g, '\\"');
  return `${key}="${escaped}"`;
});

writeFileSync(outPath, outLines.join("\n"), "utf8");
console.log(`✅ Fichier .env généré à partir de .env.exemple (${outPath}).`);


