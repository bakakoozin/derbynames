import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { clubRosterEntriesTable } from "~/db/schema";
import { isPremiumClubManagerEnabled } from "~/utils/feature-flags";

/** Stub listage roster — auth manager / magic link à brancher ultérieurement */
export async function GET(event: APIEvent) {
  if (!isPremiumClubManagerEnabled()) {
    return new Response(null, { status: 404 });
  }

  const clubId = new URL(event.request.url).searchParams.get("clubId")?.trim();
  if (!clubId) {
    return new Response(JSON.stringify({ error: "clubId requis" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(clubRosterEntriesTable)
    .where(eq(clubRosterEntriesTable.clubId, clubId));

  return new Response(JSON.stringify({ items: rows }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
