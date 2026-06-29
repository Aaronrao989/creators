import type { Metadata } from "next";
import { CompareClient } from "@/components/comparison/compare-client";

export const metadata: Metadata = {
  title: "Compare · Creators Arena",
  description:
    "Side-by-side comparison with a transparent, rule-based recommendation score.",
};

export default function ComparePage() {
  return <CompareClient />;
}
