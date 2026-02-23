import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function connect(dbName = process.env.DB_NAME) {
  try {
    return await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName || process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });
  } catch (err) {
    console.log('Database connection failed, running without database:', err?.message || err);
    // Return a mock connection for testing
    return {
      query: async () => [[], []],
      end: async () => {},
      ping: async () => {}
    };
  }
}

async function connectAdmin(dbName = process.env.DB_NAME_ADMIN) {
  const resolvedHost = process.env.DB_HOST_ADMIN || process.env.DB_HOST;
  const resolvedUser = process.env.DB_USER_ADMIN || process.env.DB_USER || 'root';
  const resolvedPassword = process.env.DB_PASSWORD_ADMIN ?? process.env.DB_PASSWORD ?? '';
  const resolvedPort = process.env.DB_PORT_ADMIN || process.env.DB_PORT || 3306;
  const resolvedDatabase = dbName || process.env.DB_NAME_ADMIN || process.env.DB_NAME;

  if (!resolvedDatabase) {
    throw new Error('Admin database is not configured (DB_NAME_ADMIN or DB_NAME)');
  }

  try {
    return await mysql.createConnection({
      host: resolvedHost,
      user: resolvedUser,
      password: resolvedPassword,
      database: resolvedDatabase,
      port: resolvedPort,
    });
  } catch (err) {
    console.log('Admin database connection failed, running without database:', err?.message || err);
    // Return a mock connection for testing
    return {
      query: async () => [[], []],
      end: async () => {},
      ping: async () => {}
    };
  }
}

export { connect, connectAdmin };
