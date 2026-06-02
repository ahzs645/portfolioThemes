const DB_NAME = 'portfolioThemes';
const DB_VERSION = 1;
const STORE_NAME = 'settings';
const RANDOM_THEME_GATE_KEY = 'random-theme-gate';

function openThemeSelectionDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(mode, callback) {
  return openThemeSelectionDb().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const result = callback(store);

    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };
  }));
}

export async function readRandomThemeGate() {
  let request;
  await withStore('readonly', (store) => {
    request = store.get(RANDOM_THEME_GATE_KEY);
  });
  return request?.result || null;
}

export async function writeRandomThemeGate(state) {
  await withStore('readwrite', (store) => {
    store.put(state, RANDOM_THEME_GATE_KEY);
  });
}
