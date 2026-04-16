/**
 * Configuration MySQL pour Laragon
 * Remplace la configuration Supabase
 */

import mysql from 'mysql2/promise';

// Configuration de la connexion MySQL
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'waraniene_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Pool de connexions MySQL
let pool: mysql.Pool | null = null;

/**
 * Obtenir le pool de connexions MySQL
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Exécuter une requête SQL
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

/**
 * Exécuter une requête SQL unique (pour INSERT, UPDATE, DELETE)
 */
export async function execute(
  sql: string,
  params?: any[]
): Promise<mysql.ResultSetHeader> {
  const connection = await getPool().getConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } finally {
    connection.release();
  }
}

/**
 * Commencer une transaction
 */
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Générer un UUID v4 (compatible avec MySQL)
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Fermer le pool de connexions (utile pour les tests)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Vérifier la connexion à la base de données
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Erreur de connexion MySQL:', error);
    return false;
  }
}

// Export pour compatibilité avec l'ancien code Supabase
export const db = {
  query,
  execute,
  transaction,
  getPool,
  checkConnection,
  closePool,
};

export default db;
