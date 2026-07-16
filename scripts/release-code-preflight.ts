import "dotenv/config";
import { execSync } from "node:child_process";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "~/db";
import { actionsTable, derbynamesTable } from "~/db/schema";
import { isDerbyType } from "~/utils/constants";

function runCommand(command: string) {
  console.log(`\n$ ${command}`);
  execSync(command, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
}

async function runDataSanityChecks() {
  const db = getDb();

  const [{ count: missingUserIdRaw }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(derbynamesTable)
    .where(isNull(derbynamesTable.userId));

  const pendingDerbyActions = await db
    .select({
      id: actionsTable.id,
      token: actionsTable.token,
      expiresAt: actionsTable.expiresAt,
      payload: actionsTable.payload,
    })
    .from(actionsTable)
    .where(
      and(
        eq(actionsTable.actionType, "derbyname.confirm"),
        eq(actionsTable.status, "pending"),
      ),
    );

  let invalidPayloadCount = 0;
  let missingTokenOrExpiryCount = 0;
  let orphanPendingActionCount = 0;

  for (const action of pendingDerbyActions) {
    if (!action.token || !action.expiresAt) {
      missingTokenOrExpiryCount += 1;
    }

    let derbyname = "";
    let derbyType = "";

    try {
      const parsed = action.payload
        ? (JSON.parse(action.payload) as { derbyname?: string; derbyType?: string })
        : {};
      derbyname = typeof parsed.derbyname === "string" ? parsed.derbyname.trim() : "";
      derbyType = typeof parsed.derbyType === "string" ? parsed.derbyType.trim() : "";
    } catch {
      invalidPayloadCount += 1;
      continue;
    }

    if (!derbyname || !derbyType || !isDerbyType(derbyType)) {
      invalidPayloadCount += 1;
      continue;
    }

    const [pendingEntry] = await db
      .select({ derbyname: derbynamesTable.derbyname })
      .from(derbynamesTable)
      .where(
        and(
          eq(derbynamesTable.derbyname, derbyname),
          eq(derbynamesTable.derbyType, derbyType),
          eq(derbynamesTable.emailConfirmed, false),
        ),
      )
      .limit(1);

    if (!pendingEntry) {
      orphanPendingActionCount += 1;
    }
  }

  const report = {
    derbynamesMissingUserId: Number(missingUserIdRaw ?? 0),
    pendingDerbyActions: pendingDerbyActions.length,
    invalidPendingDerbyPayloads: invalidPayloadCount,
    pendingActionsMissingTokenOrExpiry: missingTokenOrExpiryCount,
    orphanPendingDerbyActions: orphanPendingActionCount,
  };

  console.log("\nPreflight report", report);

  const hardFailures =
    report.derbynamesMissingUserId > 0 ||
    report.invalidPendingDerbyPayloads > 0 ||
    report.pendingActionsMissingTokenOrExpiry > 0;

  if (hardFailures) {
    throw new Error("Preflight bloquant: corriger les incoherences de donnees avant la mise en prod");
  }
}

async function run() {
  runCommand("pnpm build");
  runCommand("pnpm test:unit");
  runCommand("pnpm db:verify-actions");
  await runDataSanityChecks();
  console.log("\nPreflight code termine: OK");
}

run().catch((error) => {
  console.error("\nEchec preflight code", error);
  process.exit(1);
});
