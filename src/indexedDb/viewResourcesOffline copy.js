import { initDB } from "./initializeIndexedDb";
/*----------------------VIEW RESOURCES-----------------*/
//for viewing specific resource in admin side
export const viewResourcesOffline =async(resourceId,setBookData)=>{
    const db = await initDB();

    // get type id of resource
    const txResource = db.transaction('resources','readonly');
    const resourceStore = txResource.objectStore('resources');
    const resource = await resourceStore.get(resourceId)
    const resourceType = resource.type_id;
    await txResource.done

    switch(resourceType){
        case '1':
            await viewBookOffline(resource,setBookData)
            break;
        case '2':
        case '3':
            await viewJournalNewsletterOffline(resource,setBookData);
            break;
        case '4':
            await viewThesisOffline(resource,setBookData);
            break;
        default:
            console.log('Media type not allowed')
    }
}

const viewBookOffline = async (resource,setBookData)=>{
    const db = await initDB();

     //get resourceauthor
    const txResourceAuthor = db.transaction('resourceauthors','readonly');
    const resourceAuthorStore = txResourceAuthor.objectStore('resourceauthors')
    const resourceAuthorsList = await resourceAuthorStore.getAll()
    await txResourceAuthor.done
     
     //get related author
     const txAuthor = db.transaction('author','readonly');
     const authorStore = txAuthor.objectStore('author')
     const authors = await authorStore.getAll()
     await txAuthor.done

     //authors
     //get authors 
     // //filter returns whole objet that matches the condition
     // //map returns the author id, therefore resoureAuthorId is an array that holds the id of authors
    const resourceAuthorId = resourceAuthorsList.filter(ra=>ra.resource_id==resource.resource_id).map(ra => ra.author_id);

    //get resource author
    // filter returns the object of author (yung my lname and fname kapag yung author_id ay nag-eexist sa resourceAuthorId)
    const resourceAuthors = authors
    .filter(author => resourceAuthorId.includes(author.author_id))
    .map(author => `${author.author_fname} ${author.author_lname}`)

     //get related book
     const txBook = db.transaction('book','readonly');
     const bookStore = txBook.objectStore('book')
     const books = await bookStore.getAll()
     await txBook.done

     //get book details of resource
     const bookDetails = books.find(book=>book.resource_id == resource.resource_id);

     //get related publisher
     const txPub = db.transaction('publisher','readonly');
     const pubStore = txPub.objectStore('publisher')
     let publisher;
     if (bookDetails?.pub_id) {
        publisher = await pubStore.get(bookDetails.pub_id);
        if (!publisher) {
            console.warn(`Publisher with ID ${bookDetails.pub_id} not found.`);
            publisher = null; // Handle case where publisher doesn't exist
        }
    } else {
        publisher = null;
    }
    
    console.log(bookDetails.topic_id)
     await txBook.done

     setBookData({
        mediaType: resource.type_id,
        authors: resourceAuthors,
        description: resource.resource_description,
        quantity:resource.resource_quantity,
        title: resource.resource_title,
        isbn: bookDetails.book_isbn,
        status:resource.avail_id,
        publisher_id: bookDetails.pub_id,
        publisher: publisher?publisher.pub_name:'',
        file: bookDetails.file,
        publishedDate: resource.resource_published_date,
        department: resource.dept_id,
        topic: bookDetails.topic_id,
        isCirculation:resource.resource_is_circulation==0?false:true
     })
}

