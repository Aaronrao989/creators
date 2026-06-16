"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { City, Possession, Property, PropertyKind } from "@/lib/types";
import {
  applyFilters,
  BUILDER_NAMES,
  CITIES,
  KINDS,
  POSSESSIONS,
  type PropertyFilters,
} from "@/lib/data-source";
import { PropertyCard } from "@/components/selection/property-card";
import { CompareBar } from "@/components/selection/compare-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortKey = "recommended" | "price-asc" | "price-desc" | "rating";

const BUDGETS = [
  { label: "Any", value: 0 },
  { label: "Under ₹75 L", value: 75 },
  { label: "Under ₹1.5 Cr", value: 150 },
  { label: "Under ₹4 Cr", value: 400 },
];

export function SelectionView({ initial }: { initial: Property[] }) {
  const [query, setQuery] = React.useState("");
  const [city, setCity] = React.useState<City | "All">("All");
  const [kind, setKind] = React.useState<PropertyKind | "All">("All");
  const [builder, setBuilder] = React.useState<string | "All">("All");
  const [possession, setPossession] = React.useState<Possession | "All">("All");
  const [maxPriceLakh, setMaxPriceLakh] = React.useState(0);
  const [sort, setSort] = React.useState<SortKey>("recommended");
  const [showFilters, setShowFilters] = React.useState(false);

  const filters: PropertyFilters = {
    query,
    city,
    kind,
    builder,
    possession,
    maxPriceLakh: maxPriceLakh || undefined,
  };

  const results = React.useMemo(() => {
    const list = applyFilters(initial, filters);
    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.priceLakh - b.priceLakh);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceLakh - a.priceLakh);
        break;
      case "rating":
        sorted.sort((a, b) => b.builder.rating - a.builder.rating);
        break;
    }
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, query, city, kind, builder, possession, maxPriceLakh, sort]);

  const activeCount =
    (city !== "All" ? 1 : 0) +
    (kind !== "All" ? 1 : 0) +
    (builder !== "All" ? 1 : 0) +
    (possession !== "All" ? 1 : 0) +
    (maxPriceLakh ? 1 : 0);

  const reset = () => {
    setCity("All");
    setKind("All");
    setBuilder("All");
    setPossession("All");
    setMaxPriceLakh(0);
    setQuery("");
  };

  return (
    <div className="container py-10 md:py-14">
      {/* Heading */}
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary dark:text-foreground sm:text-4xl">
          Select properties to compare
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick <strong className="text-foreground">2 to 4</strong> homes and hit
          Compare to see a full side-by-side analysis with a recommendation
          score.
        </p>
      </div>

      {/* Search + sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project, builder or locality…"
            className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none ring-accent/40 transition focus:ring-2"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            className="lg:hidden"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                {activeCount}
              </span>
            )}
          </Button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-12 rounded-xl border border-border bg-card px-3 text-sm outline-none ring-accent/40 focus:ring-2"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Builder rating</option>
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters sidebar */}
        <aside
          className={cn(
            "h-fit rounded-2xl border border-border bg-card p-5 shadow-glass lg:sticky lg:top-20 lg:block",
            showFilters ? "block" : "hidden",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide">
              Filters
            </h2>
            {activeCount > 0 && (
              <button
                onClick={reset}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <FilterGroup
            label="City"
            value={city}
            options={["All", ...CITIES]}
            onChange={(v) => setCity(v as City | "All")}
          />
          <FilterGroup
            label="Property type"
            value={kind}
            options={["All", ...KINDS]}
            onChange={(v) => setKind(v as PropertyKind | "All")}
          />
          <FilterGroup
            label="Builder"
            value={builder}
            options={["All", ...BUILDER_NAMES]}
            onChange={(v) => setBuilder(v)}
          />
          <FilterGroup
            label="Possession"
            value={possession}
            options={["All", ...POSSESSIONS]}
            onChange={(v) => setPossession(v as Possession | "All")}
          />

          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Budget
            </p>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <Chip
                  key={b.label}
                  active={maxPriceLakh === b.value}
                  onClick={() => setMaxPriceLakh(b.value)}
                >
                  {b.label}
                </Chip>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            Showing{" "}
            <strong className="text-foreground">{results.length}</strong>{" "}
            {results.length === 1 ? "property" : "properties"}
          </p>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="font-display text-lg font-bold">No matches</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try widening your filters or clearing the search.
              </p>
              <Button variant="subtle" size="sm" className="mt-4" onClick={reset}>
                Reset filters
              </Button>
            </div>
          ) : (
            <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {results.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <CompareBar />
      <div className="h-24" />
    </div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none ring-accent/40 focus:ring-2"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
