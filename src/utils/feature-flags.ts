/**
 * Variables d'environnement : FEATURE_PREMIUM_CLUB_MANAGER, FEATURE_PREMIUM_BADGES (1/true = activé).
 */

function truthy(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

export function isPremiumClubManagerEnabled(): boolean {
  return truthy(process.env.FEATURE_PREMIUM_CLUB_MANAGER);
}

export function isPremiumBadgesEnabled(): boolean {
  return truthy(process.env.FEATURE_PREMIUM_BADGES);
}

export function getPublicFeatureFlags(): {
  premiumClubManager: boolean;
  premiumBadges: boolean;
} {
  return {
    premiumClubManager: isPremiumClubManagerEnabled(),
    premiumBadges: isPremiumBadgesEnabled(),
  };
}
