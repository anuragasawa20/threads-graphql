/**
 * Database Layer - SQLite
 * 
 * Handles connection and initialization.
 * Uses better-sqlite3 for synchronous, simple API.
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { createSchema } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, '../../data/threads.db');

let db = null;

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

export function initDb() {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  createSchema(db);
  return db;
}
