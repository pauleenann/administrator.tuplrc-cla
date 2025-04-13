import { initDB } from "./initializeIndexedDb";

/*----------------------EDIT RESOURCES-----------------*/
export const editResourceOffline = async (data,resourceId)=>{
    const db = await initDB();
    const tx = db.transaction("resources", "readwrite");
    const store = tx.objectStore("resources");
    console.log(data)

    const updatedResource = {...data,resource_id:resourceId}
    await store.put(updatedResource);
    await tx.done
}
