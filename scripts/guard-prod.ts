/**
 * Safety guard for data scripts.
 *
 * Every script in this folder writes to whatever `DATABASE_URL` points at. To
 * make an accidental production write impossible, each write script calls
 * `assertNotProduction()` first: it aborts when the connection targets the
 * production Neon endpoint unless you deliberately pass `--allow-prod`.
 *
 * Local development should point at the Neon `dev` branch (see README/.env.example).
 */

/** Production Neon endpoint id — writes here require an explicit opt-in. */
const PROD_ENDPOINT = "ep-steep-brook-atru7si9";

function hostOf(url: string): string {
  return url.replace(/.*@([^/?]+).*/, "$1");
}

export function assertNotProduction(): void {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) {
    console.error("✖ DATABASE_URL is not set — refusing to run.");
    process.exit(1);
  }
  const host = hostOf(url);
  const isProd = host.includes(PROD_ENDPOINT);
  const allowed = process.argv.includes("--allow-prod");

  if (isProd && !allowed) {
    console.error(
      [
        "",
        "✖ REFUSING TO RUN — this targets the PRODUCTION database.",
        `   endpoint: ${host}`,
        "",
        "   Point DATABASE_URL at the Neon `dev` branch for local work.",
        "   If you really intend to write to production, re-run with --allow-prod",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }

  if (isProd && allowed) {
    console.warn(
      [
        "",
        "⚠  WRITING TO PRODUCTION (--allow-prod was passed)",
        `   endpoint: ${host}`,
        "",
      ].join("\n"),
    );
    return;
  }

  console.log(`✓ target: ${host} (non-production)`);
}
