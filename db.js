const DB_NAME = 'recipeTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'recipes';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllRecipes() {
  const db = await openDB();
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const results = await requestToPromise(tx.objectStore(STORE_NAME).getAll());
    return results.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  } finally {
    db.close();
  }
}

export async function getRecipe(id) {
  const db = await openDB();
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    return await requestToPromise(tx.objectStore(STORE_NAME).get(id));
  } finally {
    db.close();
  }
}

export async function saveRecipe(recipe) {
  const db = await openDB();
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await requestToPromise(tx.objectStore(STORE_NAME).put(recipe));
    return recipe;
  } finally {
    db.close();
  }
}

export async function deleteRecipe(id) {
  const db = await openDB();
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await requestToPromise(tx.objectStore(STORE_NAME).delete(id));
  } finally {
    db.close();
  }
}
