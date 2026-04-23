export type PendingClubPayload = {
  /** Nom affiché du club */
  name: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  logoUrl?: string;
  department?: string;
};

export function parsePendingClubJson(raw: string | null | undefined): PendingClubPayload | null {
  if (!raw || !raw.trim()) return null;
  try {
    const v = JSON.parse(raw) as PendingClubPayload;
    if (typeof v?.name !== 'string' || v.name.trim().length === 0) return null;
    return {
      name: v.name.trim(),
      website: v.website?.trim() || undefined,
      facebookUrl: v.facebookUrl?.trim() || undefined,
      instagramUrl: v.instagramUrl?.trim() || undefined,
      twitterUrl: v.twitterUrl?.trim() || undefined,
      logoUrl: v.logoUrl?.trim() || undefined,
      department: v.department?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

/** Identifiant stable pour un club créé par un utilisateur (après validation email) */
export function makeUserProposedClubId(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 10);
  return base ? `u-${base}-${suffix}` : `u-${suffix}`;
}
