import type { City, Possession, PropertyKind } from "@/lib/types";

/**
 * Pure, dependency-free constants safe to import from BOTH client and server.
 * (Kept out of `data-source.ts` so client components don't pull the Prisma
 * client into their bundle.)
 */

export const CITIES: City[] = [
  "Noida",
  "Greater Noida",
  "Greater Noida West",
  "Gurugram",
  "Delhi",
];

export const KINDS: PropertyKind[] = [
  "Apartment",
  "Villa",
  "Plot",
  "Builder Floor",
];

export const POSSESSIONS: Possession[] = [
  "Ready to Move",
  "Under Construction",
  "New Launch",
];

/** Comparison selection limits (shared by UI store and backend services). */
export const MIN_COMPARE = 2;
export const MAX_COMPARE = 4;
