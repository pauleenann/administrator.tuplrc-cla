import { initDB } from "./initializeIndexedDb";

export const deleteResourceFromIndexedDB = async (storeName, resourceId) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.delete(resourceId);
    await tx.done;
    console.log(`Resource with ID ${resourceId} has been removed from IndexedDB.`);
};

export const clearObjectStore = async (storeName) => {
    try {
      const db = await initDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
  
      // Clear all data in the object store
      await store.clear();
      await tx.done;
  
      console.log(`All data from object store "${storeName}" has been cleared.`);
    } catch (error) {
      console.error(`Failed to clear object store "${storeName}":`, error.message);
    }
  };
  