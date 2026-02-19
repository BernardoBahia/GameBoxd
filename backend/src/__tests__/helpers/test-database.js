"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDatabase = void 0;
const client_1 = require("@prisma/client");
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const generateDatabaseURL = (schema) => {
    if (!process.env.DATABASE_URL) {
        throw new Error("Por favor, defina DATABASE_URL no arquivo .env");
    }
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.set("schema", schema);
    return url.toString();
};
class TestDatabase {
    schema;
    prisma;
    constructor() {
        this.schema = `test_${(0, crypto_1.randomUUID)()}`;
        const databaseUrl = generateDatabaseURL(this.schema);
        this.prisma = new client_1.PrismaClient();
    }
    async setup() {
        process.env.DATABASE_URL = generateDatabaseURL(this.schema);
        (0, child_process_1.execSync)("npx prisma migrate deploy", {
            env: {
                ...process.env,
                DATABASE_URL: generateDatabaseURL(this.schema),
            },
        });
        await this.prisma.$connect();
    }
    async teardown() {
        await this.prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`);
        await this.prisma.$disconnect();
    }
    async cleanup() {
        const tables = await this.prisma.$queryRaw `SELECT tablename FROM pg_tables WHERE schemaname = ${this.schema}`;
        for (const { tablename } of tables) {
            if (tablename !== "_prisma_migrations") {
                await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${this.schema}"."${tablename}" CASCADE`);
            }
        }
    }
}
exports.TestDatabase = TestDatabase;
