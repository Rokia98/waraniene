/**
 * Couche d'abstraction de base de données
 * Supporte MySQL (Laragon) ET Supabase selon la configuration
 */

import { supabase, supabaseAdmin } from './supabase';
import * as mysqlDb from './mysql';

// Type de base de données à utiliser
export type DatabaseType = 'mysql' | 'supabase';

// Déterminer quelle base de données utiliser selon .env
export const DB_TYPE: DatabaseType = 
  process.env.DB_TYPE === 'mysql' ? 'mysql' : 'supabase';

console.log(`🗄️  Mode base de données: ${DB_TYPE.toUpperCase()}`);

/**
 * Interface unifiée pour les opérations de base de données
 */
export interface Database {
  // Requêtes SELECT
  select<T = any>(table: string, options?: {
    columns?: string[];
    where?: Record<string, any>;
    orderBy?: { column: string; direction: 'asc' | 'desc' };
    limit?: number;
    single?: boolean;
  }): Promise<T[]>;

  // Requête SELECT par ID
  selectById<T = any>(table: string, id: string): Promise<T | null>;

  // INSERT
  insert<T = any>(table: string, data: any): Promise<T>;

  // UPDATE
  update<T = any>(table: string, id: string, data: any): Promise<T | null>;

  // DELETE
  delete(table: string, id: string): Promise<boolean>;

  // Requête SQL brute (MySQL uniquement)
  query?<T = any>(sql: string, params?: any[]): Promise<T[]>;

  // Execute (INSERT/UPDATE/DELETE) (MySQL uniquement)
  execute?(sql: string, params?: any[]): Promise<any>;
}

/**
 * Implémentation MySQL
 */
class MySQLDatabase implements Database {
  async select<T = any>(table: string, options: any = {}): Promise<T[]> {
    const { columns = ['*'], where, orderBy, limit } = options;

    let sql = `SELECT ${columns.join(', ')} FROM ${table}`;
    const params: any[] = [];

    // WHERE clause
    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(key => `${key} = ?`);
      sql += ` WHERE ${conditions.join(' AND ')}`;
      params.push(...Object.values(where));
    }

    // ORDER BY
    if (orderBy && orderBy.column && orderBy.direction) {
      sql += ` ORDER BY ${orderBy.column} ${orderBy.direction.toUpperCase()}`;
    }

    // LIMIT - MySQL n'accepte pas de placeholder pour LIMIT
    if (limit) {
      sql += ` LIMIT ${parseInt(limit)}`;
    }

    return mysqlDb.query<T>(sql, params);
  }

  async selectById<T = any>(table: string, id: string): Promise<T | null> {
    const results = await mysqlDb.query<T>(
      `SELECT * FROM ${table} WHERE id = ?`,
      [id]
    );
    return results.length > 0 ? results[0] : null;
  }

  async insert<T = any>(table: string, data: any): Promise<T> {
    const id = data.id || mysqlDb.generateUUID();
    
    // Ajouter l'ID aux données si pas présent
    const dataWithId = { ...data, id };
    
    const columns = Object.keys(dataWithId);
    const values = Object.values(dataWithId);
    const placeholders = columns.map(() => '?').join(', ');

    await mysqlDb.execute(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return this.selectById<T>(table, id) as Promise<T>;
  }

  async update<T = any>(table: string, id: string, data: any): Promise<T | null> {
    const fields = Object.keys(data).map(key => `${key} = ?`);
    const values = [...Object.values(data), id];

    await mysqlDb.execute(
      `UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.selectById<T>(table, id);
  }

  async delete(table: string, id: string): Promise<boolean> {
    const result = await mysqlDb.execute(
      `DELETE FROM ${table} WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  // Accès direct aux fonctions MySQL
  query = mysqlDb.query;
  execute = mysqlDb.execute;
}

/**
 * Implémentation Supabase
 */
class SupabaseDatabase implements Database {
  async select<T = any>(table: string, options: any = {}): Promise<T[]> {
    const { columns = '*', where, orderBy, limit, single } = options;

    let query = supabase.from(table).select(
      Array.isArray(columns) ? columns.join(', ') : columns
    );

    // WHERE clause
    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // ORDER BY
    if (orderBy) {
      query = query.order(orderBy.column, { 
        ascending: orderBy.direction === 'asc' 
      });
    }

    // LIMIT
    if (limit) {
      query = query.limit(limit);
    }

    if (single) {
      const { data, error } = await query.single();
      if (error) throw error;
      return data ? [data as T] : [];
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as T[];
  }

  async selectById<T = any>(table: string, id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as T;
  }

  async insert<T = any>(table: string, data: any): Promise<T> {
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }

  async update<T = any>(table: string, id: string, data: any): Promise<T | null> {
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return result as T;
  }

  async delete(table: string, id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);

    return !error;
  }
}

/**
 * Instance de la base de données selon le type configuré
 */
export const db: Database = DB_TYPE === 'mysql' 
  ? new MySQLDatabase() 
  : new SupabaseDatabase();

/**
 * Helper pour les transactions MySQL (n'existe pas dans Supabase)
 */
export async function transaction<T>(
  callback: (conn: any) => Promise<T>
): Promise<T> {
  if (DB_TYPE === 'mysql') {
    return mysqlDb.transaction(callback);
  } else {
    // Supabase ne supporte pas les transactions manuelles
    // Exécuter directement le callback
    console.warn('⚠️  Transactions non supportées en mode Supabase');
    return callback(null as any);
  }
}

/**
 * Helper pour générer des UUIDs compatibles
 */
export function generateUUID(): string {
  if (DB_TYPE === 'mysql') {
    return mysqlDb.generateUUID();
  } else {
    // Supabase génère automatiquement les UUID
    return crypto.randomUUID();
  }
}

/**
 * Helper pour vérifier la connexion
 */
export async function checkConnection(): Promise<boolean> {
  try {
    if (DB_TYPE === 'mysql') {
      return mysqlDb.checkConnection();
    } else {
      const { error } = await supabase.from('artisans').select('id').limit(1);
      return !error;
    }
  } catch {
    return false;
  }
}

/**
 * Exporter le type de DB pour les services
 */
export { DB_TYPE as dbType };

// Exporter aussi les clients originaux pour des cas spéciaux
export { supabase, supabaseAdmin } from './supabase';
export { query as mysqlQuery, execute as mysqlExecute } from './mysql';

// Default export pour compatibilité avec `import db from '@/lib/db'`
export default db;
