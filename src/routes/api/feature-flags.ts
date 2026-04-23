import { getPublicFeatureFlags } from "~/utils/feature-flags";

export async function GET() {
  return new Response(JSON.stringify(getPublicFeatureFlags()), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
