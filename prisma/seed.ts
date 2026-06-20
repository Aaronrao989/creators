import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { properties as seedProperties } from "../src/data/properties";

/**
 * Seed script — ports the original dummy dataset into PostgreSQL.
 * Idempotent: clears existing rows first so `npm run db:seed` can be re-run.
 *
 * Run:  npm run db:migrate   (creates tables)
 *       npm run db:seed      (loads this data)
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const AMENITY_LABELS: Record<string, string> = {
  pool: "Swimming Pool",
  gym: "Gymnasium",
  clubhouse: "Clubhouse",
  security: "24/7 Security",
  sports: "Sports Court",
  kidsArea: "Kids Play Area",
  coworking: "Co-working Space",
  powerBackup: "Power Backup",
};

async function reset() {
  // Order respects FK constraints (Builder is Restrict-protected by Property).
  await prisma.savedComparison.deleteMany();
  await prisma.review.deleteMany();
  await prisma.property.deleteMany();
  await prisma.builder.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("⏳ Resetting tables…");
  await reset();

  // 1) Builders (deduped by name from the dataset).
  const builderByName = new Map<string, { id: string }>();
  for (const p of seedProperties) {
    if (builderByName.has(p.builder.name)) continue;
    const created = await prisma.builder.create({
      data: {
        name: p.builder.name,
        rating: p.builder.rating,
        yearEstablished: p.builder.established,
        deliveredProjects: p.builder.deliveredProjects,
        logoColor: p.builder.logoColor,
      },
      select: { id: true },
    });
    builderByName.set(p.builder.name, created);
  }
  console.log(`✓ ${builderByName.size} builders`);

  // 2) Properties with all nested relations.
  const propertyIds: string[] = [];
  for (const p of seedProperties) {
    const builder = builderByName.get(p.builder.name)!;
    const created = await prisma.property.create({
      data: {
        name: p.name,
        subtitle: p.subtitle,
        builderId: builder.id,
        city: p.city,
        locality: p.locality,
        kind: p.kind,
        possession: p.possession,
        possessionDate: p.possessionDate,
        reraId: p.reraId,
        areaAcres: p.areaAcres,
        towers: p.towers,
        configsLabel: p.configs,
        gradientFrom: p.gradient[0],
        gradientTo: p.gradient[1],
        highlights: p.highlights,
        pricing: {
          create: {
            startingPriceLakh: p.priceLakh,
            pricePerSqFt: p.pricePerSqFt,
            priceRangeLabel: p.priceRangeLabel,
            minPriceLakh: p.priceLakh,
          },
        },
        location: { create: { ...p.location } },
        investment: { create: { ...p.investment } },
        configurations: {
          create: p.floorPlans.map((fp, i) => ({
            label: fp.config,
            areaSqFt: fp.areaSqFt,
            priceLabel: fp.priceLabel,
            floorPlanImage: fp.image,
            sortOrder: i,
          })),
        },
        amenities: {
          create: Object.entries(p.amenities).map(([key, available]) => ({
            key,
            label: AMENITY_LABELS[key] ?? key,
            available,
          })),
        },
        images: {
          create: [{ url: p.image, isPrimary: true, sortOrder: 0 }],
        },
      },
      select: { id: true },
    });
    propertyIds.push(created.id);
  }
  console.log(`✓ ${propertyIds.length} properties (with pricing, metrics, configs, amenities, images)`);

  // 3) A demo user + a couple of reviews + a saved comparison.
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@creatorshome.in",
      provider: "email",
      passwordHash: null,
    },
    select: { id: true },
  });

  await prisma.review.createMany({
    data: [
      {
        propertyId: propertyIds[0],
        userId: demoUser.id,
        authorName: "Rohit Verma",
        rating: 5,
        comment: "Great location and amenities. Smooth booking process.",
      },
      {
        propertyId: propertyIds[0],
        authorName: "Anita Desai",
        rating: 4,
        comment: "Good value for money, construction quality is solid.",
      },
      {
        propertyId: propertyIds[1],
        authorName: "Karan Mehta",
        rating: 5,
        comment: "Premium project with excellent connectivity.",
      },
    ],
  });

  if (propertyIds.length >= 2) {
    await prisma.savedComparison.create({
      data: {
        userId: demoUser.id,
        name: "My shortlist",
        items: {
          create: [
            { propertyId: propertyIds[0] },
            { propertyId: propertyIds[1] },
          ],
        },
      },
    });
  }
  console.log("✓ demo user, reviews, saved comparison");
  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
