/**
 * Domain model for the Creators Home comparison platform.
 *
 * These interfaces are the single contract between the UI and the data layer.
 * Today they are fed by the local dummy dataset (`/data/properties.ts`); later a
 * WordPress / custom REST adapter can satisfy the exact same shapes without any
 * UI changes (see `/lib/data-source.ts`).
 */

export type Possession = "Ready to Move" | "Under Construction" | "New Launch";

export type PropertyKind = "Apartment" | "Villa" | "Plot" | "Builder Floor";

export type City =
  | "Noida"
  | "Greater Noida"
  | "Greater Noida West"
  | "Gurugram"
  | "Delhi";

/** A real-estate developer / builder. */
export interface Builder {
  id: string;
  name: string;
  /** 0–5 market reputation rating. */
  rating: number;
  /** Years of operation — used as a soft trust signal. */
  established: number;
  /** Number of delivered projects. */
  deliveredProjects: number;
  logoColor: string;
}

/** A single amenity flag with display metadata. */
export interface Amenity {
  key: AmenityKey;
  label: string;
  /** Whether the project offers it. */
  available: boolean;
}

export type AmenityKey =
  | "pool"
  | "gym"
  | "clubhouse"
  | "security"
  | "sports"
  | "kidsArea"
  | "coworking"
  | "powerBackup";

/** Distance-to-key-landmark metrics (kilometres). */
export interface LocationMetrics {
  metroKm: number;
  hospitalKm: number;
  schoolKm: number;
  airportKm: number;
  /** 0–100 walkability / connectivity convenience index. */
  connectivityIndex: number;
}

/** Investment signals used by the rule-based recommendation engine. */
export interface InvestmentMetrics {
  /** Expected annual appreciation, percent (mid-point used for scoring). */
  appreciationPct: number;
  /** Gross rental yield, percent. */
  rentalYieldPct: number;
  /** 0–100 demand / liquidity index. */
  demandIndex: number;
}

/** Persona suitability tags. */
export type BestForTag = "Families" | "Investors" | "Luxury Buyers" | "Rental Income";

export interface FloorPlan {
  config: string; // e.g. "2 BHK"
  areaSqFt: number;
  priceLabel: string;
  image: string;
}

/** The core property entity. */
export interface Property {
  id: string;
  name: string;
  subtitle: string;
  builder: Builder;
  city: City;
  locality: string;
  kind: PropertyKind;
  configs: string; // e.g. "2 / 3 BHK"
  possession: Possession;
  possessionDate: string;
  reraId: string;
  /** Starting price in INR lakhs (1 Cr = 100 lakhs). */
  priceLakh: number;
  pricePerSqFt: number;
  priceRangeLabel: string;
  /** Total project land area in acres (shown in Quick Overview). */
  areaAcres: number;
  /** Number of towers (0 for villa/plotted projects). */
  towers: number;
  image: string;
  /** Tailwind-friendly gradient stops for the card fallback / accent. */
  gradient: [string, string];
  amenities: Record<AmenityKey, boolean>;
  location: LocationMetrics;
  investment: InvestmentMetrics;
  floorPlans: FloorPlan[];
  highlights: string[];
}

/** A user/visitor review of a property. */
export interface PropertyReview {
  id: string;
  propertyId: string;
  authorName: string;
  /** 1–5 stars. */
  rating: number;
  comment: string;
  createdAt: string; // ISO timestamp
}

/** A user's saved comparison (a named set of properties). */
export interface SavedComparison {
  id: string;
  name: string | null;
  propertyIds: string[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Comparison / scoring outputs                                        */
/* ------------------------------------------------------------------ */

export type ScoreFactorKey =
  | "price"
  | "amenities"
  | "location"
  | "builder"
  | "investment";

export interface ScoreBreakdown {
  key: ScoreFactorKey;
  label: string;
  /** Weight applied to this factor (0–1). */
  weight: number;
  /** Normalised 0–100 sub-score for this property on this factor. */
  value: number;
  /** Weighted contribution to the overall score. */
  contribution: number;
}

export interface PropertyScore {
  propertyId: string;
  overall: number; // 0–100 weighted recommendation score
  investmentScore: number; // 0–100 investment-only score
  breakdown: ScoreBreakdown[];
  bestFor: BestForTag[];
}

/** Output of the comparison engine for a selected set of properties. */
export interface ComparisonResult {
  properties: Property[];
  scores: Record<string, PropertyScore>;
  ranking: string[]; // property ids, best → worst by overall score
  bestValueId: string;
  bestLuxuryId: string;
  bestFamilyId: string;
  bestInvestmentId: string;
}
