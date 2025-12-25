import type { Transaction } from '@/types/Transaction';

const DB_NAME = 'penny-plummet';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';
const TIMESTAMP_INDEX = 'timestamp';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex(TIMESTAMP_INDEX, 'timestamp');
      } else {
        const store = request.transaction?.objectStore(STORE_NAME);
        if (store && !store.indexNames.contains(TIMESTAMP_INDEX)) {
          store.createIndex(TIMESTAMP_INDEX, 'timestamp');
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
};

const withStore = async <T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = run(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getLatestTransactions = async (limit: number): Promise<Transaction[]> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index(TIMESTAMP_INDEX);
    const results: Transaction[] = [];
    const request = index.openCursor(null, 'prev');

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || results.length >= limit) {
        resolve(results);
        return;
      }
      results.push(cursor.value as Transaction);
      cursor.continue();
    };

    request.onerror = () => reject(request.error);
  });
};

export const putTransaction = async (transaction: Transaction): Promise<void> => {
  await withStore('readwrite', store => store.put(transaction));
};

export const deleteTransactionsById = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;

  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    ids.forEach(id => store.delete(id));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

export const replaceAllTransactions = async (transactions: Transaction[]): Promise<void> => {
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.clear();
    transactions.forEach(item => store.put(item));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

export const clearTransactionsDb = async (): Promise<void> => {
  await withStore('readwrite', store => store.clear());
};
