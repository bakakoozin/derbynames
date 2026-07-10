import type { APIEvent } from "@solidjs/start/server";
import { and, asc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "~/db";
import { clubsTable, derbynamesTable } from "~/db/schema";
import { DERBY_TYPES, isDerbyType } from "~/utils/constants";
import { submitDerbynameAction } from "~/routes/api/derbynames";
import { confirmDerbynameAction } from "~/routes/api/validate/[token]";
import {
  getRenameHistoryByToken,
  requestRenameHistoryAccess,
} from "~/routes/api/rename-history";

type RpcRequest = {
  method?: unknown;
  params?: unknown;
};

function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeLike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function POST(event: APIEvent) {
  let body: RpcRequest;

  try {
    body = (await event.request.json()) as RpcRequest;
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const method = typeof body.method === "string" ? body.method : "";
  const params = (body.params && typeof body.params === "object")
    ? (body.params as Record<string, unknown>)
    : {};

  if (!method) {
    return json(400, { error: "method_required" });
  }

  try {
    const db = getDb();

    if (method === "meta.getSupportedMethods") {
      return json(200, {
        result: [
          "meta.getSupportedMethods",
          "derbyname.submitAction",
          "derbyname.confirmAction",
          "derbyname.checkAvailability",
          "derbyname.list",
          "clubs.list",
          "renameHistory.requestAccess",
          "renameHistory.listByToken",
          "derbyname.createPlayer",
          "derbyname.createReferee",
          "derbyname.updatePlayerName",
          "derbyname.updateRefereeName",
          "derbyname.updateClub",
        ],
      });
    }

    if (method === "derbyname.submitAction") {
      const response = await submitDerbynameAction(params);
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return json(response.status, {
          error:
            payload && typeof payload === "object" && "error" in payload
              ? (payload as { error?: string }).error || "submit_failed"
              : "submit_failed",
        });
      }

      return json(200, { result: payload });
    }

    if (method === "derbyname.confirmAction") {
      const token = typeof params.token === "string" ? params.token.trim() : "";
      const response = await confirmDerbynameAction(token || undefined);
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return json(response.status, {
          error:
            payload && typeof payload === "object" && "error" in payload
              ? (payload as { error?: string }).error || "confirm_failed"
              : "confirm_failed",
        });
      }

      return json(200, { result: payload });
    }

    if (method === "derbyname.checkAvailability") {
      const derbynameRaw = typeof params.derbyname === "string" ? params.derbyname.trim() : "";
      const derbyTypeRaw = typeof params.type === "string" ? params.type.trim() : DERBY_TYPES[0];

      if (!derbynameRaw) {
        return json(200, { result: { available: true, count: 0 } });
      }
      if (!isDerbyType(derbyTypeRaw)) {
        return json(400, { error: "invalid_type" });
      }

      const derbynameKey = derbynameRaw.toLowerCase();
      const rows = await db
        .select()
        .from(derbynamesTable)
        .where(
          and(
            sql`lower(${derbynamesTable.derbyname}) = ${derbynameKey}`,
            eq(derbynamesTable.derbyType, derbyTypeRaw),
            eq(derbynamesTable.emailConfirmed, true),
          ),
        );

      return json(200, {
        result: {
          available: rows.length === 0,
          count: rows.length,
        },
      });
    }

    if (method === "derbyname.list") {
      const clubIdFilter = typeof params.clubId === "string" ? params.clubId.trim() : "";
      const departmentFilter = typeof params.department === "string" ? params.department.trim() : "";
      const derbyTypeFilterRaw = typeof params.type === "string" ? params.type.trim() : "";
      const derbyTypeFilter = derbyTypeFilterRaw ? (isDerbyType(derbyTypeFilterRaw) ? derbyTypeFilterRaw : null) : null;

      if (derbyTypeFilterRaw && !derbyTypeFilter) {
        return json(400, { error: "invalid_type" });
      }

      const conditions: SQL[] = [eq(derbynamesTable.emailConfirmed, true)];

      if (clubIdFilter && clubIdFilter !== "all") {
        conditions.push(eq(derbynamesTable.clubId, clubIdFilter));
      }
      if (departmentFilter && departmentFilter !== "all") {
        conditions.push(eq(clubsTable.department, departmentFilter));
      }
      if (derbyTypeFilter) {
        conditions.push(eq(derbynamesTable.derbyType, derbyTypeFilter));
      }

      const rows = await db
        .select({
          derbyname: derbynamesTable.derbyname,
          derbyType: derbynamesTable.derbyType,
          numRoster: derbynamesTable.numRoster,
          clubId: derbynamesTable.clubId,
          clubName: clubsTable.name,
          parentClubId: clubsTable.parentClubId,
          parentClubName: sql`${sql.raw(`parent_clubs.name`)}`.mapWith(String),
          department: clubsTable.department,
        })
        .from(derbynamesTable)
        .leftJoin(clubsTable, eq(derbynamesTable.clubId, clubsTable.id))
        .leftJoin(
          clubsTable.as('parent_clubs'),
          eq(clubsTable.parentClubId, clubsTable.as('parent_clubs').id),
        )
        .where(and(...conditions))
        .orderBy(asc(derbynamesTable.derbyname));

      return json(200, {
        result: rows.map((row) => ({
          derbyname: row.derbyname,
          derbyType: row.derbyType,
          numRoster: row.numRoster,
          clubId: row.clubId || null,
          clubName: row.clubName || null,
          department: row.department || null,
        })),
      });
    }

    if (method === "clubs.list") {
      const q = typeof params.q === "string" ? params.q.trim() : "";

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

      return json(200, { result });
    }

    // ── CQRS commands ──────────────────────────────────────────────────────────

    if (method === "derbyname.createPlayer") {
      const response = await submitDerbynameAction({ ...params, type: "player", clubOnly: false });
      const payload = await response.json().catch(() => null);
      if (!response.ok) return json(response.status, { error: (payload as any)?.error ?? "create_player_failed" });
      return json(200, { result: payload });
    }

    if (method === "derbyname.createReferee") {
      const response = await submitDerbynameAction({ ...params, type: "referee", clubOnly: false });
      const payload = await response.json().catch(() => null);
      if (!response.ok) return json(response.status, { error: (payload as any)?.error ?? "create_referee_failed" });
      return json(200, { result: payload });
    }

    if (method === "derbyname.updatePlayerName") {
      const response = await submitDerbynameAction({ ...params, type: "player", clubOnly: false });
      const payload = await response.json().catch(() => null);
      if (!response.ok) return json(response.status, { error: (payload as any)?.error ?? "update_player_failed" });
      return json(200, { result: payload });
    }

    if (method === "derbyname.updateRefereeName") {
      const response = await submitDerbynameAction({ ...params, type: "referee", clubOnly: false });
      const payload = await response.json().catch(() => null);
      if (!response.ok) return json(response.status, { error: (payload as any)?.error ?? "update_referee_failed" });
      return json(200, { result: payload });
    }

    if (method === "derbyname.updateClub") {
      const derbyTypeRaw = typeof params.derbyType === "string" ? params.derbyType.trim() : "";
      if (!isDerbyType(derbyTypeRaw)) return json(400, { error: "invalid_type" });
      const response = await submitDerbynameAction({ ...params, type: derbyTypeRaw, clubOnly: true });
      const payload = await response.json().catch(() => null);
      if (!response.ok) return json(response.status, { error: (payload as any)?.error ?? "update_club_failed" });
      return json(200, { result: payload });
    }

    // ── Legacy / history ───────────────────────────────────────────────────────

    if (method === "renameHistory.requestAccess") {
      const email = typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
      const response = await requestRenameHistoryAccess(email);
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return json(response.status, {
          error:
            payload && typeof payload === "object" && "error" in payload
              ? (payload as { error?: string }).error || "rename_history_request_failed"
              : "rename_history_request_failed",
        });
      }

      return json(200, { result: payload });
    }

    if (method === "renameHistory.listByToken") {
      const token = typeof params.token === "string" ? params.token.trim() : "";
      const response = await getRenameHistoryByToken(token || undefined);
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return json(response.status, {
          error:
            payload && typeof payload === "object" && "error" in payload
              ? (payload as { error?: string }).error || "rename_history_list_failed"
              : "rename_history_list_failed",
        });
      }

      return json(200, { result: payload });
    }

    return json(404, { error: "method_not_found" });
  } catch (error) {
    console.error("RPC error", error);
    return json(500, { error: "internal_error" });
  }
}
