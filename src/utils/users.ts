import { eq } from "drizzle-orm";
import { usersTable } from "~/db/schema";

/** Returns an existing user id for email, or creates the user and returns the new id. */
export async function ensureUserIdByEmail(db: any, email: string): Promise<number> {
  const normalized = email.trim().toLowerCase();

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalized))
    .limit(1);

  if (existing?.id != null) {
    return existing.id;
  }

  await db.insert(usersTable).values({ email: normalized });

  const [created] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalized))
    .limit(1);

  if (created?.id == null) {
    throw new Error("impossible de créer/récupérer l'utilisateur");
  }

  return created.id;
}
