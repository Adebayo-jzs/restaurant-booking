import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // For Supabase, migrations require the direct connection string
    url: process.env["DIRECT_URL"],
  },
});
