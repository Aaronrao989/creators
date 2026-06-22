/**
 * One-off, idempotent data script: attach the brochure-sourced property images
 * (already saved under /public/properties) as PropertyMedia rows.
 *
 * This does NOT touch the importer, the Prisma schema or any models — it only
 * inserts rows into the existing PropertyMedia table the repository already
 * reads (cover -> Property.image). Re-running replaces only these media rows.
 *
 * Run: npx tsx scripts/attach-brochure-media.ts
 */
import "dotenv/config";
import { prisma } from "@/lib/db/prisma";

// Match by the property name substring (case-insensitive) so we don't depend on
// slug/id specifics. Images come from the official client brochures only.
const MEDIA: Record<string, { type: string; file: string; alt: string }[]> = {
  Arden: [
    { type: "cover", file: "arden-aerial.jpg", alt: "Godrej Arden aerial view" },
    { type: "gallery", file: "arden-lifestyle.jpg", alt: "Godrej Arden landscaped greens" },
  ],
  Sanctury: [
    { type: "cover", file: "sanctury-aerial.jpg", alt: "Northwind Sanctury masterplan aerial" },
    { type: "gallery", file: "sanctury-exterior.jpg", alt: "Northwind Sanctury tower entrance" },
    { type: "gallery", file: "sanctury-amenities.jpg", alt: "Northwind Sanctury amenities" },
  ],
};

async function main() {
  for (const [name, items] of Object.entries(MEDIA)) {
    const property = await prisma.property.findFirst({
      where: { name: { contains: name, mode: "insensitive" } },
      select: { id: true, name: true },
    });
    if (!property) {
      console.warn(`! no property matching "${name}" — skipped`);
      continue;
    }
    // Replace only the cover/gallery media we manage here (idempotent).
    await prisma.propertyMedia.deleteMany({
      where: { propertyId: property.id, type: { in: ["cover", "gallery"] } },
    });
    await prisma.propertyMedia.createMany({
      data: items.map((m, i) => ({
        propertyId: property.id,
        type: m.type,
        url: `/properties/${m.file}`,
        alt: m.alt,
        sortOrder: i,
      })),
    });
    console.log(`✓ ${property.name}: attached ${items.length} media`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
