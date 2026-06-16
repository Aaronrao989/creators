import { properties as localProperties, propertyById } from "@/data/properties";
import type { City, Possession, Property, PropertyKind } from "@/lib/types";

/**
 * Data-layer seam.
 *
 * The UI talks ONLY to this `PropertyDataSource` interface. Today it is backed by
 * the local dummy dataset (`LocalDataSource`). To move to the live CMS later,
 * implement `WordPressDataSource` against the same interface and swap the export
 * in `getDataSource()` — no UI component changes required.
 *
 *   UI  ──►  PropertyDataSource  ──►  Local | WordPress | Custom API
 */

export interface PropertyFilters {
  query?: string;
  city?: City | "All";
  kind?: PropertyKind | "All";
  builder?: string | "All";
  possession?: Possession | "All";
  /** Max starting price in INR lakhs. */
  maxPriceLakh?: number;
}

export interface PropertyDataSource {
  list(filters?: PropertyFilters): Promise<Property[]>;
  get(id: string): Promise<Property | undefined>;
  getMany(ids: string[]): Promise<Property[]>;
}

class LocalDataSource implements PropertyDataSource {
  async list(filters?: PropertyFilters): Promise<Property[]> {
    return applyFilters(localProperties, filters);
  }
  async get(id: string): Promise<Property | undefined> {
    return propertyById(id);
  }
  async getMany(ids: string[]): Promise<Property[]> {
    return ids
      .map((id) => propertyById(id))
      .filter((p): p is Property => Boolean(p));
  }
}

/**
 * Pure, synchronous filter used by both the data source and client components
 * (which already hold the full list in memory for instant filtering).
 */
export function applyFilters(
  list: Property[],
  filters?: PropertyFilters,
): Property[] {
  if (!filters) return list;
  const q = filters.query?.trim().toLowerCase();
  return list.filter((p) => {
    if (q) {
      const hay =
        `${p.name} ${p.builder.name} ${p.locality} ${p.city} ${p.configs}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.city && filters.city !== "All" && p.city !== filters.city)
      return false;
    if (filters.kind && filters.kind !== "All" && p.kind !== filters.kind)
      return false;
    if (
      filters.builder &&
      filters.builder !== "All" &&
      p.builder.name !== filters.builder
    )
      return false;
    if (
      filters.possession &&
      filters.possession !== "All" &&
      p.possession !== filters.possession
    )
      return false;
    if (filters.maxPriceLakh && p.priceLakh > filters.maxPriceLakh) return false;
    return true;
  });
}

let instance: PropertyDataSource | null = null;

/** Returns the active data source. Swap implementation here for WordPress. */
export function getDataSource(): PropertyDataSource {
  if (!instance) instance = new LocalDataSource();
  return instance;
}

/* ---- derived option lists for filter UI (from the local set) ------------- */
export const CITIES: City[] = [
  "Noida",
  "Greater Noida",
  "Greater Noida West",
  "Gurugram",
  "Delhi",
];
export const KINDS: PropertyKind[] = ["Apartment", "Villa", "Plot", "Builder Floor"];
export const POSSESSIONS: Possession[] = [
  "Ready to Move",
  "Under Construction",
  "New Launch",
];
export const BUILDER_NAMES = Array.from(
  new Set(localProperties.map((p) => p.builder.name)),
).sort();
