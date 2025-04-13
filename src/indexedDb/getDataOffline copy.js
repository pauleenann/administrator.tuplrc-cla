import { initDB } from "./initializeIndexedDb";

// Get all data from a store
export const getAllFromStore = async (storeName) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return await store.getAll();
};

//displays resources in catalog page
export const getCatalogDetailsOffline = async ()=>{
    const db = await initDB()
    const catalog = [];

    //get resourceauthor
    const txResourceAuthor = db.transaction('resourceauthors','readonly');
    const resourceAuthorStore = txResourceAuthor.objectStore('resourceauthors')
    const resourceAuthorsList = await resourceAuthorStore.getAll()
    await txResourceAuthor.done

    //get all resources
    const txResource = db.transaction('resources','readonly')
    const resourceStore = txResource.objectStore('resources')
    const resources = await resourceStore.getAll()
    await txResource.done

    //get related type
    const txType = db.transaction('resourcetype','readonly');
    const typeStore = txType.objectStore('resourcetype');
    const types = await typeStore.getAll()
    await txType.done
    
    //get related author
    const txAuthor = db.transaction('author','readonly');
    const authorStore = txAuthor.objectStore('author')
    const authors = await authorStore.getAll()
    await txAuthor.done

    //get department
    const txDept = db.transaction('department','readonly');
    const deptStore = txDept.objectStore('department')
    const department = await deptStore.getAll()
    await txDept.done
    
    // get topic
    const txTopic = db.transaction('topic','readonly');
    const topicStore = txTopic.objectStore('topic')
    const topic = await topicStore.getAll()
    await txTopic.done

    // get book
    const txBook = db.transaction('book','readonly');
    const bookStore = txBook.objectStore('book')
    const book = await bookStore.getAll()
    await txBook.done

    // get journalnewsletter
    const txJn = db.transaction('journalnewsletter','readonly');
    const jnStore = txJn.objectStore('journalnewsletter')
    const jn = await jnStore.getAll()
    await txJn.done

    for(const resource of resources){
        //.find() returns the entire object if it finds a match.
        //resource type
        const resourceType = types.find(type => type.type_id == resource.type_id)?.type_name || '';

        // console.log(resourceType)
        let topicName;
        let topicId = null;
        if(resourceType=='book'){
            topicId = book.find(b=>b.resource_id == resource.resource_id)?.topic_id||'';
        }else if(resourceType=='journal'){
            topicId = jn.find(j=>j.resource_id == resource.resource_id)?.topic_id||'';
        }else if(resourceType=='newsletter'){
            topicId = jn.find(j=>j.resource_id == resource.resource_id)?.topic_id||'';
        }

        topicName = topicId?topic.find(t=>t.topic_id == topicId)?.topic_name||'':'n/a';

        
        //resource shelf no
        // const shelfNo = department.find(dept=>dept.dept_id == resource.dept_id)?.dept_shelf_no||'';

        //resource dept name
        const deptName = department.find(dept=>dept.dept_id == resource.dept_id)?.dept_name||'';

        //get authors 
        //filter returns whole objet that matches the condition
        //map returns the author id, therefore resoureAuthorId is an array that holds the id of authors
        const resourceAuthorId = resourceAuthorsList.filter(ra=>ra.resource_id==resource.resource_id).map(ra => ra.author_id);

        //get resource author
        // filter returns the object of author (yung my lname and fname kapag yung author_id ay nag-eexist sa resourceAuthorId)
        const resourceAuthors = authors
            .filter(author => resourceAuthorId.includes(author.author_id))
            .map(author => `${author.author_fname} ${author.author_lname}`)


        catalog.push({
            resource_id: resource.resource_id,
            type_id: resource.type_id,
            dept_id: resource.dept_id,
            topic_id: topicId,
            resource_title: resource.resource_title,
            type_name: resourceType,
            author_names: resourceAuthors.length>1?resourceAuthors.join(', '):resourceAuthors,
            // dept_shelf_no: shelfNo,
            dept_name: deptName,
            topic_name:topicName,
            resource_quantity: resource.resource_quantity
        })
    }
    return catalog
}

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
