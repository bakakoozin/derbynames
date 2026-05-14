import type { APIEvent } from "@solidjs/start/server";
import { getDb } from "~/db";
import { clubAccessRequestsTable } from "~/db/schema";
import { isPremiumClubManagerEnabled } from "~/utils/feature-flags";

export async function POST(event: APIEvent) {
  if (!isPremiumClubManagerEnabled()) {
    return new Response(null, { status: 404 });
  }

  try {
    const body = await event.request.json();
    const clubId = typeof body.clubId === "string" ? body.clubId.trim() : "";
    const requesterEmail =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!clubId || !requesterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) {
      return new Response(JSON.stringify({ error: "données invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb();
    const note =
      typeof body.message === "string" && body.message.trim().length > 0
        ? body.message.trim().slice(0, 2000)
        : null;

    await db.insert(clubAccessRequestsTable).values({
      clubId,
      requesterEmail,
      status: "pending",
      adminNote: note,
    });

    return new Response(JSON.stringify({ ok: true, received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    console.error(e);
    return new Response(JSON.stringify({ error: "erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
