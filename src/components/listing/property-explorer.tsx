"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  ChevronDown,
  GitCompareArrows,
  Headset,
  Heart,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import type { AmenityKey, City, Possession, Property } from "@/lib/types";
import { CITIES, POSSESSIONS } from "@/lib/constants";
import { MIN_COMPARE, useComparison } from "@/store/comparison";
import { useAuth } from "@/store/auth";
import { useMounted } from "@/lib/use-mounted";
import { CompareBar } from "@/components/selection/compare-bar";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/ui/cover-image";
import { cn, formatPriceLakh } from "@/lib/utils";

const BHK_OPTS = [1, 2, 3, 4];
const BUDGETS: { label: string; test: (p: Property) => boolean }[] = [
  { label: "Under ₹50 L", test: (p) => p.priceLakh < 50 },
  { label: "₹50 L - ₹1 Cr", test: (p) => p.priceLakh >= 50 && p.priceLakh < 100 },
  { label: "₹1 Cr - ₹2 Cr", test: (p) => p.priceLakh >= 100 && p.priceLakh < 200 },
  { label: "Above ₹2 Cr", test: (p) => p.priceLakh >= 200 },
];
// Filter by max unit size (super area, sq.ft) across a project's configs.
const maxArea = (p: Property) =>
  p.floorPlans.length ? Math.max(...p.floorPlans.map((f) => f.areaSqFt)) : 0;
const AREAS: { label: string; test: (p: Property) => boolean }[] = [
  { label: "Under 1,000", test: (p) => maxArea(p) < 1000 },
  { label: "1,000 - 1,500", test: (p) => maxArea(p) >= 1000 && maxArea(p) < 1500 },
  { label: "1,500 - 2,500", test: (p) => maxArea(p) >= 1500 && maxArea(p) < 2500 },
  { label: "2,500+ sq.ft", test: (p) => maxArea(p) >= 2500 },
];
const AMENITY_OPTS: { key: AmenityKey; label: string }[] = [
  { key: "pool", label: "Swimming Pool" },
  { key: "clubhouse", label: "Clubhouse" },
  { key: "gym", label: "Gymnasium" },
  { key: "kidsArea", label: "Kids Play Area" },
  { key: "coworking", label: "Co-working Space" },
];
const TABS: { label: string; test: (p: Property) => boolean }[] = [
  { label: "Apartments", test: (p) => p.kind === "Apartment" },
  { label: "Luxury Homes", test: (p) => p.priceLakh >= 250 || p.kind === "Villa" },
  { label: "New Launches", test: (p) => p.possession === "New Launch" },
];
const FEATURES = [
  { icon: "/icons/price.png", label: "Price & Configuration" },
  { icon: "/icons/amenities.png", label: "Amenities" },
  { icon: "/icons/location.png", label: "Location & Connectivity" },
  { icon: "/icons/floorplan.png", label: "Floor Plans" },
  { icon: "/icons/investment.png", label: "Investment Potential" },
];
const TRUST = [
  { icon: BadgeCheck, label: "100% Verified Properties" },
  { icon: Headset, label: "Expert Assistance" },
  { icon: Tag, label: "Best Price Guarantee" },
  { icon: Lock, label: "Secure & Transparent Process" },
];

const bhkNums = (p: Property) => (p.configs.match(/\d+/g) ?? []).map(Number);
const toggle = <T,>(set: Set<T>, v: T) => {
  const n = new Set(set);
  n.has(v) ? n.delete(v) : n.add(v);
  return n;
};

