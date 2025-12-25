import { ref } from 'vue';

type IndexedDbStatus = 'checking' | 'supported' | 'unsupported';

export const useIndexedDbSupport = () => {
  const status = ref<IndexedDbStatus>('checking');

  const checkIndexedDbSupport = async (): Promise<boolean> => {
    if (typeof indexedDB === 'undefined') return false;

    return new Promise(resolve => {
      const testDbName = 'penny-plummet-support-test';
      let settled = false;

      try {
        const request = indexedDB.open(testDbName, 1);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('test')) {
            db.createObjectStore('test');
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          db.close();
          indexedDB.deleteDatabase(testDbName);
          if (!settled) {
            settled = true;
            resolve(true);
          }
        };

        request.onerror = () => {
          if (!settled) {
            settled = true;
            resolve(false);
          }
        };

        request.onblocked = () => {
          if (!settled) {
            settled = true;
            resolve(false);
          }
        };
      } catch (error) {
        console.warn('IndexedDB check failed:', error);
        if (!settled) {
          settled = true;
          resolve(false);
        }
      }
    });
  };

  const runCheck = async () => {
    const supported = await checkIndexedDbSupport();
    status.value = supported ? 'supported' : 'unsupported';
    return supported;
  };

  return {
    status,
    runCheck
  };
};
