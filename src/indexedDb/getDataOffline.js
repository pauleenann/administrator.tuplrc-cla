import { initDB } from "./initializeIndexedDb";

// Get all data from a store
export const getAllFromStore = async (storeName) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return await store.getAll();
};

export const getAllResources = async (username) => {
    const db = await initDB();
    const txResource = db.transaction('resources', 'readonly');
    const resourceStore = txResource.objectStore('resources');
    const resources = await resourceStore.getAll(); // Ensure this is awaited
    await txResource.done;

    // Filter resources by username
    const filteredResources = resources.filter(resource => resource.username === username);
    return filteredResources
};



//displays resources in catalog page
export const getCatalogDetailsOffline = async (username) => {
    const db = await initDB();
    const catalog = [];

    try {
        // Get all resources
        const txResource = db.transaction('resources', 'readonly');
        const resourceStore = txResource.objectStore('resources');
        const resources = await resourceStore.getAll(); // Ensure this is awaited
        await txResource.done;

        // Filter resources by username
        const filteredResources = resources.filter(resource => resource.username === username);

        // Get department
        const txDept = db.transaction('department','readonly');
        const deptStore = txDept.objectStore('department')
        const department = await deptStore.getAll();
        await txDept.done;
        
        // Get topic
        const txTopic = db.transaction('topic','readonly');
        const topicStore = txTopic.objectStore('topic');
        const topic = await topicStore.getAll();
        await txTopic.done;

        // Get related type
        const txType = db.transaction('resourcetype','readonly');
        const typeStore = txType.objectStore('resourcetype');
        const types = await typeStore.getAll();
        await txType.done;

        // Process and store data
        for (const resource of filteredResources) {
            console.log(resource);
            const resourceType = types.find(type => type.type_id == resource.mediaType)?.type_name || '';

            const deptName = department.find(dept => dept.dept_id == resource.department)?.dept_name || '';

            const topicName = topic.find(t => t.topic_id == resource.topic)?.topic_name || '';

            catalog.push({
                resource_id: resource.resource_id,
                type_id: resource.mediaType,
                dept_id: resource.department,
                topic_id: resource.topic,
                resource_title: resource.title,
                type_name: resourceType,
                author_names: resource.authors.length > 1 ? resource.authors.join(', ') : resource.authors,
                dept_name: deptName,
                topic_name: topicName,
                resource_quantity: resource.quantity,
                original_resource_quantity: resource.quantity
            });
        }

    } catch (error) {
        console.error("Error fetching catalog details:", error);
    }

    return catalog;
};



//get all unsynced data
// Get all unsynced data from a store
export const getAllUnsyncedFromStore = async (storeName) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const index = store.index('sync_status')

    // Get all records where `sync_status` is `false`
    return await index.getAll(0);
};


export const getResourceAuthors = async (resourceId) => {
    const db = await initDB();

    // Get resourceauthors
    const raTx = db.transaction('resourceauthors', 'readonly');
    const raStore = raTx.objectStore('resourceauthors');
    const raIndex = raStore.index('resource_id');
    const resourceAuthors = await raIndex.getAll(resourceId);
    const authorIds = resourceAuthors.map((ra) => ra.author_id);

    // Get all authors
    const authorTx = db.transaction('author', 'readonly');
    const authorStore = authorTx.objectStore('author');
    let authors = [];

    for (const id of authorIds) {
        const author = await authorStore.get(id); // Fetch individual author
        if (author) {
            authors.push(author);
        }
    }

    await raTx.done; // Ensure resourceauthors transaction is complete
    await authorTx.done; // Ensure authors transaction is complete

    console.log("Author IDs:", authorIds);
    console.log("Authors:", authors);

    return authors;
};

export const getPub = async (resourceId) => {
    const db = await initDB();

    try {
        // Get book that matches resourceId
        const bookTx = db.transaction('book', 'readonly');
        const bookStore = bookTx.objectStore('book');
        const indexBook = bookStore.index('resource_id');
        const book = await indexBook.get(resourceId);
        const pubId = book ? book.pub_id : null; // Handle case where book might not exist
        await bookTx.done;

        if (!pubId) {
            console.error("Publisher ID not found for the given resource.");
            return null; // Handle error or return null
        }

        // Get publishers
        const pubTx = db.transaction('publisher', 'readonly');
        const pubStore = pubTx.objectStore('publisher');
        const indexPub = pubStore.index('pub_id');
        const publisher = await indexPub.get(pubId);
        await pubTx.done;

        console.log(publisher)

        return publisher;
    } catch (error) {
        console.error("Error fetching publisher or book:", error.message);
        return null;
    }
};

// export const getBook = async (resourceId) => {
//     const db = await initDB();

//     try {
//         // Get book that matches resourceId
//         const bookTx = db.transaction('book', 'readonly');
//         const bookStore = bookTx.objectStore('book');
//         const indexBook = bookStore.index('resource_id');
//         const book = await indexBook.get(resourceId);
//         await bookTx.done;

//         return book; // Return book if found
//     } catch (error) {
//         console.error("Error fetching book:", error.message);
//         return null;
//     }
// };

export const getResource = async (storename,resourceId) => {
    const db = await initDB();

    try {
        // Get book that matches resourceId
        const tx = db.transaction(storename, 'readonly');
        const store = tx.objectStore(storename);
        const index = store.index('resource_id');
        const resource = await index.get(resourceId);
        await tx.done;

        return resource; // Return book if found
    } catch (error) {
        console.error("Error fetching resource:", error.message);
        return null;
    }
};

export const getResourceAdviser = async (resourceId) => {
    const db = await initDB();
    
    try {
        // Get thesis by resourceId
        const txThesis = db.transaction('thesis', 'readonly');
        const storeThesis = txThesis.objectStore('thesis');
        const indexThesis = storeThesis.index('resource_id');
        const thesis = await indexThesis.get(resourceId);

        // Check if thesis record exists
        if (!thesis) {
            console.error("Thesis not found for resourceId:", resourceId);
            return null; // or throw an error depending on your preference
        }

        const adviserId = thesis.adviser_id;
        await txThesis.done;

        console.log('thesis: ',thesis)

        // Get adviser details by adviserId
        const txAdviser = db.transaction('adviser', 'readonly');
        const storeAdviser = txAdviser.objectStore('adviser');
        const indexAdviser = storeAdviser.index('adviser_id');
        const adviser = await indexAdviser.get(adviserId);

        // Check if adviser record exists
        if (!adviser) {
            console.error("Adviser not found for adviserId:", adviserId);
            return null; // or throw an error depending on your preference
        }

        await txAdviser.done;

        console.log('adviser: ',adviser)
        return adviser; // Return adviser details

    } catch (error) {
        console.error("Error getting resource adviser:", error);
        throw new Error("Error fetching adviser data.");
    }
};
