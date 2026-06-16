import type { Metadata } from "next";
import { getDataSource } from "@/lib/data-source";
import { SelectionView } from "@/components/selection/selection-view";

export const metadata: Metadata = {
  title: "Select properties · Creators Home",
  description:
    "Browse and shortlist NCR residential properties to compare side-by-side.",
};

export default async function PropertiesPage() {
  // Data flows through the data-source seam (local today, WordPress later).
  const properties = await getDataSource().list();
  return <SelectionView initial={properties} />;
}
