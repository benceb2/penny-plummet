import type { Transaction } from '@/types/Transaction';

const DB_NAME = 'penny-plummet';
const DB_VERSION = 2;
const STORE_NAME = 'transactions';
const TIMESTAMP_INDEX = 'timestamp';
const GAME_TIMESTAMP_INDEX = 'game_timestamp';
const TYPE_TIMESTAMP_INDEX = 'type_timestamp';
const GAME_TYPE_TIMESTAMP_INDEX = 'game_type_timestamp';
const MAX_TIMESTAMP = Number.MAX_SAFE_INTEGER;

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
        store.createIndex(GAME_TIMESTAMP_INDEX, ['game', 'timestamp']);
        store.createIndex(TYPE_TIMESTAMP_INDEX, ['type', 'timestamp']);
        store.createIndex(GAME_TYPE_TIMESTAMP_INDEX, ['game', 'type', 'timestamp']);
      } else {
        const store = request.transaction?.objectStore(STORE_NAME);
        if (store && !store.indexNames.contains(TIMESTAMP_INDEX)) {
          store.createIndex(TIMESTAMP_INDEX, 'timestamp');
        }
        if (store && !store.indexNames.contains(GAME_TIMESTAMP_INDEX)) {
          store.createIndex(GAME_TIMESTAMP_INDEX, ['game', 'timestamp']);
        }
        if (store && !store.indexNames.contains(TYPE_TIMESTAMP_INDEX)) {
          store.createIndex(TYPE_TIMESTAMP_INDEX, ['type', 'timestamp']);
        }
        if (store && !store.indexNames.contains(GAME_TYPE_TIMESTAMP_INDEX)) {
          store.createIndex(GAME_TYPE_TIMESTAMP_INDEX, ['game', 'type', 'timestamp']);
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

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index(TIMESTAMP_INDEX);
    const results: Transaction[] = [];
    const request = index.openCursor(null, 'prev');

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(results);
        return;
      }
      results.push(cursor.value as Transaction);
      cursor.continue();
    };

    request.onerror = () => reject(request.error);
  });
};

type TransactionFilters = {
  game?: Transaction['game'] | 'all';
  type?: Transaction['type'] | 'all';
};

type TransactionSummary = {
  total: number;
  totalWins: number;
  totalLosses: number;
  totalPushes: number;
  netAmount: number;
};

const normalizeFilters = (filters?: TransactionFilters) => ({
  game: filters?.game ?? 'all',
  type: filters?.type ?? 'all'
});

const getCursorSource = (
  store: IDBObjectStore,
  filters: TransactionFilters
): { source: IDBIndex; range: IDBKeyRange | null } => {
  const { game, type } = normalizeFilters(filters);

  if (game !== 'all' && type !== 'all') {
    return {
      source: store.index(GAME_TYPE_TIMESTAMP_INDEX),
      range: IDBKeyRange.bound([game, type, 0], [game, type, MAX_TIMESTAMP])
    };
  }

  if (game !== 'all') {
    return {
      source: store.index(GAME_TIMESTAMP_INDEX),
      range: IDBKeyRange.bound([game, 0], [game, MAX_TIMESTAMP])
    };
  }

  if (type !== 'all') {
    return {
      source: store.index(TYPE_TIMESTAMP_INDEX),
      range: IDBKeyRange.bound([type, 0], [type, MAX_TIMESTAMP])
    };
  }

  return { source: store.index(TIMESTAMP_INDEX), range: null };
};

export const getTransactionsPage = async (
  filters: TransactionFilters,
  offset: number,
  limit: number
): Promise<Transaction[]> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const { source, range } = getCursorSource(store, filters);
    const results: Transaction[] = [];
    let skipped = 0;
    const request = source.openCursor(range, 'prev');

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(results);
        return;
      }
      if (skipped < offset) {
        skipped += 1;
        cursor.continue();
        return;
      }
      results.push(cursor.value as Transaction);
      if (results.length >= limit) {
        resolve(results);
        return;
      }
      cursor.continue();
    };

    request.onerror = () => reject(request.error);
  });
};

export const getTransactionSummary = async (
  filters: TransactionFilters
): Promise<TransactionSummary> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const { source, range } = getCursorSource(store, filters);
    const summary: TransactionSummary = {
      total: 0,
      totalWins: 0,
      totalLosses: 0,
      totalPushes: 0,
      netAmount: 0
    };
    const request = source.openCursor(range, 'next');

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(summary);
        return;
      }

      const item = cursor.value as Transaction;
      summary.total += 1;
      summary.netAmount += item.amount;

      if (item.type === 'win') summary.totalWins += 1;
      if (item.type === 'loss') summary.totalLosses += 1;
      if (item.type === 'push') summary.totalPushes += 1;

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

export const getTransactionCount = async (): Promise<number> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
