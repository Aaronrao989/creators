import { notFound } from "next/navigation";
import { getDataSource } from "@/lib/data-source";
import { reviewService } from "@/lib/services/review.service";
import { PropertyDetail } from "@/components/property/property-detail";

// DB-backed: render at request time.
export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ds = getDataSource();
  const property = await ds.get(params.id);
  if (!property) notFound();

  const all = await ds.list();
  const similar = all.filter((p) => p.id !== property.id).slice(0, 3);

  let reviewAvg: number | null = null;
  let reviewCount = 0;
  try {
    const r = await reviewService.listForProperty(property.id);
    reviewAvg = r.averageRating;
    reviewCount = r.reviews.length;
  } catch {
    // reviews are non-critical for the detail page
  }

  return (
    <PropertyDetail
      property={property}
      similar={similar}
      reviewAvg={reviewAvg}
      reviewCount={reviewCount}
    />
  );
}
