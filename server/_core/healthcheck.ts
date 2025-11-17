import "dotenv/config";
import { createConnection } from "mysql2/promise";

type Check = {
  name: string;
  ok: boolean;
  level: "PASS" | "WARN" | "FAIL";
  message?: string;
};

function pass(name: string, message?: string): Check {
  return { name, ok: true, level: "PASS", message };
}

function warn(name: string, message: string): Check {
  return { name, ok: true, level: "WARN", message };
}

function fail(name: string, message: string): Check {
  return { name, ok: false, level: "FAIL", message };
}

async function checkNode(): Promise<Check> {
  const ok = parseInt(process.versions.node.split(".")[0], 10) >= 20;
  return ok
    ? pass("node-version", `Node ${process.versions.node}`)
    : fail("node-version", `Node ${process.versions.node} (need >= 20)`);
}

function has(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

async function checkEnv(): Promise<Check[]> {
  const required = [
    ["VITE_APP_ID", process.env.VITE_APP_ID],
    ["VITE_OAUTH_PORTAL_URL", process.env.VITE_OAUTH_PORTAL_URL],
    ["OAUTH_SERVER_URL", process.env.OAUTH_SERVER_URL],
    ["JWT_SECRET", process.env.JWT_SECRET],
  ] as const;

  const results: Check[] = required.map(([k, v]) =>
    has(v) ? pass(`env:${k}`) : fail(`env:${k}`, `${k} is required`)
  );

  // Optional but recommended
  if (!has(process.env.OWNER_OPEN_ID)) {
    results.push(warn("env:OWNER_OPEN_ID", "not set (admin-only features disabled)"));
  }

  return results;
}

async function checkDB(): Promise<Check> {
  const url = process.env.DATABASE_URL;
  if (!has(url)) {
    return warn("database", "DATABASE_URL not set (DB-backed features disabled)");
  }
  try {
    const conn = await createConnection(url!);
    await conn.query("SELECT 1");
    await conn.end();
    return pass("database", "connected successfully");
  } catch (e: any) {
    return fail("database", `connection failed: ${e?.message || String(e)}`);
  }
}

function checkStorage(): Check[] {
  const externalEnabled = String(process.env.EXTERNAL_STORAGE_ENABLED).toLowerCase() === "true";
  const provider = (process.env.STORAGE_PROVIDER || "cloudflare").toLowerCase();
  const checks: Check[] = [];

  if (externalEnabled) {
    if (provider === "cloudflare") {
      const req = [
        ["R2_ENDPOINT", process.env.R2_ENDPOINT],
        ["R2_ACCESS_KEY_ID", process.env.R2_ACCESS_KEY_ID],
        ["R2_SECRET_ACCESS_KEY", process.env.R2_SECRET_ACCESS_KEY],
        ["R2_BUCKET_NAME", process.env.R2_BUCKET_NAME],
        ["R2_PUBLIC_URL", process.env.R2_PUBLIC_URL],
      ] as const;
      req.forEach(([k, v]) => checks.push(has(v) ? pass(`env:${k}`) : fail(`env:${k}`, `${k} is required with EXTERNAL_STORAGE_ENABLED=true`)));
    } else if (provider === "backblaze") {
      const req = [
        ["B2_ENDPOINT", process.env.B2_ENDPOINT],
        ["B2_KEY_ID", process.env.B2_KEY_ID],
        ["B2_APPLICATION_KEY", process.env.B2_APPLICATION_KEY],
        ["B2_BUCKET_NAME", process.env.B2_BUCKET_NAME],
        ["B2_PUBLIC_URL", process.env.B2_PUBLIC_URL],
      ] as const;
      req.forEach(([k, v]) => checks.push(has(v) ? pass(`env:${k}`) : fail(`env:${k}`, `${k} is required with EXTERNAL_STORAGE_ENABLED=true`)));
    } else {
      checks.push(fail("storage:provider", `unknown STORAGE_PROVIDER: ${provider}`));
    }
  } else {
    // Using built-in Manus storage by default
    const url = process.env.BUILT_IN_FORGE_API_URL;
    const key = process.env.BUILT_IN_FORGE_API_KEY;
    if (!has(url) || !has(key)) {
      checks.push(warn("storage", "Uploads disabled: set BUILT_IN_FORGE_* or enable external storage"));
    } else {
      checks.push(pass("storage", "Built-in storage configured"));
    }
  }

  return checks;
}

async function main() {
  const results: Check[] = [];
  results.push(await checkNode());
  results.push(...(await checkEnv()));
  results.push(await checkDB());
  results.push(...checkStorage());

  const failures = results.filter(r => r.level === "FAIL");
  const warnings = results.filter(r => r.level === "WARN");

  for (const r of results) {
    const suffix = r.message ? ` - ${r.message}` : "";
    console.log(`[${r.level}] ${r.name}${suffix}`);
  }

  if (failures.length > 0) {
    console.error(`\nHealth check failed with ${failures.length} error(s).`);
    process.exit(1);
  }
  if (warnings.length > 0) {
    console.warn(`\nCompleted with ${warnings.length} warning(s).`);
  }
}

main().catch(err => {
  console.error("[FAIL] healthcheck", err);
  process.exit(1);
});

