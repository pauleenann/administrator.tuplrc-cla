import { initDB } from "./initializeIndexedDb";

export const saveResourceOffline = async(data) => {
    const mediaType = data.mediaType;
    let existingPublisher;
    let pub_name;
    let pub_add;
    let pub_email;
    let pub_phone;
    let pub_website;

    let adviserFname;
    let adviserLname;

    // set variables depending on type
    if (mediaType === '1') {
        existingPublisher = data.publisher_id; // this is not 0 if pinili niya ay existing na publisher
        pub_name = data.publisher;
        pub_add = data.publisher_address;
        pub_email = data.publisher_email;
        pub_phone = data.publisher_number;
        pub_website = data.publisher_website;
    } else if (mediaType === '4') {
        // split string
        const adviser = data.adviser.split(' ');
        adviserFname = adviser.slice(0, -1).join(" ");
        adviserLname = adviser.length > 1 ? adviser[adviser.length - 1] : '';
    }

    // Check if the resource already exists
    const existingResource = await checkResourceIfExist(data.title);
    if (existingResource) {
        console.log(`Resource with title "${data.title}" already exists. Skipping...`);
        return {status: 'duplicated', message:`Resource with title "${data.title}" already exists.`}; // Skip if resource exists
    }

    try {
        const db = await initDB();
        const tx = db.transaction("resources", "readwrite"); // open transaction
        const store = tx.objectStore("resources");
        // Create resource object
        const resource = {
            resource_title: data.title,
            resource_description: data.description,
            resource_published_date: data.publishedDate,
            resource_quantity: data.quantity,
            resource_is_circulation: data.isCirculation ? 1 : 0,
            dept_id: data.department,
            type_id: data.mediaType,
            avail_id: data.status,
        };

        // Save the resource and get the inserted ID
        const resourceId = await store.put(resource);
        await tx.done;
        console.log("Data saved in resources object store");

        const authors = data.authors;
        await saveAuthorsOffline(resourceId, authors); // Save authors offline
        
        // Continue with media-specific handling
        if (mediaType === '1') {
            // Handle publisher and book details
            if (existingPublisher === 0 && !pub_name && !pub_add && !pub_email && !pub_phone && !pub_website) {
                await saveBookOffline(data.file, data.isbn, resourceId, '', data.topic);
            } else {
                // Publisher handling
                try {
                    const pub = await checkPublisherIfExist(pub_name, pub_add, pub_email, pub_phone, pub_website);
                    await saveBookOffline(data.file, data.isbn, resourceId, pub.pub_id, data.topic);
                } catch {
                    const pubId = await savePublisherOffline(pub_name, pub_add, pub_email, pub_phone, pub_website);
                    await saveBookOffline(data.file, data.isbn, resourceId, pubId, data.topic);
                }
            }
        } else if (mediaType === '2' || mediaType === '3') {
            await saveJournalNewsletterOffline(data.volume, data.issue, data.file, resourceId, data.topic);
        } else {
            await checkAdviserIfExist(adviserFname, adviserLname, resourceId);
        }
        
        console.log("Transaction committed successfully");
        return {status: 'success', message: "Resource saved offline successfully"};
    } catch (error) {
        console.error("Failed to save resource offline:", error);
        throw error;
    }
};

// Check if resource exists in IndexedDB
const checkResourceIfExist = async (title) => {
    const db = await initDB();
    const tx = db.transaction("resources", "readonly");
    const store = tx.objectStore("resources");
    const index = store.index("resource_title");
    const resources = await index.getAll();
    const resource = resources.find(resource=>resource.resource_title==title)
    await tx.done;
    console.log('resource if exist: ', resource)
    return resource!==undefined
    
};


const checkAdviserIfExist = async(adviserFname, adviserLname,resourceId)=>{
    const db = await initDB();
    const tx = db.transaction('adviser','readwrite');
    const store = tx.objectStore('adviser');
    const index = store.index('adviser_name')

    const result = await index.get([adviserFname,adviserLname]);

    if(!result){
        //if adviser does nt exist, insert to adviser object store
        const adviserId =  await store.put({adviser_fname: adviserFname, adviser_lname: adviserLname});

        //after inserting, pass to saveThesisOffline()
        await saveThesisOffline(adviserId,resourceId)
    }else{
        //if nahanap
        const adviserId = result.adviser_id;
        await saveThesisOffline(adviserId,resourceId)
    }

}

