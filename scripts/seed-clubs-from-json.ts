/**
 * Lit scripts/clubs-ben-to-filtered.json et upsert dans la table clubs (id + métadonnées).
 * Usage : pnpm exec tsx scripts/seed-clubs-from-json.ts
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { clubsTable } from '../src/db/schema.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

type Row = {
  id: string;
  name: string;
  website?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  logoUrl?: string | null;
  department?: string | null;
  source?: string | null;
};

async function main() {
  const path = join(__dirname, 'clubs-ben-to-filtered.json');
  const rows = JSON.parse(readFileSync(path, 'utf8')) as Row[];

  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
  const db = drizzle(conn);

  let n = 0;
  for (const r of rows) {
    await db
      .insert(clubsTable)
      .values({
        id: r.id,
        name: r.name,
        website: r.website || null,
        facebookUrl: r.facebookUrl || null,
        instagramUrl: r.instagramUrl || null,
        twitterUrl: r.twitterUrl || null,
        logoUrl: r.logoUrl || null,
        department: r.department || null,
        source: r.source || 'import_ben_to',
      })
      .onDuplicateKeyUpdate({
        set: {
          name: r.name,
          website: r.website || null,
          department: r.department || null,
          source: r.source || 'import_ben_to',
          updatedAt: new Date(),
        },
      });
    n++;
  }

  await conn.end();
  console.log(`OK — ${n} clubs upsert`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
