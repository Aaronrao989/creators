import { getDataSource } from "@/lib/data-source";
import { Hero3D } from "@/components/landing/hero-3d";
import { PropertyExplorer } from "@/components/listing/property-explorer";

export default async function HomePage() {
  const properties = await getDataSource().list();
  return (
    <>
      <Hero3D />
      <PropertyExplorer
        initial={properties}
        title="Featured properties by location"
        subtitle="Browse live NCR projects grouped by location, then shortlist 2–4 to compare."
      />
    </>
  );
}
