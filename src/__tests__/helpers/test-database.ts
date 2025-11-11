import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { randomUUID } from "crypto";

const generateDatabaseURL = (schema: string) => {
  if (!process.env.DATABASE_URL) {
    throw new Error("Por favor, defina DATABASE_URL no arquivo .env");
  }
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set("schema", schema);
  return url.toString();
};

export class TestDatabase {
  private schema: string;
  public prisma: PrismaClient;

  constructor() {
    this.schema = `test_${randomUUID()}`;
    const databaseUrl = generateDatabaseURL(this.schema);

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async setup() {
    process.env.DATABASE_URL = generateDatabaseURL(this.schema);
    execSync("npx prisma migrate deploy", {
      env: {
        ...process.env,
        DATABASE_URL: generateDatabaseURL(this.schema),
      },
    });
    await this.prisma.$connect();
  }

  async teardown() {
    await this.prisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`
    );
    await this.prisma.$disconnect();
  }

  async cleanup() {
    const tables = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname = ${this.schema}`;

    for (const { tablename } of tables) {
      if (tablename !== "_prisma_migrations") {
        await this.prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "${this.schema}"."${tablename}" CASCADE`
        );
      }
    }
  }
}
