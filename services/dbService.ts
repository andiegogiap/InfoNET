import { DBSchema, openDB, IDBPDatabase } from 'idb';
import { Agent, ApiKeys, CustomInstructions } from '../types';

const DB_NAME = 'AIIntelInfonetDB';
const DB_VERSION = 1;
const STORE_NAME = 'appConfig';

// Define the schema for our database. This helps with type safety.
interface AppDBSchema extends DBSchema {
  [STORE_NAME]: {
    key: string; // The key will be a string (e.g., 'apiKeys', 'agents')
    value: Agent[] | Agent | ApiKeys | CustomInstructions; // The value can be one of these types
  };
}

// A singleton promise for the database connection
let dbPromise: Promise<IDBPDatabase<AppDBSchema>> | null = null;

const initDB = (): Promise<IDBPDatabase<AppDBSchema>> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = openDB<AppDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create a key-value object store for application configuration
        db.createObjectStore(STORE_NAME);
      }
    },
  });
  return dbPromise;
};

/**
 * Gets a value from the database by its key.
 * @param key The key of the item to retrieve.
 * @returns The value, or undefined if not found.
 */
export const dbGet = async <T>(key: string): Promise<T | undefined> => {
  try {
    const db = await initDB();
    return await db.get(STORE_NAME, key) as T | undefined;
  } catch (error) {
    console.error(`Failed to get item with key "${key}" from IndexedDB:`, error);
    return undefined;
  }
};

/**
 * Sets a value in the database with a specific key.
 * @param key The key for the item.
 * @param value The value to store.
 */
export const dbSet = async (key: string, value: any): Promise<void> => {
  try {
    const db = await initDB();
    await db.put(STORE_NAME, value, key);
  } catch (error) {
    console.error(`Failed to set item with key "${key}" in IndexedDB:`, error);
  }
};
