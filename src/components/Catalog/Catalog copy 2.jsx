import React, { useEffect, useState } from 'react'
import './Catalog.css'
import axios from 'axios'
import { getAllFromStore, getAllUnsyncedFromStore, getBook, getBookPub, getCatalogDetailsOffline, getPub, getResource, getResourceAdviser, getResourceAuthors } from '../../indexedDb/getDataOffline'
import { clearObjectStore, deleteResourceFromIndexedDB, markAsSynced } from '../../indexedDb/syncData'
import ResourceStatusModal from '../ResourceStatusModal/ResourceStatusModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faSearch, faPlus, faBarcode, faArrowsRotate, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'


const Catalog = () => {
  const [catalog, setCatalog] = useState([])
  // Pagination state
  const [pagination, setPagination] = useState(5); // Items per page
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [loading,setLoading] = useState(false)
  const [keyword, setKeyword] = useState('%%')
  const [statusModal, setStatusModal] = useState(false)
  const [statusModalContent, setStatusModalContent] =useState({
    status:'',
    message:''
  })
  const isOnline = useSelector(state=>state.isOnline.isOnline)
  const [openFilter, setOpenFilter] = useState(false)
  const [type, setType] = useState('');
  const [department, setDepartment] = useState([])
  const [topic,setTopic] = useState([])
  const [selectedFilters, setSelectedFilters] = useState({ title:0, author:0, type: 0, department: 0, topic: 0 });
  const navigate = useNavigate()

  useEffect(() => {
    if(isOnline == null){
      return 
    }
    const fetchData = async () => {
      if (isOnline) {
        getType();
        getDept()
        getTopics()
        await getCatalogOnline();
      } else {
        //get offline type 
        const types = await getAllFromStore('resourcetype');
        setType(types);
        //get offline department
        const depts = await getAllFromStore('department')
        setDepartment(depts)
        //get offline topics
        const tps = await getAllFromStore('topic');
        setTopic(tps)

        await getCatalogOffline();
      }
    };

    fetchData();
  }, [currentPage, selectedFilters,isOnline]);

  useEffect(()=>{
      if(keyword==''){
        getCatalogOnline(true)
      }
    },[keyword])

/*-------------------DISPLAY RESOURCES IN CATALOG PAGE------------------- */
const getCatalogOnline = async (resetPage = false) => {
  try {
      if (resetPage) {
          setCurrentPage(1);
          setSelectedFilters({ title:0, author:0, type: 0, department: 0, topic: 0 })
      }
      setLoading(true); // Show loading spinner
      
      const offset = (currentPage - 1) * pagination;
      console.log(offset);
      const response = await axios.get(`http://localhost:3001/api/catalog`, {
          params: { 
            limit: pagination, 
            offset, 
            keyword,
            title:selectedFilters.title,
            type: selectedFilters.type,
            department: selectedFilters.department,
            topic: selectedFilters.topic,
            author: selectedFilters.author}
      });
      console.log(response);
   
      if (response.data) {
          setCatalog(response.data.validResources);
          setTotalPages(Math.ceil(response.data.totalResource / pagination)); // Calculate total pages
      } else {
          setCatalog([]);
          setTotalPages(0);
      }
  } catch (err) {
      console.error('Error fetching catalog data:', err.message);
  } finally {
      setLoading(false); // Hide loading spinner
  }
};


const getCatalogOffline = async (resetPage = false) => {
  const data = await getCatalogDetailsOffline();
  if (resetPage) {
    setCurrentPage(1);
    setSelectedFilters({ title:0, author:0, type: 0, department: 0, topic: 0 })
  }
  console.log(data)
  // Check if the keyword is empty, if so display all data
  if (keyword == '' || keyword == '%%') {
    setCatalog(data);
  } else {
    // Filter the data based on the keyword
    const filteredData = data.filter(item => {
      // Check if the title includes the keyword (case-insensitive)
      const titleMatch = item.resource_title.toLowerCase().includes(keyword.toLowerCase());

      // Check if any author name in the array matches the keyword (case-insensitive)
      const authorMatch = item.author_names.some(author =>
        author.toLowerCase().includes(keyword.toLowerCase())
      );

      // Return true if either the title or any author name matches the keyword
      return titleMatch || authorMatch;
    });

    setCatalog(filteredData);
  }

  // Update the total pages based on the filtered data
  setTotalPages(Math.ceil(data.length / pagination));
};



// fetch resourceType ( book, journal, newsletter, thesis)
const getType = async()=>{
  try {
      const response = await axios.get('http://localhost:3001/api/data/type').then(res=>res.data);
      //console.log(response)
      setType(response)
  } catch (err) {
      console.log(err.message);
  }
};

//get existing department online
const getDept = async()=>{
  try{
      const response = await axios.get('http://localhost:3001/api/data/departments').then(res=>res.data)
      setDepartment(response)
  }catch(err){
      console.log("Couldn't retrieve department online. An error occurred: ", err.message)
  }
}

//get existing topics online
const getTopics =async ()=>{
  try{
      const response = await axios.get('http://localhost:3001/api/data/topic').then(res=>res.data)
      setTopic(response)
  }catch(err){
      console.log("Couldn't retrieve topics online. An error occurred: ", err.message)
  }
}

/*------------HANDLE CHANGES------------------------------------*/
  const handleChange = (e)=>{
    setKeyword(e.target.value)
  }

  const handleSelectedFilter = (filterCategory, value)=>{
    setSelectedFilters((prevFilters)=>({
      ...prevFilters,
      [filterCategory]:value
    }))

    if(filterCategory=='title'){
      setSelectedFilters((prevFilters)=>({
        ...prevFilters,
        author:0
      }))
    }else if(filterCategory=='author'){
      setSelectedFilters((prevFilters)=>({
        ...prevFilters,
        title:0
      }))
    }
  }

  const handleEnter = (e)=>{
    if(e.key=='Enter'){
      getCatalogOnline(true)
    }
  }

/*------------------------SYNC DATA------------------------------ */
const syncData2DB = async () => {
  setLoading(true)
  await syncResourcesOnline()
  setLoading(false)
  // await syncAuthorsOnline()
  // await syncResourceAuthorsOnline()
};

// Sync resources
const syncResourcesOnline = async () => {
  try {
    setLoading(true)
    // Get all resources in IndexedDB
    const resources = await getAllFromStore('resources');
    console.log('Preparing resources for syncing: ', resources);

    for (const resource of resources) {
      try {
        // Sync the resource
        const response = await axios.post('http://localhost:3001/api/sync/resources', resource);
        if (response.data.status === 409) {
          alert(response.data.message);
          continue; // Skip the resource if there's a conflict
        }
        console.log(`Synced resource: ${resource.resource_id}`, response.data);

        // Retrieve resource_id from the server response
        const { resource_id: serverResourceId } = response.data;

        // Sync related data
        const authors = await getResourceAuthors(resource.resource_id);
        console.log('offline authors',authors);
        await syncAuthorsOnline(authors, serverResourceId);

        const resourceType = resource.type_id;
        switch (resourceType) {
          case '1': // Book
            const publisher = await getPub(resource.resource_id); 
            const book = await getResource('book', resource.resource_id);
            const pubId = await syncPublisherOnline(publisher);
            await syncBookOnline(book, serverResourceId, pubId);
            break;
          case '2': // Journal
          case '3': // Newsletter
            const jn = await getResource('journalnewsletter', resource.resource_id);
            await syncJournalNewsletterOnline(jn, serverResourceId);
            break;
          case '4': // Thesis
            const adviser = await getResourceAdviser(resource.resource_id);
            await syncAdviserOnline(adviser, serverResourceId);
            break;
          default:
            console.warn(`Unhandled resource type: ${resourceType}`);
        }

        // Delete resource from IndexedDB after successful sync
        await Promise.all([
          deleteResourceFromIndexedDB('resources', resource.resource_id),
          deleteResourceFromIndexedDB('book', resource.resource_id),
          deleteResourceFromIndexedDB('thesis', resource.resource_id),
          deleteResourceFromIndexedDB('journalnewsletter', resource.resource_id),
        ]);
        console.log(`Resource ${resource.resource_id} deleted from IndexedDB.`);
      } catch (error) {
        setStatusModal(true);
        setStatusModalContent({
          status: 'error',
          message: `Failed to sync resource with title "${resource.resource_title}".`,
        });
        console.error(`Failed to sync resource: ${resource.resource_id}`, error.message);
      }
    }

     // Clear object stores used in cataloging
     await Promise.all([
      clearObjectStore('author'),
      clearObjectStore('resourceauthors'),
      clearObjectStore('publisher'),
      clearObjectStore('adviser'),
    ]);

    setLoading(false)

    setStatusModal(true);
    setStatusModalContent({
      status: 'success',
      message: 'All resources processed.',
    });
    console.log('All resources processed.');
  } catch (error) {
    setLoading(false)
    setStatusModal(true);
    setStatusModalContent({
      status: 'error',
      message: 'Error during data syncing. Please try again.',
    });
    console.error('Error during data syncing:', error.message);
  }
};

//sync advisers
const syncAdviserOnline = async(adviser,resourceId)=>{
  try {
    console.log('syncing advisers')
    const response = await axios.post('http://localhost:3001/api/sync/adviser', { adviser, resourceId });
    console.log(`Synced adviser: ${adviser.adviser_id}`, response.data);
   
  } catch (error) {
    console.error('Error during authors syncing:', error.message);
  }
}

// Sync authors
const syncAuthorsOnline = async (authors, resourceId) => {
  try {
    for (const author of authors) {
      try {
        const response = await axios.post('http://localhost:3001/api/sync/authors', { author, resourceId });
        console.log(`Synced author: ${author.author_id}`, response.data);
      } catch (error) {
        console.error(`Failed to sync author: ${author.author_id}`, error.message);
      }
    }
    console.log('All authors processed.');
  } catch (error) {
    console.error('Error during authors syncing:', error.message);
  }
};

// Sync publisher
const syncPublisherOnline = async (publisher) => {
  try {
    const response = await axios.post('http://localhost:3001/api/sync/publisher', publisher);
    const { pub_id } = response.data;
    console.log('Publisher synced successfully with ID:', pub_id);
    return pub_id
  } catch (error) {
    console.error('Failed to sync publisher:', error.message);
  }
};

// Sync book
const syncBookOnline = async (book, resourceId, pubId) => {
  try {
    const formData = new FormData();

    // Append book fields to FormData
    Object.entries(book).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append resourceId and pubId to FormData
    formData.append('resourceId', resourceId);
    formData.append('pubId', pubId);

    // Send the FormData to the backend
    const response = await axios.post('http://localhost:3001/api/sync/book', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('Book synced successfully:', response.data);
  } catch (error) {
    console.error('Failed to sync book:', error.message);
  }
};

//sync journal and newsltter
const syncJournalNewsletterOnline = async (jn, resourceId) => {
  try {
    const formData = new FormData();
    // Append book fields to FormData
    Object.entries(jn).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append resourceId to FormData
    formData.append('resourceId', resourceId);

    // Send the FormData to the backend
    const response = await axios.post('http://localhost:3001/api/sync/journalnewsletter', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('Journal/Newsletter synced successfully:', response.data);
  } catch (error) {
    console.error('Failed to sync Journal/Newsletter:', error.message);
  }
};

 /*------------HANDLE PAGINATION---------------- */
 const handlePreviousButton = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};

const handleNextButton = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};       

console.log(selectedFilters)
console.log(catalog)
  return (
    <div className='cat-container'>
      <h1>Catalog</h1>
      {/* <img src="https://barcodeapi.org/api/128/9789719654025" /> */}
          {/* add and scan item buttons */}
          <div className="add-scan-item">
            <div className='d-flex justify-content-between'>
              {/* add item  */}
              <Link to='/catalog/add'>
                <button type="button" class="btn cat-button d-flex align-items-center justify-content-center gap-2 ">
                <FontAwesomeIcon icon={faPlus} className='icon'/>
                  Add item
                </button>
              </Link>
              {/* generate barcode */}
              {/* <Link to='/catalog/generate-barcode'>
                <button type="button" class="btn cat-add-item">
                  <FontAwesomeIcon icon={faBarcode} className='icon'/>
                  Generate Barcode
                </button>
              </Link> */}
              {/* generate barcode */}
              {/* <Link to='/catalog/manage-catalog'>
                <button type="button" class="btn cat-add-item">
                  <FontAwesomeIcon icon={faPenToSquare} className='icon'/>
                  Manage Catalog
                </button>
              </Link> */}

              {/* sync*/}
              {isOnline?
              <div>
                  {/* sync to database */}
                  <button
                  className='btn cat-button px-3'
                  onClick={syncData2DB}
                  disabled={!isOnline}
                  title='Sync offline data to online.'
                >
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </button>
              </div>:''}
            </div>
              
          </div>
        
        {/* search-filter */}
          <div className="search-filter d-flex gap-2">
            <input type="search" className='search-bar' placeholder="Search by title or author" onChange={handleChange} onKeyDown={handleEnter}/>
            <button 
              className="btn cat-button px-3" 
              onClick={() => {isOnline?getCatalogOnline(true):getCatalogOffline(true)}}>
              <FontAwesomeIcon icon={faSearch} className='icon'/>
            </button>
            {isOnline?
            <button 
              className="btn cat-button clear-btn fw-semibold" 
              onClick={() => setSelectedFilters({ title:0, author:0, type: 0, department: 0, topic: 0 })}>
              Clear filter
              </button>:''}
          </div>
     
            <table className="cat-table">
              <thead>
                <tr>
                  {/* <td >ID</td> */}
                  <td>
                    Title
                    {isOnline?<select name="" id="" className='sort' onChange={(e)=>handleSelectedFilter('title', e.target.value)}>
                      <option value="" disabled selected></option>
                      <option value="1">Sort by Title (A-z)</option>
                      <option value="2">Sort by Title (Z-A)</option>
                    </select>:''}
                  </td>
                  <td>Type
                    {isOnline?<select name="" id="" className='sort' onChange={(e)=>handleSelectedFilter('type', e.target.value)}>
                    <option value="" disabled selected></option>
                      {type.length>0?type.map(item=>{
                        return <option value={item.type_id}>{item.type_name}</option>
                      }):''}
                    </select>:''}
                  </td>
                  <td>
                    Authors
                    {isOnline?
                    <select name="" id="" className='sort' onChange={(e)=>handleSelectedFilter('author', e.target.value)}>
                      <option value="" disabled selected></option>
                      <option value="1">Sort by Author Name (A-z)</option>
                      <option value="2">Sort by Author Name (Z-A)</option>
                    </select>:''}
                  </td>
                  <td>
                    Department
                    {isOnline?
                    <select name="" id="" className='sort' onChange={(e)=>handleSelectedFilter('department', e.target.value)}>
                      <option value="" disabled selected></option>
                      {department.length>0?department.map(item=>{
                        return <option value={item.dept_id}>{item.dept_name}</option>
                      }):''}
                    </select>:''}
                  </td>
                  <td>Topic
                    {isOnline?
                    <select name="" id="" className='sort' onChange={(e)=>handleSelectedFilter('topic', e.target.value)}>
                      <option value="" disabled selected></option>
                      {topic.length>0?topic.map(item=>{
                        return <option value={item.topic_id}>{item.topic_name}</option>
                      }):''}
                    </select>:''}
                  </td>
                  <td >Copies</td>
                </tr>
              </thead>
              <tbody>
              {catalog.length === 5 ? (
                catalog.map((item, key) => (
                  <tr key={key} onClick={() => navigate(`/catalog/view/${item.resource_id}`)}>
                    <td>{item.resource_title}</td>
                    <td>{item.type_name}</td>
                    <td>{item.author_names}</td>
                    <td>{item.dept_name}</td>
                    <td>{item.topic_name}</td>
                    <td>{item.resource_quantity}/{item.original_resource_quantity}</td>
                  </tr>
                ))
              ) : !loading && catalog.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No records available</td>
                </tr>
              ) : (
                // Display odd data and ensure at least 5 rows
                <>
                  {catalog.map((item, key) => (
                    <tr key={key} onClick={() => navigate(`/catalog/view/${item.resource_id}`)}>
                      <td>{item.resource_title}</td>
                      <td>{item.type_name}</td>
                      <td>{item.author_names}</td>
                      <td>{item.dept_name}</td>
                      <td>{item.topic_name}</td>
                      <td>{item.resource_quantity}/{item.original_resource_quantity}</td>
                    </tr>
                  ))}
                  {[...Array(5 - catalog.length)].map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td colSpan="7" style={{ textAlign: 'center', opacity: 0 }}>-</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
            </table> 
            {/* pagination */}
            <nav aria-label="Page navigation example">
              <div class="pagination">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className='buttons'>
                  <button
                    className="btn"
                    onClick={handlePreviousButton}
                    disabled={currentPage === 1}
                    aria-label="Go to previous page"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className='icon'/>
                  </button>
                  <button
                    className='btn'
                    onClick={handleNextButton}
                    disabled={currentPage === totalPages}
                    aria-label="Go to next page"
                  >
                    <FontAwesomeIcon icon={faArrowRight} className='icon'/>
                  </button>
                </div>
              </div>
            </nav>
        
      {/* <Loading loading={loading}/> */}
      <ResourceStatusModal open={statusModal} close={()=>setStatusModal(false)} content={statusModalContent} isOnline={isOnline}/>
      {/* <CatalogFilterModal open={openFilter} close={()=>setOpenFilter(false)}/> */}
    </div>
  )
}

export default Catalog
