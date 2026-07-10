import type { APIEvent } from "@solidjs/start/server";
import { like, or } from "drizzle-orm";
import { getDb } from "~/db";
import { clubsTable } from "~/db/schema";

function escapeLike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function GET(event: APIEvent) {
  try {
    const db = getDb();
    const url = new URL(event.request.url);
    const q = url.searchParams.get("q")?.trim() ?? "";

    let rows = await db.select().from(clubsTable);

    if (q.length > 0) {
      const pattern = `%${escapeLike(q)}%`;
      rows = await db
        .select()
        .from(clubsTable)
        .where(or(like(clubsTable.name, pattern), like(clubsTable.id, pattern)));
    }

    const result = rows
      .map((club) => ({
        id: club.id,
        name: club.name,
        parentClubId: club.parentClubId ?? null,
        website: club.website ?? null,
        facebookUrl: club.facebookUrl ?? null,
        instagramUrl: club.instagramUrl ?? null,
        twitterUrl: club.twitterUrl ?? null,
        logoUrl: club.logoUrl ?? null,
        department: club.department ?? null,
        source: club.source ?? null,
      }))
      .sort((a, b) => {
        if (a.id === "autre") return -1;
        if (b.id === "autre") return 1;
        return a.name.localeCompare(b.name);
      });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching clubs:", error);
    const fallback = [{ id: "autre", name: "=== AUTRE ===" }];
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
