/**
 * One-off, idempotent data script: link floor-plan images to
 * Configuration.floorPlanImage.
 *
 * CONVENTION (deterministic — no guessing): a floor plan is linked to a config
 * ONLY when a file named `<prefix>-fp-<saleableArea>.jpg` exists, where the
 * number is the unit's exact SUPER/SALEABLE area (the figure printed on the
 * brochure plan). Because the area is unique per config, the correct plan always
 * lands on the correct config; anything without a matching area-named file is
 * left as the branded gradient placeholder rather than a wrong image.
 *
 * To add plans for a project: save each plan as
 *   public/properties/<prefix>-fp-<area>.jpg     e.g. rivana-fp-1374.jpg
 * (prefix from PROJECT_PREFIX below) and re-run this script.
 *
 * Re-run after any `db:import` (the importer recreates configs, clearing this).
 * Run: npx tsx scripts/attach-floorplan-images.ts
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db/prisma";

const PUB = path.resolve("public/properties");

// Lowercase substring found in the property name → the image file prefix.
// (Property names and brochure filenames don't always share a token, e.g.
// "Green Hights" uses the builder prefix "divyansh".)
const PROJECT_PREFIX: Record<string, string> = {
  "7peaks": "7peaks",
  arden: "arden",
  aurum: "aurum",
  ballads: "ballads",
  chrysalis: "chrysalis",
  echoes: "echoes",
  rivana: "rivana",
  sunbliss: "sunbliss",
  wishpers: "whisper", // "Wishpers of Wonder" → whisper-*.jpg
};

function prefixFor(propertyName: string): string | null {
  const n = propertyName.toLowerCase();
  for (const key of Object.keys(PROJECT_PREFIX)) {
    if (n.includes(key)) return PROJECT_PREFIX[key];
  }
  return null;
}

async function main() {
  const configs = await prisma.configuration.findMany({
    select: {
      id: true,
      label: true,
      areaSqFt: true,
      property: { select: { name: true } },
    },
  });

  let linked = 0;
  const missing: string[] = [];
  for (const c of configs) {
    const prefix = prefixFor(c.property.name);
    if (!prefix || c.areaSqFt <= 0) continue;
    const file = `${prefix}-fp-${c.areaSqFt}.jpg`;
    if (!fs.existsSync(path.join(PUB, file))) {
      missing.push(`${c.property.name} · ${c.label} (${c.areaSqFt}) → ${file}`);
      continue;
    }
    await prisma.configuration.update({
      where: { id: c.id },
      data: { floorPlanImage: `/properties/${file}` },
    });
    console.log(`✓ ${c.property.name} · ${c.label} (${c.areaSqFt}) → ${file}`);
    linked++;
  }

  console.log(`\nlinked ${linked} floor plans.`);
  if (missing.length) {
    console.log(`\n${missing.length} configs have no area-named file yet (left as placeholder):`);
    missing.forEach((m) => console.log(`  · ${m}`));
  }
}

main()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
