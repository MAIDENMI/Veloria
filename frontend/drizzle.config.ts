import { type Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    wranglerConfigPath: "wrangler.toml",
    dbName: "eunoia-db",
  },
} satisfies Config;
