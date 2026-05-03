import dotenv from "dotenv";
import path from "path";

let loaded = false;

export function getApiKey(): string {
  if (!loaded) {
    dotenv.config({
      path: path.join(process.cwd(), ".env.local"),
      override: true,
    });
    loaded = true;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set in .env.local");
  }
  return key;
}
