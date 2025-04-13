import { openDB } from "idb"

const dbName = "LRCCLA";
const version = 1;

export const initDB = async (department, topic, type) => {
    console.log(department)
    console.log(topic)
    return openDB (dbName, version,{
        upgrade(db){
            // Create "resources" store
        if (!db.objectStoreNames.contains("resources")) {
            const resourcesStore = db.createObjectStore("resources", { keyPath: "resource_id",autoIncrement:true });
            resourcesStore.createIndex("resource_title", "resource_title", { unique: false });
        }

        // Create "journalnewsletter" store
        if (!db.objectStoreNames.contains("journalnewsletter")) {
            const jnStore = db.createObjectStore("journalnewsletter", { keyPath: "jn_id",autoIncrement:true });
            // jnStore.createIndex("sync_status", "sync_status", { unique: false });
            jnStore.createIndex("resource_id", "resource_id", { unique: false });
        }

        // Create "publisher" store
        if (!db.objectStoreNames.contains("publisher")) {
            const pubStore = db.createObjectStore("publisher", { keyPath: "pub_id", autoIncrement: true });
            // publishers.map(pub=>{
                
            // })
            // pubStore.createIndex("sync_status", "sync_status", { unique: false });
            // pubStore.add({pub_name: "n/a",pub_address: "n/a",pub_email: "n/a",pub_phone: "n/a",pub_website: "n/a"})
            pubStore.createIndex("pub_id", "pub_id", { unique: false });
          }

        // Create "book" store
        if (!db.objectStoreNames.contains("book")) {
            const bookStore = db.createObjectStore("book", { keyPath: "book_id",autoIncrement:true });
            // bookStore.createIndex("sync_status", "sync_status", { unique: false });
            bookStore.createIndex("resource_id", "resource_id", { unique: false });
        }

        // Create "thesis" store
        if (!db.objectStoreNames.contains("thesis")) {
            const thesisStore = db.createObjectStore("thesis", { keyPath: "thesis_id",autoIncrement:true });
            // thesisStore.createIndex("sync_status", "sync_status", { unique: false });
            thesisStore.createIndex("resource_id", "resource_id", { unique: false });
        }

        // Create "adviser" store
        if (!db.objectStoreNames.contains("adviser")) {
            const adviserStore = db.createObjectStore("adviser", { keyPath: "adviser_id",autoIncrement:true });
            adviserStore.createIndex("adviser_name",["adviser_fname","adviser_lname"],{
                unique:false
            })
            adviserStore.createIndex("adviser_id", "adviser_id", { unique: false })
            // adviserStore.createIndex("sync_status", "sync_status", { unique: false });
        }

        // Create "resourceAuthors" store
        if (!db.objectStoreNames.contains("resourceauthors")) {
            const resourceAuthorsStore = db.createObjectStore("resourceauthors",{keyPath: "ra_id",autoIncrement:true});
            // resourceAuthorsStore.createIndex("sync_status", "sync_status", { unique: false });
            resourceAuthorsStore.createIndex("resource_id", "resource_id", { unique: false });
            resourceAuthorsStore.createIndex("author_id", "author_id", { unique: false });
        }

        // Create "author" store
        if (!db.objectStoreNames.contains("author")) {
            const authorStore = db.createObjectStore("author", { keyPath: "author_id",autoIncrement:true });
            authorStore.createIndex("author_name",["author_fname","author_lname"],{
                unique:false
            })
            authorStore.createIndex("author_id","author_id",{
                unique:false
            })
            // authorStore.createIndex("sync_status", "sync_status", { unique: false });
            // authorStore.add({ author_fname: "n/a",author_lname:"n/a" });
        }

        // Create and populate "type" store
        if (!db.objectStoreNames.contains("resourcetype")&& Array.isArray(department)) {
            const typeStore = db.createObjectStore("resourcetype", { keyPath: "type_id", autoIncrement: true});
            type.map(ty=>{
                typeStore.add({ type_name: ty.type_name });
            })
        }

        // Create and populate "availability" store
        if (!db.objectStoreNames.contains("availability")) {
            const availStore = db.createObjectStore("availability", { keyPath: "avail_id",autoIncrement: true });
            availStore.add({ avail_name: "available" });
            availStore.add({ avail_name: "lost" });
            availStore.add({ avail_name: "damaged" });
        }

        // create and populate 'department' store
        if (!db.objectStoreNames.contains("department") && Array.isArray(department)) {
            const deptStore = db.createObjectStore("department", { keyPath: "dept_id", autoIncrement: true });
            department.forEach(dept => {
                const obj = {
                    dept_name: dept.dept_name || "Unknown",
                    dept_shelf_no: dept.dept_shelf_no || "N/A"
                };
                deptStore.add(obj);
            });
        }

        // create and populate 'topic' store
        if (!db.objectStoreNames.contains("topic") && Array.isArray(topic)) {
            const topicStore = db.createObjectStore("topic", { keyPath: "topic_id", autoIncrement: true });
            topic.forEach(tp => {
                const obj = {
                    topic_name: tp.topic_name || "Unknown",
                    topic_row_no: tp.topic_row_no || "N/A",
                    dept_id: tp.dept_id || null
                };
                topicStore.add(obj);
            });
        }        
        }
    })
};