const saveThesisOffline = async (adId,resId)=>{
    const db = await initDB()
    const tx = db.transaction('thesis','readwrite')
    const store = tx.objectStore('thesis')
    await store.put({
        resource_id:resId,
        adviser_id:adId,
    })
    await tx.done
}

const saveJournalNewsletterOffline = async(jnVol, jnIssue, jnCover, resourceId, topic)=>{
    const db = await initDB()
    const tx = db.transaction('journalnewsletter','readwrite');
    const store = tx.objectStore('journalnewsletter')
    await store.put({
        jn_volume:jnVol||'',
        jn_issue:jnIssue||'',
        file: jnCover,
        resource_id:resourceId,
        topic_id: topic
    })
    await tx.done
}

const savePublisherOffline = async(pubName, pubAdd, pubEmail, pubPhone, pubWeb) =>{
     const db = await initDB();
    const tx = db.transaction('publisher', 'readwrite');
    const store = tx.objectStore('publisher');
    const pubId = await store.put({
        pub_name: pubName,
        pub_add: pubAdd,
        pub_email: pubEmail,
        pub_phone: pubPhone,
        pub_website: pubWeb,
    });
    await tx.done;
    return pubId;
}

const checkPublisherIfExist = async (pub_name, pub_add, pub_email, pub_phone, pub_website) => {
    const db = await initDB();
    const tx = db.transaction('publisher', 'readonly');
    const store = tx.objectStore('publisher');

    // Fetch all records from the publisher store
    const result = await store.getAll();

    if (!result || result.length === 0) {
        throw new Error('No publishers found in the database');
    }

    // Find a publisher that matches all the given criteria
    const publisher = result.find(pub =>
        pub.pub_name === pub_name &&
        pub.pub_add === pub_add &&
        pub.pub_email === pub_email &&
        pub.pub_phone === pub_phone &&
        pub.pub_website === pub_website
    );

    if (!publisher) {
        throw new Error('Publisher not found');
    }

    return publisher;
};


const saveBookOffline = async (file,isbn,resourceId,pubId,topic)=>{
    const db = await initDB()
    const tx = db.transaction('book','readwrite');
    const store = tx.objectStore('book')
    await store.put({
        file:file,
        book_isbn:!isbn?'':isbn,
        resource_id:resourceId, 
        pub_id:pubId,
        topic_id: topic
    })
    await tx.done
}

const saveAuthorsOffline = async (resourceId, authors) => {
    const db = await initDB();
    if(authors.length!=0){
        // Loop through authors to check if they exist and add them if not
        for (let element of authors) {
            // Use 'readwrite' since you're potentially adding or modifying records
            const tx = db.transaction("author", "readwrite");
            const store = tx.objectStore("author");
            const index = store.index("author_name");

            const nameParts = element.split(' ');
            const fname = nameParts.slice(0, -1).join(" ");  // "John Michael"
            const lname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''; // "Doe"

            const authorValue = [fname, lname];  // Create the key to search in the index
            console.log(authorValue)

            // Check if the author exists in the index
            const result = await index.get(authorValue);
            console.log(result)
            //if walang nakitang author, insert author
            if(!result){
                //Save the author and get the inserted ID
                const authorId =  await store.put({
                    author_fname: fname, 
                    author_lname: lname});

                //after inserting, pass the resourceId and authorId to saveResourceAuthorOffline()
                await saveResourceAuthorOffline(resourceId,authorId)
            }else{
                //if may nahanap, get the authorId and pass to saveResourceAuthorOffline(resourceId,authorId) together with the resourceId
                //result: {author_fname: 'sample', author_lname: 'sample', author_id: 1}
                const authorId = result.author_id
                console.log(resourceId,authorId)
                await saveResourceAuthorOffline(resourceId,authorId)
            }
            await tx.done;  // Ensure the transaction completes
        }
        console.log("inserted to author and resourceauthor object store.");
    }
    
};

const saveResourceAuthorOffline = async (resourceId,authorId)=>{
    const db = await initDB()
    const tx = db.transaction("resourceauthors", "readwrite");
    const store = tx.objectStore("resourceauthors");

    await store.add({resource_id: resourceId, author_id: authorId})
    await tx.done;
}

