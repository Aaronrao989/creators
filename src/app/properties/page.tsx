import type { Metadata } from "next";
import { getDataSource } from "@/lib/data-source";
import { PropertyExplorer } from "@/components/listing/property-explorer";

export const metadata: Metadata = {
  title: "Select properties · Creators Home",
  description:
    "Browse and shortlist NCR residential properties to compare side-by-side.",
};

export default async function PropertiesPage() {
  const properties = await getDataSource().list();
  return (
    <PropertyExplorer
      initial={properties}
      title="Select properties to compare"
      subtitle="Pick 2–4 homes and hit Compare to see a full side-by-side analysis with a recommendation score."
    />
  );
}
