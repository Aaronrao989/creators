"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, MapPin, Star, Building2 } from "lucide-react";
import type { Property } from "@/lib/types";
import { useComparison } from "@/store/comparison";
import { Badge } from "@/components/ui/badge";
import { cn, formatPriceLakh } from "@/lib/utils";

const POSSESSION_VARIANT = {
  "Ready to Move": "success",
  "Under Construction": "accent",
  "New Launch": "primary",
} as const;

export function PropertyCard({ property }: { property: Property }) {
  const selected = useComparison((s) => s.selected.includes(property.id));
  const toggle = useComparison((s) => s.toggle);

  const amenityCount = Object.values(property.amenities).filter(Boolean).length;

  return (
    <motion.div
      layout
      onClick={() => toggle(property.id)}
      whileHover={{ y: -6 }}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl border-2 bg-card shadow-glass transition-shadow hover:shadow-lift",
        selected ? "border-accent shadow-glow" : "border-transparent",
      )}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={property.image}
          alt={property.name}
          fill
          sizes="(max-width:768px) 100vw, 360px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <Badge
          variant={POSSESSION_VARIANT[property.possession]}
          className="absolute bottom-3 left-3 uppercase"
        >
          {property.possession}
        </Badge>

        {/* Compare checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(property.id);
          }}
          aria-pressed={selected}
          className={cn(
            "absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur transition-colors",
            selected
              ? "bg-accent text-accent-foreground"
              : "bg-white/90 text-slate-700 hover:bg-white",
          )}
        >
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded border",
              selected
                ? "border-accent-foreground bg-accent-foreground/20"
                : "border-slate-400",
            )}
          >
            {selected && <Check className="h-3 w-3" />}
          </span>
          {selected ? "Added" : "Compare"}
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-bold text-primary dark:text-foreground">
              {property.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" /> {property.builder.name}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-bold text-foreground">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {property.builder.rating}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="font-display text-xl font-extrabold text-accent">
              {formatPriceLakh(property.priceLakh)}
              <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                onwards
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              ₹{property.pricePerSqFt.toLocaleString("en-IN")} / sq.ft ·{" "}
              {property.configs}
            </div>
          </div>
        </div>

        <hr className="my-4 border-border" />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <span className="truncate">{property.locality}</span>
          </span>
          <span className="shrink-0 font-medium">{amenityCount} amenities</span>
        </div>
      </div>
    </motion.div>
  );
}
