import { openDB } from "idb"

const dbName = "LRCCLA";
const version = 1;

export const initDB = async (status, type, publisher, publisherInfo, author, adviser, department, topic) => {
    return openDB (dbName, version,{
        upgrade(db){
            // Create "resources" store
        if (!db.objectStoreNames.contains("resources")) {
            const resourcesStore = db.createObjectStore("resources", { keyPath: "resource_id",autoIncrement:true });
            resourcesStore.createIndex("resource_title", "resource_title", { unique: false });
        }

        // Create "publisher" store
        if (!db.objectStoreNames.contains("publisher")&&Array.isArray(publisher)) {
            const pubStore = db.createObjectStore("publisher", { keyPath: "pub_id", autoIncrement: true });
            publisher.map(pub=>{
                pubStore.add(pub)
            })
            // pubStore.createIndex("sync_status", "sync_status", { unique: false });
            // pubStore.add({pub_name: "n/a",pub_address: "n/a",pub_email: "n/a",pub_phone: "n/a",pub_website: "n/a"})
            pubStore.createIndex("pub_id", "pub_id", { unique: false });
          }

        if (!db.objectStoreNames.contains("publisherInfo")&&Array.isArray(publisherInfo)) {
            const pubInfoStore = db.createObjectStore("publisherInfo", { keyPath: "pub_id", autoIncrement: true });
            publisherInfo.map(pub=>{
                pubInfoStore.add(pub)
            })
            // pubStore.createIndex("sync_status", "sync_status", { unique: false });
            // pubStore.add({pub_name: "n/a",pub_address: "n/a",pub_email: "n/a",pub_phone: "n/a",pub_website: "n/a"})
            pubInfoStore.createIndex("pub_id", "pub_id", { unique: false });
        }

        // Create "adviser" store
        if (!db.objectStoreNames.contains("adviser")&&Array.isArray(adviser)) {
            const adviserStore = db.createObjectStore("adviser", { keyPath: "adviser_id",autoIncrement:true });
            adviserStore.createIndex("adviser_name",["adviser_fname","adviser_lname"],{
                unique:false
            })
            adviserStore.createIndex("adviser_id", "adviser_id", { unique: false })
            adviser.map(adv=>{
                adviserStore.add(adv)
            })
            // adviserStore.createIndex("sync_status", "sync_status", { unique: false });
        }

        
        // Create "author" store
        if (!db.objectStoreNames.contains("author")&&Array.isArray(author)) {
            const authorStore = db.createObjectStore("author", { keyPath: "author_id",autoIncrement:true });
            authorStore.createIndex("author_name",["author_fname","author_lname"],{
                unique:false
            })
            authorStore.createIndex("author_id","author_id",{
                unique:false
            })
            author.map(a=>{
                authorStore.add(a)
            })
            // authorStore.createIndex("sync_status", "sync_status", { unique: false });
            // authorStore.add({ author_fname: "n/a",author_lname:"n/a" });
        }

        // Create and populate "type" store
        if (!db.objectStoreNames.contains("resourcetype")&&Array.isArray(type)) {
            const typeStore = db.createObjectStore("resourcetype", { keyPath: "type_id", autoIncrement: true});
            type.map(t=>{
                typeStore.add(t)
            })
        }

        // Create and populate "availability" store
        if (!db.objectStoreNames.contains("availability")&&Array.isArray(status)) {
            const availStore = db.createObjectStore("availability", { keyPath: "avail_id",autoIncrement: true });
            status.map(stat=>{
                availStore.add(stat)
            })
        }

        // create and populate 'department' store
        if (!db.objectStoreNames.contains("department")&&Array.isArray(department)) {
            const deptStore = db.createObjectStore("department", { keyPath: "dept_id", autoIncrement: true });
            department.map(dept=>{
                deptStore.add(dept)
            })
        }

        // create and populate 'topic' store
        if (!db.objectStoreNames.contains("topic")&&Array.isArray(topic)) {
            const topicStore = db.createObjectStore("topic", { keyPath: "topic_id", autoIncrement: true });
            topic.map(top=>{
                topicStore.add(top)
            })
        }  
        }
    })
};

export const resetDBExceptResources = async (status, type, publisher, publisherInfo, author, adviser, department, topic) => {
    const db = await openDB(dbName, version);
    
    const transaction = db.transaction(db.objectStoreNames, "readwrite");

    for (const storeName of db.objectStoreNames) {
        if (storeName !== "resources") {
            const store = transaction.objectStore(storeName);
            await store.clear();
        }
    }

    // Repopulate each store after clearing
    if (Array.isArray(status)) {
        const store = transaction.objectStore("availability");
        status.forEach(stat => store.add(stat));
    }

    if (Array.isArray(type)) {
        const store = transaction.objectStore("resourcetype");
        type.forEach(t => store.add(t));
    }

    if (Array.isArray(publisher)) {
        const store = transaction.objectStore("publisher");
        publisher.forEach(pub => store.add(pub));
    }

    if (Array.isArray(publisherInfo)) {
        const store = transaction.objectStore("publisherInfo");
        publisherInfo.forEach(pub => store.add(pub));
    }

    if (Array.isArray(author)) {
        const store = transaction.objectStore("author");
        author.forEach(a => store.add(a));
    }

    if (Array.isArray(adviser)) {
        const store = transaction.objectStore("adviser");
        adviser.forEach(adv => store.add(adv));
    }

    if (Array.isArray(department)) {
        const store = transaction.objectStore("department");
        department.forEach(dept => store.add(dept));
    }

    if (Array.isArray(topic)) {
        const store = transaction.objectStore("topic");
        topic.forEach(top => store.add(top));
    }

    await transaction.done;
};
