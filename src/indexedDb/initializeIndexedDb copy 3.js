// indexedDb/initializeIndexedDb.js

import { openDB } from "idb";

const dbName = "LRCCLA";
// Remove the constant 'version = 1' from here if it's only used for init.
// Version management will now be dynamic for refresh.

/**
 * Initializes the database and creates stores if they don't exist.
 * Typically run once on application startup or if DB is known to be empty.
 * Uses a specific initial version (e.g., 1).
 */
export const initDB = async (status, type, publisher, publisherInfo, author, adviser, department, topic) => {
    const initialVersion = 1; // Define initial version here
    console.log(`Initializing DB '${dbName}' to version ${initialVersion} if needed.`);
    try {
        const db = await openDB(dbName, initialVersion, {
            upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`Upgrade triggered during init (v${oldVersion} -> v${newVersion})`);

                // --- Schema Definition ---
                // Resources
                if (!db.objectStoreNames.contains("resources")) {
                    console.log("Creating 'resources' store.");
                    const resourcesStore = db.createObjectStore("resources", { keyPath: "resource_id", autoIncrement: true });
                    resourcesStore.createIndex("resource_title", "resource_title", { unique: false });
                }

                // Publisher
                if (!db.objectStoreNames.contains("publisher")) {
                     console.log("Creating 'publisher' store.");
                    const pubStore = db.createObjectStore("publisher", { keyPath: "pub_id", autoIncrement: true });
                    pubStore.createIndex("pub_id", "pub_id", { unique: false });
                    if (Array.isArray(publisher)) {
                        publisher.forEach(pub => pubStore.add(pub));
                         console.log(`Populated 'publisher' with ${publisher.length} items.`);
                    }
                }

                 // PublisherInfo
                 if (!db.objectStoreNames.contains("publisherInfo")) {
                     console.log("Creating 'publisherInfo' store.");
                     const pubInfoStore = db.createObjectStore("publisherInfo", { keyPath: "pub_id", autoIncrement: true });
                     pubInfoStore.createIndex("pub_id", "pub_id", { unique: false });
                     if (Array.isArray(publisherInfo)) {
                         publisherInfo.forEach(pub => pubInfoStore.add(pub));
                         console.log(`Populated 'publisherInfo' with ${publisherInfo.length} items.`);
                     }
                 }

                 // Adviser
                 if (!db.objectStoreNames.contains("adviser")) {
                      console.log("Creating 'adviser' store.");
                     const adviserStore = db.createObjectStore("adviser", { keyPath: "adviser_id", autoIncrement: true });
                     adviserStore.createIndex("adviser_name", ["adviser_fname", "adviser_lname"], { unique: false });
                     // adviserStore.createIndex("adviser_id", "adviser_id", { unique: false }); // Add if needed
                     if (Array.isArray(adviser)) {
                         adviser.forEach(adv => adviserStore.add(adv));
                         console.log(`Populated 'adviser' with ${adviser.length} items.`);
                     }
                 }

                 // Author
                 if (!db.objectStoreNames.contains("author")) {
                     console.log("Creating 'author' store.");
                     const authorStore = db.createObjectStore("author", { keyPath: "author_id", autoIncrement: true });
                     authorStore.createIndex("author_name", ["author_fname", "author_lname"], { unique: false });
                     // authorStore.createIndex("author_id", "author_id", { unique: false }); // Add if needed
                     if (Array.isArray(author)) {
                         author.forEach(a => authorStore.add(a));
                         console.log(`Populated 'author' with ${author.length} items.`);
                     }
                 }

                 // ResourceType
                 if (!db.objectStoreNames.contains("resourcetype")) {
                     console.log("Creating 'resourcetype' store.");
                     const typeStore = db.createObjectStore("resourcetype", { keyPath: "type_id", autoIncrement: true });
                     if (Array.isArray(type)) {
                         type.forEach(t => typeStore.add(t));
                         console.log(`Populated 'resourcetype' with ${type.length} items.`);
                     }
                 }

                 // Availability
                 if (!db.objectStoreNames.contains("availability")) {
                      console.log("Creating 'availability' store.");
                     const availStore = db.createObjectStore("availability", { keyPath: "avail_id", autoIncrement: true });
                     if (Array.isArray(status)) {
                         status.forEach(stat => availStore.add(stat));
                         console.log(`Populated 'availability' with ${status.length} items.`);
                     }
                 }

                 // Department
                 if (!db.objectStoreNames.contains("department")) {
                      console.log("Creating 'department' store.");
                     const deptStore = db.createObjectStore("department", { keyPath: "dept_id", autoIncrement: true });
                     if (Array.isArray(department)) {
                         department.forEach(dept => deptStore.add(dept));
                         console.log(`Populated 'department' with ${department.length} items.`);
                     }
                 }

                 // Topic
                 if (!db.objectStoreNames.contains("topic")) {
                      console.log("Creating 'topic' store.");
                     const topicStore = db.createObjectStore("topic", { keyPath: "topic_id", autoIncrement: true });
                     if (Array.isArray(topic)) {
                         topic.forEach(top => topicStore.add(top));
                         console.log(`Populated 'topic' with ${topic.length} items.`);
                     }
                 }
                console.log("DB Initialization/Upgrade complete.");
            },
            blocked(currentVersion, blockedVersion, event) {
                 console.warn(`DB Init: Upgrade to version ${blockedVersion} blocked from version ${currentVersion}.`);
            },
            blocking(currentVersion, blockedVersion, event) {
                 console.log(`DB Init: Blocking version ${currentVersion}.`);
            }
        });
        await db.close(); // Close after operation
        console.log(`DB '${dbName}' initialized/checked.`);
        return db; // Return the db instance if needed immediately, otherwise void
    } catch (error) {
        console.error(`Error initializing database '${dbName}':`, error);
        throw error; // Rethrow to allow caller to handle
    }
};


