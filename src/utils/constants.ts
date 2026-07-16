export const API_DERBY = import.meta.env?.VITE_API_DERBY;

export const DERBY_TYPES = ["player", "referee", "coach"] as const;

export type DerbyType = (typeof DERBY_TYPES)[number];

export function isDerbyType(value: unknown): value is DerbyType {
	return typeof value === "string" && DERBY_TYPES.includes(value as DerbyType);
}