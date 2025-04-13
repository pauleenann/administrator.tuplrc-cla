import { initDB } from "./initializeIndexedDb";

export const saveResourceOffline = async(data) => {
    const db = await initDB();
    const tx = db.transaction("resources", "readwrite"); // open transaction

    const store = tx.objectStore("resources");
    await store.put(data);
    await tx.done;
    console.log("Data saved in resources object store");
};

