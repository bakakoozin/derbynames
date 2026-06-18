import "dotenv/config";
import { eq, isNull } from "drizzle-orm";
import { getDb } from "~/db";
import {
  derbynamesTable,
} from "~/db/schema";
import { ensureUserIdByEmail } from "~/utils/users";

async function run() {
  const db = getDb();

  let usersLinked = 0;

  const rowsWithoutUser = await db
    .select({
      derbyname: derbynamesTable.derbyname,
      email: derbynamesTable.email,
    })
    .from(derbynamesTable)
    .where(isNull(derbynamesTable.userId));

  for (const row of rowsWithoutUser) {
    const userId = await ensureUserIdByEmail(db, row.email);
    await db
      .update(derbynamesTable)
      .set({ userId })
      .where(eq(derbynamesTable.derbyname, row.derbyname));
    usersLinked += 1;
  }

  console.log("Backfill terminé", {
    usersLinked,
    derbyActionsCreated: "deprecated (colonnes token legacy supprimées)",
    renameActionsCreated: "deprecated (table legacy supprimée)",
  });
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Backfill échoué", error);
    process.exit(1);
  });
