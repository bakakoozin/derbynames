import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { derbynamesTable, historyTable } from "~/db/schema";

export async function GET({ params: { token } }: APIEvent) {
  if (!token) {
    return new Response(JSON.stringify({ error: "token manquant" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const db = getDb();

    const [entry] = await db
      .select()
      .from(derbynamesTable)
      .where(eq(derbynamesTable.emailToken, token))
      .limit(1);

    if (!entry) {
      return new Response(JSON.stringify({ error: "token invalide" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const rawExpires = entry.emailTokenExpiresAt as unknown as Date | string | null;

    let expiresAt: Date | null = null;
    if (rawExpires instanceof Date) {
      expiresAt = rawExpires;
    } else if (rawExpires) {
      expiresAt = new Date(rawExpires);
    }

    if (!expiresAt || expiresAt.getTime() < now.getTime()) {
      return new Response(JSON.stringify({ error: "token expiré" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mettre à jour le derbyname comme confirmé
    await db
      .update(derbynamesTable)
      .set({
        emailConfirmed: true,
        emailToken: null,
        emailTokenExpiresAt: null,
      })
      .where(eq(derbynamesTable.derbyname, entry.derbyname));

    // Enregistrer dans l'historique
    await db.insert(historyTable).values({
      derbyname: entry.derbyname,
      action: "email_confirmed",
      field: "emailConfirmed",
      oldValue: String(entry.emailConfirmed ?? false),
      newValue: "true",
      changedBy: entry.email,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        derbyname: entry.derbyname,
        email: entry.email,
        emailConfirmed: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error validating token:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur serveur" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
