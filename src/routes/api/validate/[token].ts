import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import {
  clubsTable,
  derbynamesTable,
  derbynameRenameHistoryTable,
  historyTable,
} from "~/db/schema";
import { makeUserProposedClubId, parsePendingClubJson } from "~/utils/pending-club";

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

    let resolvedClubId = entry.clubId;
    const rawPending = entry.pendingClubJson?.trim();

    if (rawPending) {
      let parsedJson: Record<string, unknown> | null = null;
      try {
        parsedJson = JSON.parse(rawPending) as Record<string, unknown>;
      } catch {
        parsedJson = null;
      }

      let clubChangeParsed: {
        existingClubId?: string;
        newClubPayload?: NonNullable<ReturnType<typeof parsePendingClubJson>>;
      } | null = null;

      if (parsedJson?.clubChangeOnly === true) {
        if (typeof parsedJson.existingClubId === "string" && parsedJson.existingClubId.trim()) {
          clubChangeParsed = { existingClubId: parsedJson.existingClubId.trim() };
        } else if (parsedJson.newClub && typeof parsedJson.newClub === "object") {
          const nested = parsePendingClubJson(JSON.stringify(parsedJson.newClub));
          if (nested) clubChangeParsed = { newClubPayload: nested };
        }
        if (!clubChangeParsed?.existingClubId && !clubChangeParsed?.newClubPayload) {
          return new Response(
            JSON.stringify({ error: "demande de changement de club invalide" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      if (clubChangeParsed?.existingClubId) {
        resolvedClubId = clubChangeParsed.existingClubId;
      } else if (clubChangeParsed?.newClubPayload) {
        const pending = clubChangeParsed.newClubPayload;
        const newClubId = makeUserProposedClubId(pending.name);
        await db.insert(clubsTable).values({
          id: newClubId,
          name: pending.name,
          website: pending.website ?? null,
          facebookUrl: pending.facebookUrl ?? null,
          instagramUrl: pending.instagramUrl ?? null,
          twitterUrl: pending.twitterUrl ?? null,
          logoUrl: pending.logoUrl ?? null,
          department: pending.department ?? null,
          source: "user_proposed",
        }).onDuplicateKeyUpdate({
          set: {
            name: pending.name,
            website: pending.website ?? null,
            facebookUrl: pending.facebookUrl ?? null,
            instagramUrl: pending.instagramUrl ?? null,
            twitterUrl: pending.twitterUrl ?? null,
            logoUrl: pending.logoUrl ?? null,
            department: pending.department ?? null,
            updatedAt: new Date(),
          },
        });
        resolvedClubId = newClubId;
      } else if (!parsedJson?.clubChangeOnly) {
        const pending = parsePendingClubJson(rawPending);
        if (pending) {
          const newClubId = makeUserProposedClubId(pending.name);
          await db.insert(clubsTable).values({
            id: newClubId,
            name: pending.name,
            website: pending.website ?? null,
            facebookUrl: pending.facebookUrl ?? null,
            instagramUrl: pending.instagramUrl ?? null,
            twitterUrl: pending.twitterUrl ?? null,
            logoUrl: pending.logoUrl ?? null,
            department: pending.department ?? null,
            source: "user_proposed",
          }).onDuplicateKeyUpdate({
            set: {
              name: pending.name,
              website: pending.website ?? null,
              facebookUrl: pending.facebookUrl ?? null,
              instagramUrl: pending.instagramUrl ?? null,
              twitterUrl: pending.twitterUrl ?? null,
              logoUrl: pending.logoUrl ?? null,
              department: pending.department ?? null,
              updatedAt: new Date(),
            },
          });
          resolvedClubId = newClubId;
        }
      }
    }

    if (entry.replacesDerbyname) {
      const oldDn = entry.replacesDerbyname.trim();
      if (oldDn.toLowerCase() !== entry.derbyname.trim().toLowerCase()) {
        const [oldRow] = await db
          .select()
          .from(derbynamesTable)
          .where(eq(derbynamesTable.derbyname, oldDn))
          .limit(1);

        await db.insert(derbynameRenameHistoryTable).values({
          email: entry.email,
          oldDerbyname: oldDn,
          newDerbyname: entry.derbyname,
          numRoster: oldRow?.numRoster ?? entry.numRoster,
          clubId: oldRow?.clubId ?? resolvedClubId,
        });

        await db.delete(derbynamesTable).where(eq(derbynamesTable.derbyname, oldDn));
      }
    }

    await db
      .update(derbynamesTable)
      .set({
        emailConfirmed: true,
        emailToken: null,
        emailTokenExpiresAt: null,
        pendingClubJson: null,
        replacesDerbyname: null,
        clubId: resolvedClubId ?? null,
      })
      .where(eq(derbynamesTable.derbyname, entry.derbyname));

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
