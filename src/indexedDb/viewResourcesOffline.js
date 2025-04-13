import { initDB } from "./initializeIndexedDb";
/*----------------------VIEW RESOURCES-----------------*/
//for viewing specific resource in admin side
export const viewResourcesOffline =async(resourceId,setBookData)=>{
    const db = await initDB();

    // get type id of resource
    const txResource = db.transaction('resources','readonly');
    const resourceStore = txResource.objectStore('resources');
    const resource = await resourceStore.get(resourceId)
    const resourceType = resource.mediaType;
    await txResource.done

    //get related publisher
    const txPub = db.transaction('publisherInfo','readonly');
    const pubStore = txPub.objectStore('publisherInfo')
    let publisher;
    if (resource.publisher_id>0) {
       publisher = await pubStore.get(resource.publisher_id);
       if (!publisher) {
           console.warn(`Publisher with ID ${resource.publisher_id} not found.`);
           publisher = resource.publisher
       }else{
            publisher=publisher.pub_name
       }
   } else {
       publisher = resource.publisher
   }

    switch(resourceType){
        case '1':
            setBookData({
                mediaType: resource.mediaType,
                authors: resource.authors,
                description: resource.description,
                quantity:resource.quantity,
                title: resource.title,
                isbn: resource.isbn,
                status:resource.status,
                publisher_id: resource.publisher_id,
                publisher: publisher,
                file: resource.file,
                publishedDate: resource.publishedDate,
                department: resource.department,
                topic: resource.topic,
                isCirculation:resource.isCirculation
             })
            break;
        case '2':
        case '3':
            setBookData({
                mediaType:resource.mediaType,
                authors: resource.authors,
                description: resource.description,
                quantity:resource.quantity,
                title: resource.title,
                status:resource.status,
                file: resource.file,
                publishedDate: resource.publishedDate,
                department: resource.department,
                topic: resource.topic,
                isCirculation:resource.isCirculation,
                volume: resource.volume,
                issue: resource.issue
            })
            break;
        case '4':
            setBookData({
                mediaType:resource.mediaType,
                authors: resource.authors,
                adviser:resource.adviser,
                description: resource.description,
                quantity:resource.quantity,
                title: resource.title,
                status:resource.status,
                publishedDate: resource.publishedDate,
                department: resource.department,
                isCirculation:resource.isCirculation,
            })
            break;
        default:
            console.log('Media type not allowed')
    }
}
