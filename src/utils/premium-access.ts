import { and, eq } from "drizzle-orm";
import { getDb } from "~/db";
import { clubMembershipsTable, derbynamesTable } from "~/db/schema";

/**
 * Badge premium : joueur confirmé + club lié + ligne `club_memberships` avec le même email.
 * Si `premiumValidUntil` est null → accès illimité ; sinon date future requise.
 */
export async function derbynameHasPremiumBadgeAccess(derbyKey: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(derbynamesTable)
    .where(
      and(eq(derbynamesTable.derbyname, derbyKey), eq(derbynamesTable.emailConfirmed, true)),
    )
    .limit(1);

  if (!row?.clubId) return false;

  const [mem] = await db
    .select()
    .from(clubMembershipsTable)
    .where(
      and(eq(clubMembershipsTable.clubId, row.clubId), eq(clubMembershipsTable.email, row.email)),
    )
    .limit(1);

  if (!mem) return false;

  if (mem.premiumValidUntil == null) return true;

  const until =
    mem.premiumValidUntil instanceof Date
      ? mem.premiumValidUntil
      : new Date(mem.premiumValidUntil as unknown as string);

  return until.getTime() > Date.now();
}
