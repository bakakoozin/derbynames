import type { APIEvent } from "@solidjs/start/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "~/db";
import { derbynamesTable } from "~/db/schema";

export async function GET({ params: { derbyname } }: APIEvent) {
  const db = getDb();
  const derbynameKey = derbyname?.trim().toLowerCase() ?? "";

  if (!derbynameKey) {
    return new Response(JSON.stringify({ count: 0 }), {
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
        eq(derbynamesTable.emailConfirmed, true),
      ),
    );
  return new Response(JSON.stringify({ count: dn.length }), {
    headers: {
      "Content-Type": "application/json",
    }
  });
}