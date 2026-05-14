import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import {
  derbynameRenameHistoryTable,
  derbynamesTable,
  renameHistoryAccessTokensTable,
} from "~/db/schema";

export async function GET(event: APIEvent) {
  try {
    const token = new URL(event.request.url).searchParams.get("token")?.trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "token manquant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb();
    const [access] = await db
      .select()
      .from(renameHistoryAccessTokensTable)
      .where(eq(renameHistoryAccessTokensTable.token, token))
      .limit(1);

    if (!access) {
      return new Response(JSON.stringify({ error: "lien invalide" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const expiresAt = access.expiresAt instanceof Date
      ? access.expiresAt
      : new Date(access.expiresAt as unknown as string);

    if (expiresAt.getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "lien expiré" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rows = await db
      .select()
      .from(derbynameRenameHistoryTable)
      .where(eq(derbynameRenameHistoryTable.email, access.email));

    return new Response(
      JSON.stringify({
        items: rows.map((r) => ({
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

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!emailRaw || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/.test(emailRaw)) {
      return new Response(JSON.stringify({ error: "email invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb();
    const active = await db
      .select()
      .from(derbynamesTable)
      .where(eq(derbynamesTable.email, emailRaw));

    const hasConfirmed = active.some((r) => r.emailConfirmed);
    if (!hasConfirmed) {
      return new Response(
        JSON.stringify({ error: "aucun derbyname confirmé pour cet email" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const randomPart = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const token = Buffer.from(randomPart).toString("base64url");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(renameHistoryAccessTokensTable).values({
      email: emailRaw,
      token,
      expiresAt,
    });

    const base = process.env.FRONTEND_URL || "http://localhost:3000";
    const historyUrl = `${base}/historique?token=${encodeURIComponent(token)}`;

    try {
      await fetch(process.env.EMAIL_API_URL || "", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": process.env.EMAIL_API_KEY || "",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Derbynames",
            email: process.env.EMAIL_FROM || "noreply@derbynames.ovh",
          },
          to: [{ email: emailRaw }],
          subject: "Historique de vos derby names",
          htmlContent: `<p>Bonjour,</p><p>Consultez l'historique de vos anciens derby names :</p><p><a href="${historyUrl}">${historyUrl}</a></p><p>Ce lien expire dans 1 heure.</p>`,
        }),
      });
    } catch (err) {
      console.error("Email historique:", err);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
