/**
 * Attach cover/gallery/floor-plan images for the newly imported NH24 + RG
 * projects. Idempotent. Covers = elevation image; gallery = land-layout plan;
 * floor plans matched to configs by the area number in the filename (or unique
 * config label when no area). Images live only in each project's own folder.
 * Run: npx tsx scripts/attach-new-projects-media.ts
 */
import "dotenv/config";
import { assertNotProduction } from "./guard-prod";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { prisma } from "@/lib/db/prisma";

const SRC = path.resolve("creators_new");
const PUB = path.resolve("public/properties");

// DB property name -> { dir (rel to creators_new), prefix }
const P: Record<string, { dir: string; prefix: string }> = {
  "Atlantis": { dir: "Ghaziabad NH24/SKA Atlantis", prefix: "atlantis" },
  "Cosmos Corner": { dir: "Ghaziabad NH24/AU Cosmos", prefix: "cosmos" },
  "Empire": { dir: "Ghaziabad NH24/Gulshan Empire", prefix: "empire" },
  "IMPERIA": { dir: "Ghaziabad NH24/SKA Imperia", prefix: "skaimperia" },
  "Jade Phase 1": { dir: "Ghaziabad NH24/County Jade", prefix: "jade" },
  "Mayflower": { dir: "Ghaziabad NH24/Prestige MayFlower", prefix: "mayflower" },
  "Mulberry": { dir: "Ghaziabad NH24/Prestige Mulberry", prefix: "mulberry" },
  "Oakwood": { dir: "Ghaziabad NH24/Prestige Oakwood", prefix: "oakwood" },
  "PLEIADDES": { dir: "Greater Noida West/RG", prefix: "pleiaddes" },
  "Rosemont Residency - (Phase-01)": { dir: "Ghaziabad NH24/Aditya Rosemont", prefix: "rosemont" },
  "Trevana Residency": { dir: "Ghaziabad NH24/Karyan Trevana Residences", prefix: "trevana" },
};

const IMG_EXT = new Set([".png", ".webp", ".jpg", ".jpeg"]);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
// sips: convert to jpg + cap long edge at 1600.
const toJpg = (src: string, dst: string) =>
  execSync(`sips -s format jpeg -s formatOptions 85 -Z 1600 ${JSON.stringify(src)} --out ${JSON.stringify(dst)}`, { stdio: "ignore" });