const viewJournalNewsletterOffline = async (resource,setBookData)=>{
    const db = await initDB();

     //get resourceauthor
     const txResourceAuthor = db.transaction('resourceauthors','readonly');
     const resourceAuthorStore = txResourceAuthor.objectStore('resourceauthors')
     const resourceAuthorsList = await resourceAuthorStore.getAll()
     await txResourceAuthor.done
      
      //get related author
      const txAuthor = db.transaction('author','readonly');
      const authorStore = txAuthor.objectStore('author')
      const authors = await authorStore.getAll()
      await txAuthor.done
 
      //authors
      //get authors 
      // //filter returns whole objet that matches the condition
      // //map returns the author id, therefore resoureAuthorId is an array that holds the id of authors
     const resourceAuthorId = resourceAuthorsList.filter(ra=>ra.resource_id==resource.resource_id).map(ra => ra.author_id);
 
     //get resource author
    // filter returns the object of author (yung my lname and fname kapag yung author_id ay nag-eexist sa resourceAuthorId)
    const resourceAuthors = authors
    .filter(author => resourceAuthorId.includes(author.author_id))
    .map(author => `${author.author_fname} ${author.author_lname}`)

    //get related journalnewsletter
    const txJn = db.transaction('journalnewsletter','readonly');
    const jnStore = txJn.objectStore('journalnewsletter')
    const jns = await jnStore.getAll()
    await txJn.done

    //get book details of resource
    const jnDetails = jns.find(jn=>jn.resource_id == resource.resource_id);

    setBookData((prevdata)=>({
        ...prevdata,
        mediaType: resource.type_id,
        authors: resourceAuthors,
        description: resource.resource_description,
        quantity:resource.resource_quantity,
        title: resource.resource_title,
        status:resource.avail_id,
        file: jnDetails.file,
        publishedDate: resource.resource_published_date,
        department: resource.dept_id,
        topic: jnDetails.topic_id,
        volume: jnDetails.jn_volume,
        issue: jnDetails.jn_issue,
        isCirculation:resource.resource_is_circulation==0?false:true
     }))
}

const viewThesisOffline = async (resource,setBookData)=>{
    const db = await initDB();

     //get resourceauthor
     const txResourceAuthor = db.transaction('resourceauthors','readonly');
     const resourceAuthorStore = txResourceAuthor.objectStore('resourceauthors')
     const resourceAuthorsList = await resourceAuthorStore.getAll()
     await txResourceAuthor.done
      
      //get related author
      const txAuthor = db.transaction('author','readonly');
      const authorStore = txAuthor.objectStore('author')
      const authors = await authorStore.getAll()
      await txAuthor.done
 
      //authors
      //get authors 
      // //filter returns whole objet that matches the condition
      // //map returns the author id, therefore resoureAuthorId is an array that holds the id of authors
     const resourceAuthorId = resourceAuthorsList.filter(ra=>ra.resource_id==resource.resource_id).map(ra => ra.author_id);
 
     //get resource author
    // filter returns the object of author (yung my lname and fname kapag yung author_id ay nag-eexist sa resourceAuthorId)
    const resourceAuthors = authors
    .filter(author => resourceAuthorId.includes(author.author_id))
    .map(author => `${author.author_fname} ${author.author_lname}`)

    //get related journalnewsletter
    const txThesis = db.transaction('thesis','readonly');
    const thesisStore = txThesis.objectStore('thesis')
    const theses = await thesisStore.getAll()
    await txThesis.done

    //get book details of resource
    const thesisDetails = theses.find(thesis=>thesis.resource_id == resource.resource_id);

    //get related adviser 
    const txAdviser = db.transaction('adviser','readonly');
    const adviserStore = txAdviser.objectStore('adviser')
    const adviser = await adviserStore.get(thesisDetails.adviser_id)
    await txAdviser.done

    setBookData((prevdata)=>({
        ...prevdata,
        mediaType: resource.type_id,
        authors: resourceAuthors,
        adviser: `${adviser.adviser_fname} ${adviser.adviser_lname}`,
        description: resource.resource_description,
        quantity:resource.resource_quantity,
        title: resource.resource_title,
        status:resource.avail_id,
        publishedDate: resource.resource_published_date,
        department: resource.dept_id,
        topic: resource.topic_id,
        isCirculation:resource.resource_is_circulation==0?false:true
     }))

}
