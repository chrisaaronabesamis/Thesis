import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const SQL_FILE = process.env.IMPORT_SQL_FILE || path.resolve(process.cwd(), '..', 'bini.sql');
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

async function tryImportWithMysqlCli() {
  if (!fs.existsSync(SQL_FILE)) throw new Error(`SQL file not found: ${SQL_FILE}`);
  const passwordPart = DB_PASSWORD ? `-p"${DB_PASSWORD.replace(/"/g, '\\"')}"` : '';
  const cmd = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${passwordPart} < "${SQL_FILE.replace(/"/g, '\\"')}"`;
  console.log('Running:', cmd);
  return runCommand(cmd);
}

async function tryImportWithNodeMysql2() {
  // As fallback, stream the SQL and execute statements via mysql2.
  const mysql = await import('mysql2/promise');
  if (!fs.existsSync(SQL_FILE)) throw new Error(`SQL file not found: ${SQL_FILE}`);
  const raw = fs.readFileSync(SQL_FILE, 'utf8');
  const conn = await mysql.createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD });
  console.log('Connected via mysql2, executing SQL...');
  // naive splitting by ; but keeps things simple for this dump
  const statements = raw.split(/;\n/).map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
    } catch (err) {
      console.warn('Statement failed:', err.message || err);
    }
  }
  await conn.end();
  return { stdout: 'imported via mysql2', stderr: '' };
}

(async function main() {
  try {
    try {
      const res = await tryImportWithMysqlCli();
      console.log('Imported via mysql CLI', res.stdout || res.stderr);
      process.exit(0);
    } catch (err) {
      console.warn('mysql CLI import failed, falling back to mysql2:', err && err.err ? err.err.message : err);
    }

    const res2 = await tryImportWithNodeMysql2();
    console.log(res2.stdout || res2.stderr || 'Import completed');
    process.exit(0);
  } catch (finalErr) {
    console.error('Import failed:', finalErr);
    process.exit(2);
  }
})();
