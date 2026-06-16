"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { properties } from "@/data/properties";
import {
  MAX_COMPARE,
  MIN_COMPARE,
  useComparison,
} from "@/store/comparison";
import { Button } from "@/components/ui/button";

export function CompareBar() {
  const router = useRouter();
  const selected = useComparison((s) => s.selected);
  const remove = useComparison((s) => s.remove);
  const clear = useComparison((s) => s.clear);

  const items = selected
    .map((id) => properties.find((p) => p.id === id))
    .filter(Boolean) as typeof properties;

  const canCompare = selected.length >= MIN_COMPARE;
  const need = MIN_COMPARE - selected.length;

  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.div
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          exit={{ y: 120 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-50"
        >
          <div className="container pb-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-primary px-4 py-3.5 text-primary-foreground shadow-lift sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="shrink-0 text-xs font-medium text-primary-foreground/55">
                  Selected ({selected.length}/{MAX_COMPARE})
                </span>
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-2.5"
                  >
                    <span className="relative h-7 w-7 overflow-hidden rounded-full">
                      <Image src={p.image} alt="" fill className="object-cover" sizes="28px" />
                    </span>
                    <span className="max-w-[120px] truncate text-xs font-semibold">
                      {p.name}
                    </span>
                    <button
                      onClick={() => remove(p.id)}
                      aria-label={`Remove ${p.name}`}
                      className="rounded-full p-0.5 text-primary-foreground/60 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="text-primary-foreground/70 hover:bg-white/10 hover:text-white"
                >
                  Clear
                </Button>
                <Button
                  variant="accent"
                  size="md"
                  disabled={!canCompare}
                  onClick={() => router.push("/compare")}
                  className="group"
                >
                  {canCompare
                    ? "Compare Now"
                    : `Select ${need} more`}
                  {canCompare && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
