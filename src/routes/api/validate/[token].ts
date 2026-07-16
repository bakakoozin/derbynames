import type { APIEvent } from "@solidjs/start/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "~/db";
import {
  actionsTable,
  clubsTable,
  derbynamesTable,
  derbynameRenameHistoryTable,
  historyTable,
} from "~/db/schema";
import { makeUserProposedClubId, parsePendingClubJson } from "~/utils/pending-club";

export async function GET({ params: { token } }: APIEvent) {
  return confirmDerbynameAction(token);
}

export async function confirmDerbynameAction(token: string | undefined): Promise<Response> {
  if (!token) {
    return new Response(JSON.stringify({ error: "token manquant" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const db = getDb();

    const [action] = await db
      .select({
        id: actionsTable.id,
        status: actionsTable.status,
        expiresAt: actionsTable.expiresAt,
        payload: actionsTable.payload,
      })
      .from(actionsTable)
      .where(
        and(
          eq(actionsTable.token, token),
          eq(actionsTable.actionType, "derbyname.confirm"),
        ),
      )
      .limit(1);

    if (action?.status === "completed" || action?.status === "cancelled") {
      return new Response(JSON.stringify({ error: "token invalide" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!action) {
      return new Response(JSON.stringify({ error: "token invalide" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const actionExpires = action?.expiresAt instanceof Date
      ? action.expiresAt
      : action?.expiresAt
        ? new Date(action.expiresAt as unknown as string)
        : null;

    if (!actionExpires || actionExpires.getTime() < now.getTime() || action.status === "expired") {
      await db
        .update(actionsTable)
        .set({
          status: "expired",
          completedAt: new Date(),
        })
        .where(and(eq(actionsTable.id, action.id), eq(actionsTable.status, "pending")));

      return new Response(JSON.stringify({ error: "token expiré" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let derbynameKey = "";
    let derbyTypeKey = "";
    let actionPendingClubJson: string | null = null;
    let actionReplacesDerbyname: string | null = null;
    let actionClubOnly = false;

    try {
      const parsed = action.payload ? JSON.parse(action.payload) as {
        derbyname?: string;
        derbyType?: string;
        pendingClubJson?: string | null;
        replacesDerbyname?: string | null;
        clubOnly?: boolean;
      } : {};
      derbynameKey = typeof parsed.derbyname === "string" ? parsed.derbyname.trim() : "";
      derbyTypeKey = typeof parsed.derbyType === "string" ? parsed.derbyType.trim() : "";
      actionPendingClubJson =
        typeof parsed.pendingClubJson === "string" ? parsed.pendingClubJson : null;
      actionReplacesDerbyname =
        typeof parsed.replacesDerbyname === "string" ? parsed.replacesDerbyname.trim() : null;
      actionClubOnly = parsed.clubOnly === true;
    } catch {
      derbynameKey = "";
      derbyTypeKey = "";
      actionPendingClubJson = null;
      actionReplacesDerbyname = null;
      actionClubOnly = false;
    }

    if (!derbynameKey || !derbyTypeKey) {
      await db
        .update(actionsTable)
        .set({
          status: "cancelled",
          completedAt: new Date(),
        })
        .where(and(eq(actionsTable.id, action.id), eq(actionsTable.status, "pending")));

      return new Response(JSON.stringify({ error: "token invalide" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [entry] = await db
      .select()
      .from(derbynamesTable)
      .where(
        and(
          eq(derbynamesTable.derbyname, derbynameKey),
          eq(derbynamesTable.derbyType, derbyTypeKey),
          // clubOnly : on cherche la ligne déjà confirmée ; sinon on cherche la ligne en attente
          eq(derbynamesTable.emailConfirmed, actionClubOnly),
        ),
      )
      .limit(1);

    if (!entry) {
      await db
        .update(actionsTable)
        .set({
          status: "cancelled",
          completedAt: new Date(),
        })
        .where(and(eq(actionsTable.id, action.id), eq(actionsTable.status, "pending")));

      return new Response(JSON.stringify({ error: "token invalide" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    let resolvedClubId = entry.clubId;
    const rawPending = actionPendingClubJson?.trim() || "";

    if (rawPending.length > 0) {
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
          parentClubId: pending.parentClubId ?? null,
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
            parentClubId: pending.parentClubId ?? null,
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
            parentClubId: pending.parentClubId ?? null,
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
              parentClubId: pending.parentClubId ?? null,
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

    if (actionReplacesDerbyname) {
      const oldDn = actionReplacesDerbyname.trim();
      if (oldDn.toLowerCase() !== entry.derbyname.trim().toLowerCase()) {
        const [oldRow] = await db
          .select()
          .from(derbynamesTable)
          .where(
            and(
              eq(derbynamesTable.derbyname, oldDn),
              eq(derbynamesTable.derbyType, entry.derbyType),
            ),
          )
          .limit(1);

        await db.insert(derbynameRenameHistoryTable).values({
          email: entry.email,
          derbyType: entry.derbyType,
          oldDerbyname: oldDn,
          newDerbyname: entry.derbyname,
          numRoster: oldRow?.numRoster ?? entry.numRoster,
          clubId: oldRow?.clubId ?? resolvedClubId,
        });

        await db
          .delete(derbynamesTable)
          .where(
            and(
              eq(derbynamesTable.derbyname, oldDn),
              eq(derbynamesTable.derbyType, entry.derbyType),
            ),
          );
      }
    }

    await db
      .update(derbynamesTable)
      .set({
        emailConfirmed: true,
        clubId: resolvedClubId ?? null,
      })
      .where(
        and(
          eq(derbynamesTable.derbyname, entry.derbyname),
          eq(derbynamesTable.derbyType, entry.derbyType),
        ),
      );

    await db.insert(historyTable).values({
      derbyname: entry.derbyname,
      action: "email_confirmed",
      field: "emailConfirmed",
      oldValue: String(entry.emailConfirmed ?? false),
      newValue: "true",
      changedBy: entry.email,
    });

    await db
      .update(actionsTable)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(and(eq(actionsTable.token, token), eq(actionsTable.status, "pending")));

    return new Response(
      JSON.stringify({
        ok: true,
        derbyname: entry.derbyname,
        email: entry.email,
        derbyType: entry.derbyType,
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
