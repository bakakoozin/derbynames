import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

// Pool de connexions pour réutiliser les connexions
let connectionPool: mysql.Pool | null = null;

function getConnectionPool() {
  if (!connectionPool) {
    connectionPool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return connectionPool;
}

export function getDb() {
  const pool = getConnectionPool();
  return drizzle(pool, { schema, mode: 'default' });
}

