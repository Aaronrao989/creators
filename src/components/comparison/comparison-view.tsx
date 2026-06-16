"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Building2,
  CalendarClock,
  Check,
  ClipboardList,
  Crown,
  IndianRupee,
  LayoutPanelTop,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Waves,
  X,
} from "lucide-react";
import type { AmenityKey, Property } from "@/lib/types";
import { compareProperties, FACTOR_LABELS, scoreTier } from "@/lib/scoring";
import { useComparison } from "@/store/comparison";
import { ScoreRing } from "@/components/comparison/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPriceLakh } from "@/lib/utils";

const AMENITIES: { key: AmenityKey; label: string }[] = [
  { key: "pool", label: "Swimming Pool" },
  { key: "gym", label: "Gymnasium" },
  { key: "clubhouse", label: "Clubhouse" },
  { key: "security", label: "24/7 Security" },
  { key: "sports", label: "Sports Area" },
  { key: "kidsArea", label: "Kids' Area" },
  { key: "coworking", label: "Co-working Space" },
  { key: "powerBackup", label: "Power Backup" },
];

export function ComparisonView({ properties }: { properties: Property[] }) {
  const n = properties.length;
  const result = React.useMemo(
    () => compareProperties(properties),
    [properties],
  );

  // Grid template: label column + N value columns.
  const gridCols = {
    gridTemplateColumns: `minmax(140px, 200px) repeat(${n}, minmax(0, 1fr))`,
  };

  const priceArr = properties.map((p) => p.priceLakh);
  const sqftArr = properties.map((p) => p.pricePerSqFt);
  const lowestIdx = (arr: number[]) => arr.indexOf(Math.min(...arr));
  const highestIdx = (arr: number[]) => arr.indexOf(Math.max(...arr));

  const awards = [
    {
      id: result.bestValueId,
      label: "Best Value",
      icon: Award,
      tint: "text-success",
    },
    {
      id: result.bestLuxuryId,
      label: "Best Luxury",
      icon: Crown,
      tint: "text-accent",
    },
    {
      id: result.bestFamilyId,
      label: "Best for Families",
      icon: Users,
      tint: "text-[#6366f1]",
    },
    {
      id: result.bestInvestmentId,
      label: "Best Investment",
      icon: TrendingUp,
      tint: "text-[#a855f7]",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-[hsl(274_52%_26%)] pb-8 pt-8 text-primary-foreground">
        <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-accent/20 blur-[110px]" />
        <div className="container relative">
          <Link href="/properties">
            <Button
              variant="outline"
              size="sm"
              className="mb-6 border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Back to selection
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Property Comparison
            </h1>
          </div>
          <p className="mt-1 text-sm text-primary-foreground/70">
            Scored on price (30%), amenities (25%), location (25%), builder
            (10%) and investment (10%).
          </p>

          {/* Property header columns */}
          <div className="mt-6 grid gap-3" style={gridCols}>
            <div className="hidden sm:block" />
            {properties.map((p) => {
              const s = result.scores[p.id];
              const isTop = result.ranking[0] === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border bg-white/5 p-3 text-center backdrop-blur",
                    isTop ? "border-accent" : "border-white/10",
                  )}
                >
                  {isTop && (
                    <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                      ★ Top pick
                    </span>
                  )}
                  <div className="relative mx-auto h-20 w-full overflow-hidden rounded-xl">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="240px"
                    />
                  </div>
                  <h3 className="mt-2.5 truncate text-sm font-bold">{p.name}</h3>
                  <p className="truncate text-[11px] text-primary-foreground/60">
                    {p.builder.name}
                  </p>
                  <div
                    className="mt-1.5 text-lg font-extrabold"
                    style={{ color: scoreTier(s.overall).color }}
                  >
                    {s.overall}
                    <span className="text-[10px] opacity-60">/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container py-10">
        {/* Recommendation awards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {awards.map((a) => {
            const p = properties.find((x) => x.id === a.id)!;
            const Icon = a.icon;
            return (
              <div
                key={a.label}
                className="rounded-2xl border border-border bg-card p-4 shadow-glass"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Icon className={cn("h-4 w-4", a.tint)} />
                  {a.label}
                </div>
                <div className="mt-2 font-display text-base font-bold text-primary dark:text-foreground">
                  {p.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPriceLakh(p.priceLakh)} · {p.locality}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendation score */}
        <Section icon={Award} title="Recommendation Score">
          <div className="grid gap-3 p-5" style={gridCols}>
            <div className="hidden items-center text-sm font-semibold text-muted-foreground sm:flex">
              Overall score
            </div>
            {properties.map((p) => {
              const s = result.scores[p.id];
              const tier = scoreTier(s.overall);
              const best = result.ranking[0] === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl p-3",
                    best && "bg-success/5",
                  )}
                >
                  <ScoreRing value={s.overall} color={tier.color} label="/100" />
                  <Badge
                    variant="outline"
                    style={{ color: tier.color, borderColor: tier.color }}
                  >
                    {best && "★ "}
                    {tier.label}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Factor breakdown bars */}
          <div className="border-t border-border p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Score breakdown
            </p>
            {(Object.keys(FACTOR_LABELS) as (keyof typeof FACTOR_LABELS)[]).map(
              (key) => {
                const vals = properties.map(
                  (p) =>
                    result.scores[p.id].breakdown.find((b) => b.key === key)!,
                );
                const bestVal = Math.max(...vals.map((v) => v.value));
                return (
                  <div key={key} className="grid gap-3 py-2" style={gridCols}>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      {FACTOR_LABELS[key]}
                      <span className="text-[10px] opacity-60">
                        {Math.round(vals[0].weight * 100)}%
                      </span>
                    </div>
                    {vals.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-[width] duration-700"
                            style={{
                              width: `${v.value}%`,
                              background:
                                v.value === bestVal
                                  ? "hsl(var(--accent))"
                                  : "hsl(var(--primary))",
                            }}
                          />
                        </div>
                        <span
                          className={cn(
                            "w-7 text-right text-xs font-bold tabular-nums",
                            v.value === bestVal
                              ? "text-accent"
                              : "text-muted-foreground",
                          )}
                        >
                          {v.value}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              },
            )}
          </div>
        </Section>

        {/* Overview */}
        <Section icon={ClipboardList} title="Property Overview">
          <Row label="Builder" gridCols={gridCols}>
            {properties.map((p) => (
              <Cell key={p.id}>{p.builder.name}</Cell>
            ))}
          </Row>
          <Row label="Location" gridCols={gridCols}>
            {properties.map((p) => (
              <Cell key={p.id}>{p.locality}</Cell>
            ))}
          </Row>
          <Row label="Property type" gridCols={gridCols}>
            {properties.map((p) => (
              <Cell key={p.id}>
                {p.configs} {p.kind}
              </Cell>
            ))}
          </Row>
          <Row label="RERA ID" gridCols={gridCols}>
            {properties.map((p) => (
              <Cell key={p.id} className="text-xs">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-success" />
                {p.reraId}
              </Cell>
            ))}
          </Row>
          <Row label="Possession" gridCols={gridCols} last>
            {properties.map((p) => (
              <Cell key={p.id}>
                <CalendarClock className="mr-1 inline h-3.5 w-3.5 text-accent" />
                {p.possessionDate}
              </Cell>
            ))}
          </Row>
        </Section>

        {/* Pricing */}
        <Section icon={IndianRupee} title="Price Comparison">
          <Row label="Starting price" gridCols={gridCols}>
            {properties.map((p, i) => (
              <Cell key={p.id} best={i === lowestIdx(priceArr)}>
                {formatPriceLakh(p.priceLakh)}
              </Cell>
            ))}
          </Row>
          <Row label="Price / sq.ft" gridCols={gridCols}>
            {properties.map((p, i) => (
              <Cell key={p.id} best={i === lowestIdx(sqftArr)}>
                ₹{p.pricePerSqFt.toLocaleString("en-IN")}
              </Cell>
            ))}
          </Row>
          <Row label="Price range" gridCols={gridCols} last>
            {properties.map((p) => (
              <Cell key={p.id} className="text-xs">
                {p.priceRangeLabel}
              </Cell>
            ))}
          </Row>
        </Section>

        {/* Amenities */}
        <Section icon={Waves} title="Amenities">
          {AMENITIES.map((a, idx) => (
            <Row
              key={a.key}
              label={a.label}
              gridCols={gridCols}
              last={idx === AMENITIES.length - 1}
            >
              {properties.map((p) => (
                <Cell key={p.id}>
                  {p.amenities[a.key] ? (
                    <Check className="mx-auto h-5 w-5 text-success" />
                  ) : (
                    <X className="mx-auto h-5 w-5 text-danger/60" />
                  )}
                </Cell>
              ))}
            </Row>
          ))}
        </Section>

        {/* Location & connectivity */}
        <Section icon={MapPin} title="Location & Connectivity">
          {(
            [
              ["Metro station", "metroKm"],
              ["Hospital", "hospitalKm"],
              ["School", "schoolKm"],
              ["Airport", "airportKm"],
            ] as const
          ).map(([label, key], idx) => {
            const arr = properties.map((p) => p.location[key]);
            return (
              <Row key={key} label={label} gridCols={gridCols}>
                {properties.map((p, i) => (
                  <Cell key={p.id} best={i === lowestIdx(arr)}>
                    {p.location[key]} km
                  </Cell>
                ))}
              </Row>
            );
          })}
          <Row label="Connectivity index" gridCols={gridCols} last>
            {properties.map((p, i) => (
              <Cell
                key={p.id}
                best={
                  i ===
                  highestIdx(properties.map((x) => x.location.connectivityIndex))
                }
              >
                {p.location.connectivityIndex}/100
              </Cell>
            ))}
          </Row>
        </Section>

        {/* Investment analysis */}
        <Section icon={TrendingUp} title="Investment Analysis">
          <Row label="Appreciation (p.a.)" gridCols={gridCols}>
            {properties.map((p, i) => (
              <Cell
                key={p.id}
                best={
                  i ===
                  highestIdx(properties.map((x) => x.investment.appreciationPct))
                }
              >
                {p.investment.appreciationPct}%
              </Cell>
            ))}
          </Row>
          <Row label="Rental yield" gridCols={gridCols}>
            {properties.map((p, i) => (
              <Cell
                key={p.id}
                best={
                  i ===
                  highestIdx(properties.map((x) => x.investment.rentalYieldPct))
                }
              >
                {p.investment.rentalYieldPct}%
              </Cell>
            ))}
          </Row>
          <Row label="Demand index" gridCols={gridCols}>
            {properties.map((p, i) => (
              <Cell
                key={p.id}
                best={
                  i ===
                  highestIdx(properties.map((x) => x.investment.demandIndex))
                }
              >
                {p.investment.demandIndex}/100
              </Cell>
            ))}
          </Row>
          <Row label="Investment score" gridCols={gridCols} last>
            {properties.map((p) => (
              <Cell
                key={p.id}
                best={p.id === result.bestInvestmentId}
                className="font-extrabold"
              >
                {result.scores[p.id].investmentScore}/100
              </Cell>
            ))}
          </Row>
        </Section>

        {/* Floor plans */}
        <Section icon={LayoutPanelTop} title="Floor Plans">
          <div className="grid gap-3 p-5" style={gridCols}>
            <div className="hidden text-sm font-semibold text-muted-foreground sm:block">
              Layouts
            </div>
            {properties.map((p) => (
              <div key={p.id} className="space-y-3">
                {p.floorPlans.map((fp) => (
                  <div
                    key={fp.config}
                    className="overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <div className="relative h-32 w-full bg-muted">
                      <Image
                        src={fp.image}
                        alt={`${p.name} ${fp.config}`}
                        fill
                        className="object-contain p-1"
                        sizes="240px"
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-xs">
                      <span className="font-bold">{fp.config}</span>
                      <span className="text-muted-foreground">
                        {fp.areaSqFt} sq.ft · {fp.priceLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        {/* Best for */}
        <Section icon={Users} title="Best For">
          <div className="grid gap-3 p-5" style={gridCols}>
            <div className="hidden text-sm font-semibold text-muted-foreground sm:block">
              Ideal buyer
            </div>
            {properties.map((p) => (
              <div key={p.id} className="flex flex-wrap justify-center gap-1.5">
                {result.scores[p.id].bestFor.map((tag) => (
                  <Badge key={tag} variant="accent">
                    {tag}
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        </Section>

        {/* Footer actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/properties">
            <Button variant="outline" size="md">
              <ArrowLeft className="h-4 w-4" /> Edit selection
            </Button>
          </Link>
          <a href="tel:+919252996677">
            <Button variant="accent" size="md">
              <Building2 className="h-4 w-4" /> Book a site visit
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---- presentational helpers --------------------------------------------- */

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  // Critical comparison data must always be visible — never gate it behind a
  // scroll/mount animation (a backgrounded tab pauses RAF and would otherwise
  // leave content invisible). The `animate-fade-up` utility adds a one-shot CSS
  // entrance with fill-mode `both`, so the resting state is always opacity 1.
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-glass">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-5 py-3.5">
        <Icon className="h-4 w-4 text-accent" />
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary dark:text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
  gridCols,
  last,
}: {
  label: string;
  children: React.ReactNode;
  gridCols: React.CSSProperties;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-3 px-5 py-3.5",
        !last && "border-b border-border",
      )}
      style={gridCols}
    >
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Cell({
  children,
  best,
  className,
}: {
  children: React.ReactNode;
  best?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-2 py-1.5 text-center text-sm font-semibold text-foreground",
        best && "bg-success/10 text-success",
        className,
      )}
    >
      {children}
      {best && <span className="ml-1 text-[10px]">★</span>}
    </div>
  );
}
