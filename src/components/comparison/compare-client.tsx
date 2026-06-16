"use client";

import * as React from "react";
import Link from "next/link";
import { GitCompareArrows, Scale } from "lucide-react";
import { propertyById } from "@/data/properties";
import { MIN_COMPARE, useComparison } from "@/store/comparison";
import { ComparisonView } from "@/components/comparison/comparison-view";
import { Button } from "@/components/ui/button";

export function CompareClient() {
  const selected = useComparison((s) => s.selected);
  const [hydrated, setHydrated] = React.useState(false);

  // Selection lives in localStorage (zustand persist) — wait for hydration so
  // SSR/CSR markup matches and we don't flash the empty state.
  React.useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  const properties = selected
    .map((id) => propertyById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (properties.length < MIN_COMPARE) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Scale className="h-7 w-7 text-accent" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-primary dark:text-foreground">
          Pick at least {MIN_COMPARE} properties
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {properties.length === 1
            ? "You've selected one property. Add at least one more to see a side-by-side comparison."
            : "Head to the selection page and choose the homes you'd like to compare."}
        </p>
        <Link href="/properties" className="mt-6">
          <Button variant="accent" size="md">
            <GitCompareArrows className="h-4 w-4" /> Select properties
          </Button>
        </Link>
      </div>
    );
  }

  return <ComparisonView properties={properties} />;
}
