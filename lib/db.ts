import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";

let envLoaded = false;

function loadEnv() {
  if (envLoaded) return;
  // Same workaround as lib/env.ts — Next.js 16 + Turbopack sets vars to empty
  // strings before .env.local loads, so we override.
  if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.join(process.cwd(), ".env.local"), override: true });
  }
  envLoaded = true;
}

let sqlClient: NeonQueryFunction<false, false> | null = null;
let schemaReady = false;

export function getSql(): NeonQueryFunction<false, false> {
  loadEnv();
  if (!sqlClient) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add a Neon Postgres database in Vercel Storage, " +
          "or set DATABASE_URL in .env.local for local development."
      );
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS meals (
      id          SERIAL PRIMARY KEY,
      timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      date        TEXT        NOT NULL,
      image_data  TEXT,
      food_name   TEXT        NOT NULL,
      description TEXT,
      calories    REAL        NOT NULL DEFAULT 0,
      protein     REAL        NOT NULL DEFAULT 0,
      carbs       REAL        NOT NULL DEFAULT 0,
      fat         REAL        NOT NULL DEFAULT 0,
      fiber       REAL        NOT NULL DEFAULT 0,
      confidence  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date)`;
  schemaReady = true;
}
