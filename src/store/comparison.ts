"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MIN_COMPARE, MAX_COMPARE } from "@/lib/constants";

export { MIN_COMPARE, MAX_COMPARE };

interface ComparisonState {
  selected: string[]; // property ids
  toast: string | null;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  canCompare: () => boolean;
  setToast: (msg: string | null) => void;
}

export const useComparison = create<ComparisonState>()(
  persist(
    (set, get) => ({
      selected: [],
      toast: null,
      toggle: (id) => {
        const { selected } = get();
        if (selected.includes(id)) {
          set({ selected: selected.filter((x) => x !== id) });
          return;
        }
        
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const currentLimit = isMobile ? 2 : MAX_COMPARE;
        
        if (selected.length >= currentLimit) {
          if (isMobile) {
            set({ toast: "You can compare up to 2 properties on mobile. Switch to a larger screen to compare up to 4 properties." });
          } else {
            set({ toast: `You can compare up to ${MAX_COMPARE} properties at a time.` });
          }
          return;
        }
        set({ selected: [...selected, id] });
      },
      remove: (id) =>
        set((s) => ({ selected: s.selected.filter((x) => x !== id) })),
      clear: () => set({ selected: [] }),
      isSelected: (id) => get().selected.includes(id),
      canCompare: () => get().selected.length >= MIN_COMPARE,
      setToast: (msg) => set({ toast: msg }),
    }),
    { name: "creators-compare", partialize: (s) => ({ selected: s.selected }) },
  ),
);