function parseArea(file: string): number | null {
  const base = file.slice(0, -path.extname(file).length);
  const m = base.match(/([\d,]{3,})\s*$/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}
function normLabel(file: string): string {
  const base = file.slice(0, -path.extname(file).length);
  return norm(base.replace(/[_\s-]*[\d,]{3,}\s*$/, ""));
}

async function main() {
  assertNotProduction();
  const linked: string[] = [], missing: string[] = [], reviews: string[] = [];
  for (const [name, { dir, prefix }] of Object.entries(P)) {
    const srcDir = path.join(SRC, dir);
    if (!fs.existsSync(srcDir)) { reviews.push(`${name}: source dir missing`); continue; }
    const prop = await prisma.property.findFirst({ where: { name }, select: { id: true, configurations: { select: { id: true, label: true, areaSqFt: true } } } });
    if (!prop) { reviews.push(`${name}: no DB property`); continue; }
    const files = fs.readdirSync(srcDir).filter((f) => IMG_EXT.has(path.extname(f).toLowerCase()));
    const media: { type: string; url: string; alt: string; sortOrder: number }[] = [];

    // Classifiers (mutually exclusive buckets).
    const isElevation = (f: string) => /el[ae]vation/i.test(f);
    // "land la…" also catches the "laypout" typo; plus site/master/project variants.
    const isMasterPlan = (f: string) =>
      /land\s*la|site\s*la|master\s*plan|project\s*la/i.test(f);
    // Filenames that look like a unit/floor plan (so an unmatched one is never
    // mistaken for a gallery photo).
    const looksLikePlan = (f: string) =>
      /bhk|unit|floor\s*layout|\d\s*b\s*\+|\+\s*\d*\s*t/i.test(f);

    // 1) COVER = elevation (best/first). Never a layout or floor plan.
    const elev = files.find(isElevation);
    if (elev) {
      const dst = `${prefix}-cover.jpg`;
      toJpg(path.join(srcDir, elev), path.join(PUB, dst));
      media.push({ type: "cover", url: `/properties/${dst}`, alt: `${name} front elevation`, sortOrder: 0 });
    } else reviews.push(`${name}: no elevation image (cover missing)`);

    // 2) MASTER PLAN = land/site/project layout image(s) → dedicated "layout" type.
    const masterPlans = files.filter(isMasterPlan);
    masterPlans.forEach((f, i) => {
      const dst = `${prefix}-layout${i === 0 ? "" : i + 1}.jpg`;
      toJpg(path.join(srcDir, f), path.join(PUB, dst));
      media.push({ type: "layout", url: `/properties/${dst}`, alt: `${name} master plan`, sortOrder: 10 + i });
    });

    // 3) FLOOR PLANS = unit plans matched to configs (everything not elevation/master-plan).
    const plans = files.filter((f) => !isElevation(f) && !isMasterPlan(f));
    const parsed = plans.map((f) => ({ f, ext: path.extname(f).toLowerCase(), area: parseArea(f), nl: normLabel(f), used: false }));
    for (const c of prop.configurations) {
      // 1) exact area match; 2) same-label match (order-based for repeated labels).
      //    Only ever maps an image whose config LABEL matches — never across types.
      let hit = c.areaSqFt > 0 ? parsed.find((x) => !x.used && x.area === c.areaSqFt) : undefined;
      if (!hit) {
        hit = parsed.find((x) => !x.used && x.nl === norm(c.label));
        if (hit && hit.area != null && c.areaSqFt > 0 && hit.area !== c.areaSqFt)
          reviews.push(`${name} · "${c.label}" (config ${c.areaSqFt}) ← "${hit.f}" (file area ${hit.area}) — label-matched, area differs; verify`);
      }
      if (!hit) { missing.push(`${name} · "${c.label}" (${c.areaSqFt})`); continue; }
      hit.used = true;
      const dst = `${prefix}-fp-${c.areaSqFt}${hit.ext}`;
      fs.copyFileSync(path.join(srcDir, hit.f), path.join(PUB, dst));
      await prisma.configuration.update({ where: { id: c.id }, data: { floorPlanImage: `/properties/${dst}` } });
      linked.push(`${name} · "${c.label}" (${c.areaSqFt}) → ${dst}`);
    }

    // 4) GALLERY = remaining images that are genuine photos (not unmatched plans).
    //    An unmatched plan-looking image is flagged, never shown as a gallery photo.
    let g = 0;
    for (const x of parsed) {
      if (x.used) continue;
      if (looksLikePlan(x.f)) {
        reviews.push(`${name}: unmapped floor-plan image "${x.f}" (no matching config — left out)`);
        continue;
      }
      const dst = `${prefix}-g${++g}${x.ext}`;
      fs.copyFileSync(path.join(srcDir, x.f), path.join(PUB, dst));
      media.push({ type: "gallery", url: `/properties/${dst}`, alt: `${name} view ${g}`, sortOrder: 100 + g });
    }

    // Replace only the media rows we manage (cover/layout/gallery). Idempotent.
    await prisma.propertyMedia.deleteMany({ where: { propertyId: prop.id, type: { in: ["cover", "gallery", "layout"] } } });
    if (media.length) await prisma.propertyMedia.createMany({ data: media.map((m) => ({ propertyId: prop.id, ...m })) });
    const fpCount = prop.configurations.length - missing.filter((m) => m.startsWith(name + " ")).length;
    console.log(`✓ ${name}: cover=${elev ? "yes" : "NO"} masterplan=${masterPlans.length} gallery=${g} floorplans=${fpCount}/${prop.configurations.length}`);
  }
  console.log(`\nlinked ${linked.length} floor plans`);
  if (missing.length) { console.log(`\n${missing.length} configs without a floor-plan image:`); missing.forEach((m) => console.log("  · " + m)); }
  if (reviews.length) { console.log(`\n⚠ review:`); reviews.forEach((r) => console.log("  · " + r)); }
  await prisma.$disconnect();
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
