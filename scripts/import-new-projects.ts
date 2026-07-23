/**
 * Import the new NH24 (Ghaziabad) + RG (Greater Noida West) projects.
 *
 * Idempotent: `importPaths` upserts by slug, so existing properties are
 * untouched and re-running is safe.
 *
 * Two source quirks handled here:
 *  - `Creators Saviour.xlsx` is explicitly ignored (per client instruction).
 *  - The Prestige MayFlower sheet's "Project Name" cell reads "Oakwood" (a
 *    copy-paste error), which would collide with Prestige Oakwood on the
 *    builder+project slug. We import it from a patched temp copy named
 *    "Mayflower" (from the authoritative folder/file name). The source file is
 *    never modified.
 *
 * Run: npx tsx scripts/import-new-projects.ts
 */
import "dotenv/config";
import { assertNotProduction } from "./guard-prod";
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db/prisma";
import { importPaths, formatReport } from "@/lib/import/importer";

const DIRS = ["creators_new/Greater Noida West/RG", "creators_new/Ghaziabad NH24"];
const IGNORE = "Creators Saviour";
const MAYFLOWER = "Creators Prestige City Mayflower.xlsx";
const TMP = path.resolve("data/incoming/_mayflower-fixed.xlsx");

function collect(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return collect(p);
    if (!e.name.endsWith(".xlsx") || e.name.startsWith("~$")) return [];
    if (e.name.includes(IGNORE)) return [];
    return [p];
  });
}

/** Write a copy of the MayFlower sheet with its project name corrected. */
async function patchedMayflower(src: string): Promise<string> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(src);
  let patched = false;
  wb.eachSheet((ws) =>
    ws.eachRow((row) => {
      row.eachCell((cell, col) => {
        const raw = cell.value;
        const v =
          raw == null
            ? ""
            : typeof raw === "object" && "text" in raw
              ? String((raw as { text: unknown }).text ?? "")
              : String(raw);
        if (/^project name$/i.test(v.trim())) {
          ws.getCell(row.number, col + 1).value = "Mayflower";
          patched = true;
        }
      });
    }),
  );
  if (!patched) throw new Error("MayFlower: 'Project Name' cell not found");
  fs.mkdirSync(path.dirname(TMP), { recursive: true });
  await wb.xlsx.writeFile(TMP);
  return TMP;
}

async function main() {
  assertNotProduction();

  const all = DIRS.flatMap(collect).sort();
  const mayflowerSrc = all.find((f) => path.basename(f) === MAYFLOWER);
  const regular = all.filter((f) => path.basename(f) !== MAYFLOWER);

  const files = [...regular];
  if (mayflowerSrc) files.push(await patchedMayflower(mayflowerSrc));

  console.log(`Importing ${files.length} datasheets ("${IGNORE}" excluded):`);
  files.forEach((f) => console.log("  " + path.relative(process.cwd(), f)));

  const reports = await importPaths(files);
  console.log("\n" + formatReport(reports));

  if (fs.existsSync(TMP)) fs.unlinkSync(TMP);

  const total = await prisma.property.count();
  const cities = await prisma.property.groupBy({ by: ["city"], _count: true });
  console.log(`\nDB now: ${total} properties`);
  console.log("Cities:", cities.map((c) => `${c.city}(${c._count})`).join(" | "));
  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
