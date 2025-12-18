import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';
import { clubsTable, derbynamesTable } from './schema.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le JSON
const dbDataPath = join(__dirname, '../../public/db.json');
const dbData = JSON.parse(readFileSync(dbDataPath, 'utf-8')) as DbData;

// Connexion à la base de données
const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

const db = drizzle(connection);

interface ClubData {
  name: string;
  id: string;
}

interface DerbynameData {
  name: string;
  numRoster: string;
  email: string;
  club?: ClubData | {};
  emailConfirmed?: boolean;
}

interface DbDataEntry {
  name: string;
  value: DerbynameData | string;
}

interface DbData {
  exportDate?: string;
  namespaceId?: string;
  totalKeys?: number;
  keys: DbDataEntry[];
}

async function migrate() {
  console.log('🚀 Début de la migration...\n');

  try {
    // Vérifier que le format est correct
    if (!dbData.keys || !Array.isArray(dbData.keys)) {
      throw new Error('Format de données invalide : le fichier doit contenir un tableau "keys"');
    }

    // Étape 1: Extraire et insérer les clubs uniques
    console.log('📦 Extraction des clubs...');
    const clubsMap = new Map<string, ClubData>();

    for (const entry of dbData.keys) {
      const key = entry.name;
      const value = entry.value;

      // Si la valeur est juste un string (email), on l'ignore car c'est une référence
      if (typeof value === 'string') {
        continue;
      }

      const data = value as DerbynameData;
      if (data.club && typeof data.club === 'object' && 'id' in data.club && 'name' in data.club) {
        const club = data.club as ClubData;
        if (club.id && club.name) {
          clubsMap.set(club.id, club);
        }
      }
    }

    console.log(`   ${clubsMap.size} clubs trouvés`);

    // Insérer les clubs (avec gestion des doublons)
    if (clubsMap.size > 0) {
      const clubsToInsert = Array.from(clubsMap.values()).map(club => ({
        id: club.id,
        name: club.name,
      }));

      for (const club of clubsToInsert) {
        try {
          await db.insert(clubsTable).values(club);
        } catch (error: any) {
          // Si le club existe déjà, on le met à jour
          if (error.code === 'ER_DUP_ENTRY') {
            await db.update(clubsTable)
              .set({ name: club.name })
              .where(eq(clubsTable.id, club.id));
          } else {
            throw error;
          }
        }
      }

      console.log(`✅ ${clubsToInsert.length} clubs insérés\n`);
    }

    // Étape 2: Extraire et insérer les derbynames
    console.log('👥 Extraction des derbynames...');
    type DerbynameInsert = {
      derbyname: string;
      name: string;
      numRoster: string;
      email: string;
      clubId: string | null;
      emailConfirmed: boolean;
    };
    const derbynamesMap = new Map<string, DerbynameInsert>();
    let skipped = 0;

    for (const entry of dbData.keys) {
      const key = entry.name;
      const value = entry.value;

      // Si la valeur est juste un string (email), on l'ignore car c'est une référence
      if (typeof value === 'string') {
        skipped++;
        continue;
      }

      const data = value as DerbynameData;

      // Vérifier que les données essentielles sont présentes
      if (!data.name || !data.numRoster || !data.email) {
        console.warn(`⚠️  Données incomplètes pour "${key}":`, data);
        skipped++;
        continue;
      }

      // Déterminer le derbyname et l'email
      // Si la clé contient "@", c'est un email, donc le derbyname est dans data.name
      // Sinon, la clé est probablement le derbyname
      const isEmailKey = key.includes('@');
      const derbyname = isEmailKey ? data.name : key;
      const email = data.email; // Toujours utiliser l'email de l'objet, pas la clé

      // Extraire le clubId
      let clubId: string | null = null;
      if (data.club && typeof data.club === 'object' && 'id' in data.club) {
        const club = data.club as ClubData;
        clubId = club.id || null;
      }

      // Utiliser une Map pour éviter les doublons (même derbyname avec clés différentes)
      // Si le derbyname existe déjà, on garde celui avec emailConfirmed=true ou le plus récent
      if (!derbynamesMap.has(derbyname) ||
        (data.emailConfirmed && !derbynamesMap.get(derbyname)?.emailConfirmed)) {
        derbynamesMap.set(derbyname, {
          derbyname: derbyname,
          name: data.name,
          numRoster: String(data.numRoster),
          email: email,
          clubId: clubId,
          emailConfirmed: data.emailConfirmed ?? false,
        });
      }
    }

    const derbynamesToInsert = Array.from(derbynamesMap.values());
    console.log(`   ${derbynamesToInsert.length} derbynames uniques à insérer`);
    if (skipped > 0) {
      console.log(`   ${skipped} entrées ignorées (références ou données incomplètes)`);
    }

    // Insérer les derbynames par lots pour éviter les problèmes de mémoire
    const batchSize = 100;
    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < derbynamesToInsert.length; i += batchSize) {
      const batch = derbynamesToInsert.slice(i, i + batchSize);

      for (const derbyname of batch) {
        try {
          await db.insert(derbynamesTable).values(derbyname);
          inserted++;
        } catch (error: any) {
          // Si le derbyname existe déjà, on le met à jour
          if (error.code === 'ER_DUP_ENTRY') {
            await db.update(derbynamesTable)
              .set({
                name: derbyname.name,
                numRoster: derbyname.numRoster,
                email: derbyname.email,
                clubId: derbyname.clubId,
                emailConfirmed: derbyname.emailConfirmed,
              })
              .where(eq(derbynamesTable.derbyname, derbyname.derbyname));
            updated++;
          } else {
            throw error;
          }
        }
      }

      console.log(`   ✅ Lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(derbynamesToInsert.length / batchSize)} traité (${inserted} insérés, ${updated} mis à jour)`);
    }

    console.log(`\n✅ Migration terminée avec succès !`);
    console.log(`   - ${clubsMap.size} clubs`);
    console.log(`   - ${inserted} derbynames insérés`);
    console.log(`   - ${updated} derbynames mis à jour`);
    console.log(`   - ${skipped} entrées ignorées`);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Exécuter la migration
migrate()
  .then(() => {
    console.log('\n🎉 Migration complète !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });

