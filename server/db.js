"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = void 0;
var pg_1 = require("pg");
var node_postgres_1 = require("drizzle-orm/node-postgres");
var schema = require("@shared/schema");
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});
exports.db = (0, node_postgres_1.drizzle)({ client: exports.pool, schema: schema });
