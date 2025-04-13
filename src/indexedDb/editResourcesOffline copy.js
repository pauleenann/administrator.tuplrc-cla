import { initDB } from "./initializeIndexedDb";

/*----------------------EDIT RESOURCES-----------------*/
export const editResourceOffline = async (data,resourceId)=>{
    const mediaType = data.mediaType;
    let existingPublisher;
    let pub_name;
    let pub_add;
    let pub_email;
    let pub_phone;
    let pub_website;

    let adviserFname;
    let adviserLname;

    //set variables depending on type
    if(mediaType==='1'){
        existingPublisher = data.publisher_id; //this is not 0 if pinili niya ay existing na publisher
        pub_name = data.publisher;
        pub_add = data.publisher_address;
        pub_email = data.publisher_email;
        pub_phone = data.publisher_number;
        pub_website = data.publisher_website;
    }else if(mediaType==='4'){
        // split string
        //if req.body.adviser is 'name lastname'. pag ginamitan ng split(' ') it will be ['name','lastname']
        const adviser = data.adviser.split(' ')
        adviserFname = adviser.slice(0, -1).join(" ");
        adviserLname = adviser.length > 1 ? adviser[adviser.length - 1] : '';
    }

    const db = await initDB();
    const tx = db.transaction("resources", "readwrite");
    const store = tx.objectStore("resources");

    const updatedResource = {
        resource_id: resourceId,
        resource_title: data.title,
        resource_description: data.description,
        resource_published_date: data.publishedDate,
        resource_quantity: data.quantity,
        resource_is_circulation: data.isCirculation?1:0,
        dept_id: data.department,
        type_id: data.mediaType,
        avail_id: data.status,
    }
    
    await store.put(updatedResource);
    await tx.done

    const authors = data.authors;

    console.log(existingPublisher==0&&!pub_name&&!pub_add&&!pub_email&&!pub_phone&&!pub_website)

    await editAuthorsOffline(resourceId, authors).then(async ()=>{
        //insert data based on their type
        if(mediaType==='1'){
            //check publisher
            if(existingPublisher==0&&!pub_name&&!pub_add&&!pub_email&&!pub_phone&&!pub_website){
                // if publisherid is 0 and walang nakaset sa pub details, insert to book then sed pub_id to nulll
                await editBookOffline(data.file, data.isbn, resourceId,null,data.topic)
            }else{
                //if hindi 0 ung publisherID, check sa publisher id nageexist un
                try {
                    await checkPublisherIfExist(existingPublisher);
                    await editBookOffline(data.file, data.isbn, resourceId, existingPublisher,data.topic);
                } catch {
                    const pubId = await savePublisherOffline(pub_name, pub_add, pub_email, pub_phone, pub_website);
                    await editBookOffline(data.file, data.isbn, resourceId, pubId, data.topic);
                }
            }
        }else if(mediaType==='2'||mediaType==='3'){
            await editJournalNewsletterOffline(data.volume,data.issue,data.file,resourceId, data.topic)
        }else{
            await editCheckAdviserIfExist(adviserFname,adviserLname,resourceId)
        }
    })
}

const editAuthorsOffline = async (resourceId, authors) => {
    const db = await initDB();

    //delete first all records with value=resourceId
    const txRa = db.transaction('resourceauthors', 'readwrite');
    const storeRa = txRa.objectStore('resourceauthors');
    const indexRa = storeRa.index('resource_id');

    // Retrieve all records that match the specific resource_id
    const ras = await indexRa.getAll(resourceId);

    // Loop through the records and delete each one
    for (let ra of ras) {
        // Delete each record by its primary key (ra_id)
        console.log(ra)
        await storeRa.delete(ra.ra_id);
    }
    await txRa.done;


    
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
                author_lname: lname, 
                });

            //after inserting, pass the resourceId and authorId to saveResourceAuthorOffline()
            await editResourceAuthorOffline(resourceId,authorId)
        }else{
            //if may nahanap, get the authorId and pass to saveResourceAuthorOffline(resourceId,authorId) together with the resourceId
            //result: {author_fname: 'sample', author_lname: 'sample', author_id: 1}
            const authorId = result.author_id
            await editResourceAuthorOffline(resourceId,authorId)
        }
        await tx.done;  // Ensure the transaction completes
    }
    console.log("inserted to author and resourceauthor object store.");
};

const editResourceAuthorOffline = async (resourceId,authorId)=>{
    const db = await initDB()
    const tx = db.transaction("resourceauthors", "readwrite");
    const store = tx.objectStore("resourceauthors");

    await store.add({resource_id: resourceId, author_id: authorId})
    await tx.done;
}

const editBookOffline = async (file,isbn,resourceId,pubId,topic)=>{
    const db = await initDB()
    const tx = db.transaction('book','readwrite');
    const store = tx.objectStore('book')
    const index = store.index('resource_id')

    const book = await index.get(resourceId)
    //get book that matches resourceId and delete

    await store.put({
        book_id: book.book_id,
        file:file,
        book_isbn:isbn,
        resource_id:resourceId, 
        pub_id:pubId,
        topic_id: topic
    })
    await tx.done
}

const editJournalNewsletterOffline = async(jnVol, jnIssue, jnCover, resourceId, topic)=>{
    const db = await initDB()
    const tx = db.transaction('journalnewsletter','readwrite');
    const store = tx.objectStore('journalnewsletter');
    const index = store.index('resource_id');

    //retrieve jn that matches the resourceID
    const jn = await index.get(resourceId)

    await store.put({
        jn_id: jn.jn_id,
        jn_volume:jnVol||'',
        jn_issue:jnIssue||'',
        file: jnCover,
        resource_id:resourceId,
        topic_id: topic
    })
    await tx.done
}

const editCheckAdviserIfExist = async(adviserFname, adviserLname,resourceId)=>{
    const db = await initDB();
    const tx = db.transaction('adviser','readwrite');
    const store = tx.objectStore('adviser');
    const index = store.index('adviser_name')

    const result = await index.get([adviserFname,adviserLname]);

    if(!result){
        //if adviser does nt exist, insert to adviser object store
        const adviserId =  await store.put({adviser_fname: adviserFname, adviser_lname: adviserLname});

        //after inserting, pass to saveThesisOffline()
        await editThesisOffline(adviserId,resourceId)
    }else{
        //if nahanap
        const adviserId = result.adviser_id;
        await editThesisOffline(adviserId,resourceId)
    }
}

const editThesisOffline = async (adId,resId)=>{
    const db = await initDB()
    const tx = db.transaction('thesis','readwrite')
    const store = tx.objectStore('thesis')
    const index = store.index('resource_id')

    // retrive thesis that matches the resource_id
    const thesis = await index.get(resId);
    
    await store.put({
        thesis_id: thesis.thesis_id,
        resource_id:resId,
        adviser_id:adId,
    })
    await tx.done
}

const checkPublisherIfExist = async (pubId)=>{
    const db = await initDB();
    const tx = db.transaction('publisher', 'readonly');
    const store = tx.objectStore('publisher');
    const result = await store.get(pubId);

    if (!result) {
        throw new Error('Publisher not found');
    }
    return result;
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
       pub_website: pubWeb
   });
   await tx.done;
   return pubId;
}