import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { derbynamesTable } from "~/db/schema";
import { isPremiumBadgesEnabled } from "~/utils/feature-flags";
import { derbynameHasPremiumBadgeAccess } from "~/utils/premium-access";

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export async function GET({ params }: APIEvent) {
  const key = params.derbyname?.trim().toLowerCase();
  if (!key) {
    return new Response(null, { status: 400 });
  }

  if (!isPremiumBadgesEnabled()) {
    return new Response(null, { status: 404 });
  }

  const allowed = await derbynameHasPremiumBadgeAccess(key);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "premium requis" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(derbynamesTable)
    .where(eq(derbynamesTable.derbyname, key))
    .limit(1);

  const label = escapeXml(row?.name || key);
  const num = escapeXml(row?.numRoster || "—");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e3a5f"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" rx="16" fill="url(#g)" stroke="#38bdf8" stroke-width="4"/>
  <text x="160" y="52" text-anchor="middle" fill="#e2e8f0" font-family="system-ui,sans-serif" font-size="14" letter-spacing="0.08em">DERBY NAME</text>
  <text x="160" y="108" text-anchor="middle" fill="#f8fafc" font-family="Georgia,serif" font-size="36" font-weight="700">${label}</text>
  <text x="160" y="142" text-anchor="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="18">#${num}</text>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
