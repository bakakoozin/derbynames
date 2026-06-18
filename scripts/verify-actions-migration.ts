import "dotenv/config";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "~/db";
import {
  actionsTable,
  derbynamesTable,
  usersTable,
} from "~/db/schema";

async function run() {
  const db = getDb();

  const [{ count: usersCountRaw }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable);
  const [{ count: derbynamesCountRaw }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(derbynamesTable);
  const [{ count: actionsCountRaw }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(actionsTable);

  const [{ count: missingUserIdRaw }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(derbynamesTable)
    .where(isNull(derbynamesTable.userId));

  const [{ count: pendingDerbyActionsRaw }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(actionsTable)
    .where(
      and(
        eq(actionsTable.actionType, "derbyname.confirm"),
        eq(actionsTable.status, "pending"),
      ),
    );

  const [{ count: pendingRenameActionsRaw }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(actionsTable)
    .where(
      and(
        eq(actionsTable.actionType, "renameHistory.requestAccess"),
        eq(actionsTable.status, "pending"),
      ),
    );

  console.log("Verification migration users/actions", {
    usersCount: Number(usersCountRaw ?? 0),
    derbynamesCount: Number(derbynamesCountRaw ?? 0),
    actionsCount: Number(actionsCountRaw ?? 0),
    derbynamesMissingUserId: Number(missingUserIdRaw ?? 0),
    pendingLegacyTokens: "dropped_columns",
    pendingLegacyTokensMissingActionMirror: "dropped_columns",
    legacyRenameTokensCount: "dropped_table",
    pendingDerbyActions: Number(pendingDerbyActionsRaw ?? 0),
    pendingRenameActions: Number(pendingRenameActionsRaw ?? 0),
  });
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification échouée", error);
    process.exit(1);
  });
