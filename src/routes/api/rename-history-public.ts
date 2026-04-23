import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { derbynameRenameHistoryTable } from "~/db/schema";

type RenameRow = typeof derbynameRenameHistoryTable.$inferSelect;

/**
 * Chaîne publique de renommages pour un même numéro de roster :
 * lignes reliées au derbyname demandé par old/new (transitif).
 */
export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const derbynameRaw = url.searchParams.get("derbyname")?.trim();
    const numRosterRaw = url.searchParams.get("numRoster")?.trim();

    if (!derbynameRaw || !numRosterRaw) {
      return new Response(JSON.stringify({ error: "derbyname et numRoster requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb();
    const allRows = await db
      .select()
      .from(derbynameRenameHistoryTable)
      .where(eq(derbynameRenameHistoryTable.numRoster, numRosterRaw));

    const norm = (s: string) => s.trim().toLowerCase();
    const seed = norm(derbynameRaw);
    const names = new Set<string>([seed]);
    const collected: RenameRow[] = [];
    const seenIds = new Set<number>();

    let progress = true;
    while (progress) {
      progress = false;
      for (const r of allRows) {
        const id = r.id;
        if (seenIds.has(id)) continue;
        const o = norm(r.oldDerbyname);
        const n = norm(r.newDerbyname);
        if (names.has(o) || names.has(n)) {
          seenIds.add(id);
          collected.push(r);
          names.add(o);
          names.add(n);
          progress = true;
        }
      }
    }

    collected.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt as unknown as string).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt as unknown as string).getTime() : 0;
      return tb - ta;
    });

    return new Response(
      JSON.stringify({
        items: collected.map((r) => ({
          oldDerbyname: r.oldDerbyname,
          newDerbyname: r.newDerbyname,
          numRoster: r.numRoster,
          clubId: r.clubId,
          createdAt: r.createdAt,
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e: unknown) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