export function PropertyExplorer({ initial }: { initial: Property[]; title?: string; subtitle?: string }) {
  const router = useRouter();
  const selected = useComparison((s) => s.selected);

  const [tab, setTab] = React.useState(0);
  const [locQuery, setLocQuery] = React.useState("");
  const [locations, setLocations] = React.useState<Set<City>>(new Set());
  const [budgetIdx, setBudgetIdx] = React.useState<number | null>(null);
  const [areaIdx, setAreaIdx] = React.useState<number | null>(null);
  const [bhks, setBhks] = React.useState<Set<number>>(new Set());
  const [possessions, setPossessions] = React.useState<Set<Possession>>(new Set());
  const [amenities, setAmenities] = React.useState<Set<AmenityKey>>(new Set());
  const [builders, setBuilders] = React.useState<Set<string>>(new Set());
  const [sort, setSort] = React.useState("recommended");

  // Distinct builder/brand names, derived from the live data (never hardcoded).
  const builderNames = React.useMemo(
    () => [...new Set(initial.map((p) => p.builder.name))].sort(),
    [initial],
  );

  const filtered = React.useMemo(() => {
    let list = initial.filter((p) => TABS[tab].test(p));
    if (locations.size) list = list.filter((p) => locations.has(p.city));
    if (locQuery)
      list = list.filter((p) =>
        `${p.locality} ${p.city}`.toLowerCase().includes(locQuery.toLowerCase()),
      );
    if (budgetIdx != null) list = list.filter(BUDGETS[budgetIdx].test);
    if (areaIdx != null) list = list.filter(AREAS[areaIdx].test);
    if (bhks.size) list = list.filter((p) => bhkNums(p).some((b) => bhks.has(b)));
    if (possessions.size) list = list.filter((p) => possessions.has(p.possession));
    if (amenities.size)
      list = list.filter((p) => [...amenities].every((a) => p.amenities[a]));
    if (builders.size) list = list.filter((p) => builders.has(p.builder.name));
    const s = [...list];
    if (sort === "price-asc") s.sort((a, b) => a.priceLakh - b.priceLakh);
    if (sort === "price-desc") s.sort((a, b) => b.priceLakh - a.priceLakh);
    if (sort === "rating") s.sort((a, b) => b.builder.rating - a.builder.rating);
    return s;
  }, [initial, tab, locations, locQuery, budgetIdx, areaIdx, bhks, possessions, amenities, builders, sort]);

  const clearAll = () => {
    setLocations(new Set());
    setBudgetIdx(null);
    setAreaIdx(null);
    setBhks(new Set());
    setPossessions(new Set());
    setAmenities(new Set());
    setBuilders(new Set());
    setLocQuery("");
  };

  const count = (fn: (p: Property) => boolean) => initial.filter(fn).length;

  return (
    <section id="explore" className="container scroll-mt-20 py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ───────────── FILTER SIDEBAR (sticky) ───────────── */}
        <aside className="h-fit lg:sticky lg:top-20">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-glass lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-primary dark:text-foreground">
                <SlidersHorizontal className="h-4 w-4 text-accent" /> Filter
              </span>
              <button onClick={clearAll} className="text-xs font-bold uppercase tracking-wide text-accent hover:underline">
                Clear all
              </button>
            </div>

            <FilterGroup title="Location">
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={locQuery}
                  onChange={(e) => setLocQuery(e.target.value)}
                  placeholder="Search location"
                  className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-xs outline-none ring-accent/40 focus:ring-2"
                />
              </div>
              {CITIES.map((c) => (
                <CheckRow
                  key={c}
                  label={c}
                  count={count((p) => p.city === c)}
                  checked={locations.has(c)}
                  onChange={() => setLocations((s) => toggle(s, c))}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Brand">
              {builderNames.map((b) => (
                <CheckRow
                  key={b}
                  label={b}
                  count={count((p) => p.builder.name === b)}
                  checked={builders.has(b)}
                  onChange={() => setBuilders((s) => toggle(s, b))}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Budget">
              <div className="mb-2 mt-1">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-accent to-primary/40" />
                <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>₹10 L</span>
                  <span>₹10 Cr+</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BUDGETS.map((b, i) => (
                  <button
                    key={b.label}
                    onClick={() => setBudgetIdx(budgetIdx === i ? null : i)}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors",
                      budgetIdx === i
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-foreground hover:border-accent/50",
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Area (sq.ft)">
              <div className="grid grid-cols-2 gap-2">
                {AREAS.map((a, i) => (
                  <button
                    key={a.label}
                    onClick={() => setAreaIdx(areaIdx === i ? null : i)}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors",
                      areaIdx === i
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-foreground hover:border-accent/50",
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="BHK Configuration">
              {BHK_OPTS.map((b) => (
                <CheckRow
                  key={b}
                  label={`${b} BHK`}
                  count={count((p) => bhkNums(p).includes(b))}
                  checked={bhks.has(b)}
                  onChange={() => setBhks((s) => toggle(s, b))}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Possession Status">
              {POSSESSIONS.map((ps) => (
                <CheckRow
                  key={ps}
                  label={ps}
                  count={count((p) => p.possession === ps)}
                  checked={possessions.has(ps)}
                  onChange={() => setPossessions((s) => toggle(s, ps))}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Amenities" last>
              {AMENITY_OPTS.map((a) => (
                <CheckRow
                  key={a.key}
                  label={a.label}
                  count={count((p) => p.amenities[a.key])}
                  checked={amenities.has(a.key)}
                  onChange={() => setAmenities((s) => toggle(s, a.key))}
                />
              ))}
            </FilterGroup>
          </div>
        </aside>

        {/* ───────────── MAIN ───────────── */}
        <div>
          {/* Tabs + sort */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {TABS.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setTab(i)}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                    tab === i
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card pl-3 pr-8 text-sm font-medium outline-none ring-accent/40 focus:ring-2"
              >
                <option value="recommended">Sort by: Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Builder rating</option>
              </select>
            </div>
          </div>

          {/* Heading row */}
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-primary dark:text-foreground">
                {TABS[tab].label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <strong className="text-foreground">{filtered.length}</strong> Properties Found
              </p>
            </div>
            <Button
              variant={selected.length >= MIN_COMPARE ? "accent" : "outline"}
              size="md"
              disabled={selected.length < MIN_COMPARE}
              onClick={() => router.push("/compare")}
            >
              <GitCompareArrows className="h-4 w-4" />
              Compare
              {selected.length > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background/30 px-1.5 text-[11px] font-bold">
                  {selected.length}
                </span>
              )}
            </Button>
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="font-display text-lg font-bold">No matches</p>
              <p className="mt-1 text-sm text-muted-foreground">Try widening your filters.</p>
              <Button variant="subtle" size="sm" className="mt-4" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          ) : (
            <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((p) => (
                  <ListingCard key={p.id} property={p} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Trending localities */}
          <div className="mt-12">
            <h3 className="mb-4 font-display text-lg font-bold text-primary dark:text-foreground">
              Trending Localities
            </h3>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setLocations(new Set([c]))}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-accent/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Building2 className="h-4 w-4 text-accent" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground">{c}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {count((p) => p.city === c)} Properties
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Compare promo band */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-accent/20 bg-accent/[0.06] p-5">
            <div className="grid items-center gap-5 lg:grid-cols-[auto_1fr]">
              <div className="relative flex items-center">
                <span className="relative h-20 w-28 overflow-hidden rounded-xl sm:h-24 sm:w-36">
                  <CoverImage src={initial[0]?.image} alt={initial[0]?.name ?? ""} gradient={initial[0]?.gradient} sizes="160px" />
                </span>
                <span className="z-10 -mx-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-card bg-primary text-[11px] font-extrabold text-primary-foreground">
                  V/S
                </span>
                <span className="relative h-20 w-28 overflow-hidden rounded-xl sm:h-24 sm:w-36">
                  <CoverImage src={initial[1]?.image} alt={initial[1]?.name ?? ""} gradient={initial[1]?.gradient} sizes="160px" />
                </span>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="font-display text-xl font-extrabold text-primary dark:text-foreground">
                  Compare Properties Side by Side!
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Compare price, amenities, connectivity, floor plans and much more.
                </p>
                <div className="mt-4 flex justify-center lg:justify-start">
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={() => router.push(selected.length >= MIN_COMPARE ? "/compare" : "/properties")}
                  >
                    Start Comparing
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-accent/15 pt-4">
              {FEATURES.map((f) => (
                <span key={f.label} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Image src={f.icon} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                  {f.label}
                </span>
              ))}
            </div>
          </div>

          {/* Trust row */}
          <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CompareBar />
      <div className="h-24" />
    </section>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function FilterGroup({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className={cn("py-3", !last && "border-b border-border")}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-foreground">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !open && "-rotate-90")} />
      </button>
      {open && <div className="mt-2.5 space-y-1">{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 py-0.5 text-sm">
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
            checked ? "border-accent bg-accent text-accent-foreground" : "border-border",
          )}
        >
          {checked && <span className="h-2 w-2 rounded-[2px] bg-current" />}
        </span>
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <span className="text-foreground">{label}</span>
      </span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </label>
  );
}


const ListingCard = React.forwardRef<HTMLDivElement, { property: Property }>(
  function ListingCard({ property: p }, ref) {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const inCompare = useComparison((s) => s.selected.includes(p.id));
  const toggleCompare = useComparison((s) => s.toggle);
  const user = useAuth((s) => s.user);
  const toggleShortlist = useAuth((s) => s.toggleShortlist);
  const saved = useAuth((s) => s.savedIds.includes(p.id));
  const shortlisted = mounted && saved;

  const handleShortlist = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    toggleShortlist(p.id);
  };

  return (
    <motion.div
      ref={ref}
      layout
      whileHover={{ y: -4 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-glass"
    >
      <div className="relative h-44 w-full">
        <CoverImage src={p.image} alt={p.name} gradient={p.gradient} label={p.name} sizes="(max-width:768px) 100vw, 360px" />
        <button
          onClick={handleShortlist}
          aria-label="Shortlist"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white"
        >
          <Heart className={cn("h-4 w-4", shortlisted && "fill-accent text-accent")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold text-primary dark:text-foreground">{p.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-accent">
          <Building2 className="h-3 w-3" /> {p.builder.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 text-accent" /> {p.locality}, {p.city}
        </p>
        <div className="mt-2 font-display text-lg font-extrabold text-accent">
          {formatPriceLakh(p.priceLakh)}
          <span className="text-xs font-medium text-muted-foreground">*</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {[p.configs, sqftRange(p)].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-lg bg-muted/60 px-2.5 py-2 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{p.possession}</span>
          {p.totalUnits ? <span>· {p.totalUnits.toLocaleString("en-IN")} units</span> : null}
          <span>· {p.towers} {p.towers === 1 ? "tower" : "towers"}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-[1fr_1fr_auto]">
          <button
            onClick={handleShortlist}
            className={cn(
              "inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-semibold transition-colors",
              shortlisted ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:bg-muted",
            )}
          >
            <Heart className={cn("h-3 w-3", shortlisted && "fill-accent")} /> Shortlist
          </button>
          <button
            onClick={() => toggleCompare(p.id)}
            className={cn(
              "inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-semibold transition-colors",
              inCompare ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:bg-muted",
            )}
          >
            <GitCompareArrows className="h-3 w-3" /> {inCompare ? "Added" : "Compare"}
          </button>
          <Link href={`/properties/${p.id}`} className="col-span-2 sm:col-span-1">
            <Button variant="accent" size="sm" className="h-full w-full px-3 text-[11px]">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
});
ListingCard.displayName = "ListingCard";

function sqftRange(p: Property): string {
  const a = p.floorPlans.map((f) => f.areaSqFt).filter((n) => n > 0);
  if (a.length === 0) return ""; // no floor-plan areas in the source sheet
  return `${Math.min(...a).toLocaleString("en-IN")} - ${Math.max(...a).toLocaleString("en-IN")} sq.ft`;
}
