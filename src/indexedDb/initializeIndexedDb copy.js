import { openDB } from "idb"

const dbName = "LRCCLA";
const version = 1;

export const initDB = async () => {
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
        if (!db.objectStoreNames.contains("resourcetype")) {
            const typeStore = db.createObjectStore("resourcetype", { keyPath: "type_id", autoIncrement: true});
            typeStore.add({ type_name: "book" });
            typeStore.add({ type_name: "journal" });
            typeStore.add({ type_name: "newsletter" });
            typeStore.add({ type_name: "thesis" });
        }

        // Create and populate "availability" store
        if (!db.objectStoreNames.contains("availability")) {
            const availStore = db.createObjectStore("availability", { keyPath: "avail_id",autoIncrement: true });
            availStore.add({ avail_name: "available" });
            availStore.add({ avail_name: "lost" });
            availStore.add({ avail_name: "damaged" });
        }

        // create and populate 'department' store
        if (!db.objectStoreNames.contains("department")) {
            const deptStore = db.createObjectStore("department", { keyPath: "dept_id", autoIncrement: true });
            deptStore.add({dept_name: "social science", dept_shelf_no: '1' });
            deptStore.add({dept_name: "languages", dept_shelf_no: '2' });
            deptStore.add({dept_name: "business management ", dept_shelf_no: '3' });
            deptStore.add({dept_name: "hospitality and restaurant management", dept_shelf_no: '4' });
            deptStore.add({dept_name: "references", dept_shelf_no: '5' });
            deptStore.add({dept_name: "student output", dept_shelf_no: '6' });
            deptStore.add({dept_name: "theses and dissertations", dept_shelf_no: '7' });
        }

        // create and populate 'topic' store
        if (!db.objectStoreNames.contains("topic")) {
            const topicStore = db.createObjectStore("topic", { keyPath: "topic_id", autoIncrement: true });
            topicStore.add({topic_name: "information and organizational management", topic_row_no: '1' });
            topicStore.add({topic_name: "operational management", topic_row_no: '2' });
            topicStore.add({topic_name: "financial management", topic_row_no: '3' });
            topicStore.add({topic_name: "accounting", topic_row_no: '4' });
            topicStore.add({topic_name: "business and human resource", topic_row_no: '5' });
            topicStore.add({topic_name: "marketing", topic_row_no: '6' });
            topicStore.add({topic_name: "philippine history and rizal", topic_row_no: '1' });
            topicStore.add({topic_name: "psychology", topic_row_no: '2' });
            topicStore.add({topic_name: "politics and government", topic_row_no: '3' });
            topicStore.add({topic_name: "sociology and anthropology", topic_row_no: '4' });
            topicStore.add({topic_name: "philosophy and ethics", topic_row_no: '5' });
            topicStore.add({topic_name: "writing", topic_row_no: '1' });
            topicStore.add({topic_name: "communication", topic_row_no: '2' });
            topicStore.add({topic_name: "literature", topic_row_no: '3' });
            topicStore.add({topic_name: "food preparation and service", topic_row_no: '1' });
        }  
        }
    })
};