/**
 * Refreshes data in all stores EXCEPT 'resources'.
 * It achieves this by deleting and recreating the other stores in an upgrade transaction.
 * Ensures the upgrade runs by dynamically checking and incrementing the version.
 */
export const refreshNonResourceStores = async (status, type, publisher, publisherInfo, author, adviser, department, topic) => {
    console.log(`Attempting to refresh non-resource stores in database: ${dbName}`);
    let dbInstance = null; // Keep track of the instance to close it reliably
    try {
        // 1. Get the current version
        dbInstance = await openDB(dbName); // Open with current version first
        const currentVersion = dbInstance.version;
        await dbInstance.close(); // Close this connection
        dbInstance = null; // Reset instance tracker

        const nextVersion = currentVersion + 1;
        console.log(`Current DB version: ${currentVersion}. Upgrading to ${nextVersion} to refresh stores.`);

        // 2. Open with the incremented version to trigger the upgrade
        dbInstance = await openDB(dbName, nextVersion, {
            async upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`Upgrade triggered (v${oldVersion} -> v${newVersion}): Refreshing non-resource stores.`);

                const storesToRefresh = [
                    "publisher", "publisherInfo", "adviser", "author",
                    "resourcetype", "availability", "department", "topic"
                ];
                const allCurrentStores = Array.from(db.objectStoreNames);

                // Delete existing stores (except resources) that are managed here
                console.log("Deleting existing managed stores (except resources)...");
                for (const storeName of allCurrentStores) {
                    if (storeName !== "resources" && storesToRefresh.includes(storeName)) {
                         try {
                            console.log(` - Deleting: ${storeName}`);
                            db.deleteObjectStore(storeName);
                         } catch (delError) { console.error(`Error deleting store ${storeName}:`, delError); }
                    }
                }

                console.log("Recreating and populating stores...");

                // --- Recreate and Populate Stores (without redundant checks) ---

                // Publisher
                if (Array.isArray(publisher)) {
                    const pubStore = db.createObjectStore("publisher", { keyPath: "pub_id", autoIncrement: true });
                    pubStore.createIndex("pub_id", "pub_id", { unique: false });
                    publisher.forEach(pub => pubStore.add(pub));
                    console.log(` + Recreated/Populated 'publisher' (${publisher.length} items)`);
                } else { console.warn(" ! Publisher data missing/not array, store not populated."); }

                 // PublisherInfo
                 if (Array.isArray(publisherInfo)) {
                     const pubInfoStore = db.createObjectStore("publisherInfo", { keyPath: "pub_id", autoIncrement: true });
                     pubInfoStore.createIndex("pub_id", "pub_id", { unique: false });
                     publisherInfo.forEach(pub => pubInfoStore.add(pub));
                     console.log(` + Recreated/Populated 'publisherInfo' (${publisherInfo.length} items)`);
                 } else { console.warn(" ! PublisherInfo data missing/not array, store not populated."); }


                // Adviser
                if (Array.isArray(adviser)) {
                    const adviserStore = db.createObjectStore("adviser", { keyPath: "adviser_id", autoIncrement: true });
                    adviserStore.createIndex("adviser_name", ["adviser_fname", "adviser_lname"], { unique: false });
                    adviser.forEach(adv => adviserStore.add(adv));
                     console.log(` + Recreated/Populated 'adviser' (${adviser.length} items)`);
                 } else { console.warn(" ! Adviser data missing/not array, store not populated."); }

                // Author
                 if (Array.isArray(author)) {
                    const authorStore = db.createObjectStore("author", { keyPath: "author_id", autoIncrement: true });
                    authorStore.createIndex("author_name", ["author_fname", "author_lname"], { unique: false });
                    author.forEach(a => authorStore.add(a));
                     console.log(` + Recreated/Populated 'author' (${author.length} items)`);
                 } else { console.warn(" ! Author data missing/not array, store not populated."); }

                // ResourceType
                 if (Array.isArray(type)) {
                    const typeStore = db.createObjectStore("resourcetype", { keyPath: "type_id", autoIncrement: true });
                    type.forEach(t => typeStore.add(t));
                     console.log(` + Recreated/Populated 'resourcetype' (${type.length} items)`);
                 } else { console.warn(" ! Type data missing/not array, store not populated."); }

                // Availability
                 if (Array.isArray(status)) {
                    const availStore = db.createObjectStore("availability", { keyPath: "avail_id", autoIncrement: true });
                    status.forEach(stat => availStore.add(stat));
                     console.log(` + Recreated/Populated 'availability' (${status.length} items)`);
                 } else { console.warn(" ! Status data missing/not array, store not populated."); }

                // Department
                 if (Array.isArray(department)) {
                    const deptStore = db.createObjectStore("department", { keyPath: "dept_id", autoIncrement: true });
                    department.forEach(dept => deptStore.add(dept));
                     console.log(` + Recreated/Populated 'department' (${department.length} items)`);
                 } else { console.warn(" ! Department data missing/not array, store not populated."); }

                // Topic
                 if (Array.isArray(topic)) {
                    const topicStore = db.createObjectStore("topic", { keyPath: "topic_id", autoIncrement: true });
                    topic.forEach(top => topicStore.add(top));
                     console.log(` + Recreated/Populated 'topic' (${topic.length} items)`);
                 } else { console.warn(" ! Topic data missing/not array, store not populated."); }

                // Optional: Double-check 'resources' store exists if needed, though it shouldn't be deleted.
                 if (!db.objectStoreNames.contains("resources")) {
                      console.warn("!! 'resources' store somehow missing, recreating structure.");
                      const resourcesStore = db.createObjectStore("resources", { keyPath: "resource_id", autoIncrement: true });
                      resourcesStore.createIndex("resource_title", "resource_title", { unique: false });
                  }

                console.log("Finished refreshing stores within upgrade transaction.");
            },
            blocked(currentVersion, blockedVersion, event) {
                console.warn(`DB Refresh: Upgrade to version ${blockedVersion} blocked from version ${currentVersion}. Close other tabs/connections accessing ${dbName}.`);
                // Handle blocked state appropriately
            },
            blocking(currentVersion, blockedVersion, event) {
                console.log(`DB Refresh: Upgrade is blocking version ${currentVersion}.`);
                // event.target.close(); // May help unblock other tabs
            }
        });

        // 3. Close the database connection after the operation completes.
        await dbInstance.close();
        dbInstance = null;
        console.log(`Database ${dbName} connection closed after refreshing stores.`);

    } catch (error) {
        console.error(`Error refreshing non-resource stores in database ${dbName}:`, error);
        // Ensure DB is closed even if an error occurred before the final close
        if (dbInstance) {
            try { await dbInstance.close(); } catch (closeError) { console.error("Error closing DB after refresh error:", closeError);}
        }
        throw error; // Rethrow the original error
    }
};