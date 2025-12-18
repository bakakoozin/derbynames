import { getDb } from "~/db";
import { clubsTable } from "~/db/schema";

export async function GET() {
  try {
    const db = getDb();
    const clubs = await db.select().from(clubsTable);

    const result = [
      ...clubs.map(club => ({
        id: club.id,
        name: club.name,
      }))
    ].sort((a, b) => {
      if (a.id === 'autre') return -1;
      if (b.id === 'autre') return 1;
      return a.name.localeCompare(b.name);
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error fetching clubs:", error);
    const fallback = [{ id: 'autre', name: '=== AUTRE ===' }];
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

