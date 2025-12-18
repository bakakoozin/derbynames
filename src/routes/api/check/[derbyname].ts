import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { derbynamesTable } from "~/db/schema";

export async function GET({ params: { derbyname } }: APIEvent) {
  const db = getDb();
  const dn = await db.select().from(derbynamesTable).where(eq(derbynamesTable.derbyname, derbyname));
  return new Response(JSON.stringify({ count: dn.length }), {
    headers: {
      "Content-Type": "application/json",
    }
  });
}