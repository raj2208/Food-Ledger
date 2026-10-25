import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Not env(): that throws when unset, which would break `prisma generate`
    // (run on postinstall) before .env exists. Commands that connect fail clearly.
    url: process.env.DATABASE_URL ?? "",
  },
});
