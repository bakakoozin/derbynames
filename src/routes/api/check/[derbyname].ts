import type { APIEvent } from "@solidjs/start/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "~/db";
import { derbynamesTable } from "~/db/schema";
import { DERBY_TYPES, isDerbyType } from "~/utils/constants";

export async function GET(event: APIEvent) {
  const { derbyname } = event.params;
  const db = getDb();
  const derbynameKey = derbyname?.trim().toLowerCase() ?? "";
  const typeRaw = new URL(event.request.url).searchParams.get("type")?.trim();
  const derbyType = typeRaw ? (isDerbyType(typeRaw) ? typeRaw : null) : DERBY_TYPES[0];

  if (!derbynameKey) {
    return new Response(JSON.stringify({ count: 0 }), {
      headers: {
        "Content-Type": "application/json",
      }
    });
  }

  if (!derbyType) {
    return new Response(JSON.stringify({ error: "type invalide" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      }
    });
  }

  const dn = await db
    .select()
    .from(derbynamesTable)
    .where(
      and(
        sql`lower(${derbynamesTable.derbyname}) = ${derbynameKey}`,
        eq(derbynamesTable.derbyType, derbyType),
        eq(derbynamesTable.emailConfirmed, true),
      ),
    );
  return new Response(JSON.stringify({ count: dn.length }), {
    headers: {
      "Content-Type": "application/json",
    }
  });
}