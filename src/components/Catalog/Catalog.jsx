import React, { useEffect, useState } from 'react'
import './Catalog.css'
import axios from 'axios'
import { getAllFromStore, getAllResources, getCatalogDetailsOffline} from '../../indexedDb/getDataOffline'
import { deleteResourceFromIndexedDB } from '../../indexedDb/syncData'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faSearch, faPlus, faArrowsRotate, faArrowDown, faArrowUp, faArrowUpWideShort, faExclamationCircle, faArchive, faEye, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import CatalogFilterModal from '../CatalogFilterModal/CatalogFilterModal'
import { setAdvancedSearch, setIsSearch } from '../../features/advancedSearchSlice'
import Swal from 'sweetalert2'
import CatalogImport from '../CatalogImport/CatalogImport'
import { fetchTopicOffline, fetchTopicOnline } from '../../features/topicSlice'
import { fetchTypeOffline, fetchTypeOnline } from '../../features/typeSlice'
import { fetchDepartmentOffline, fetchDepartmentOnline } from '../../features/departmentSlice'

const Catalog = () => {
  const dispatch = useDispatch();
  const {username} = useSelector(state=>state.username)
  // state for catalog import modal
  const [isOpen, setIsOpen] = useState(false);
  const [catalog, setCatalog] = useState([])
  const {advancedSearch, isSearch} = useSelector(state=>state.advancedSearch)
  // Pagination state
  const [pagination, setPagination] = useState(5); // Items per page
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [keyword, setKeyword] = useState('') // Changed from '%%' to empty string for clearer handling
  const [statusModal, setStatusModal] = useState(false)
  const isOnline = useSelector(state => state.isOnline.isOnline)
  const {department} = useSelector(state=>state.department)
  const {topic} = useSelector(state=>state.topic)
  const {type} = useSelector(state=>state.type)
  const [selectedFilters, setSelectedFilters] = useState({ title: '', author: '', type: '', department: '', topic: '', isArchived:0 });
  const navigate = useNavigate()
  const [sortOrder, setSortOrder] = useState({
    title: 0,  // 0: no sort, 1: ascending, 2: descending
    author: 0
  });
  const [displayedCatalog, setDisplayedCatalog] = useState([]);
  // for catalog modal
  const [openFilter, setOpenFilter] = useState(false);
  const [duplicatedResources,setDuplicatedResources] = useState();

  const toggleSort = (column) => {
    setSortOrder((prev) => {
      // Cycle through: no sort (0) -> ascending (1) -> descending (2) -> no sort (0)
      const newOrder = prev[column] === 0 ? 1 : prev[column] === 1 ? 2 : 0;
      return { ...prev, [column]: newOrder };
    });
  };

  useEffect(() => {
    if (isOnline == null) {
      return
    }
    const fetchData = async () => {
      if (isOnline) {
        dispatch(fetchTypeOnline());
        dispatch(fetchDepartmentOnline());
        dispatch(fetchTopicOnline());
        await getCatalogOnline();
      } else {
        dispatch(fetchTypeOffline());
        dispatch(fetchDepartmentOffline());
        dispatch(fetchTopicOffline());
        await getCatalogOffline();
      }
    };
    fetchData();
  }, [isOnline, selectedFilters, advancedSearch, isSearch]);

  useEffect(()=>{
    dispatch(setIsSearch(false));
    dispatch(setAdvancedSearch([]))
  },[])

  // This useEffect triggers search when keyword changes, including empty string
  useEffect(() => {
    // Skip the initial render
    if (keyword=='') {
      if (isOnline) {
        getCatalogOnline();
      } else {
        getCatalogOffline();
      }
    }
  }, [keyword]);

  // Apply sorting and pagination to catalog data
  useEffect(() => {
    if (catalog.length > 0) {
      // Create a copy of the catalog to sort
      let sortedCatalog = [...catalog];

      // Apply sorting
      if (sortOrder.title === 1) {
        sortedCatalog.sort((a, b) => a.resource_title.localeCompare(b.resource_title));
      } else if (sortOrder.title === 2) {
        sortedCatalog.sort((a, b) => b.resource_title.localeCompare(a.resource_title));
      }

      if (sortOrder.author === 1) {
        sortedCatalog.sort((a, b) => {
          const authorA = Array.isArray(a.author_names) ? a.author_names[0] || '' : a.author_names || '';
          const authorB = Array.isArray(b.author_names) ? b.author_names[0] || '' : b.author_names || '';
          return authorA.localeCompare(authorB);
        });
      } else if (sortOrder.author === 2) {
        sortedCatalog.sort((a, b) => {
          const authorA = Array.isArray(a.author_names) ? a.author_names[0] || '' : a.author_names || '';
          const authorB = Array.isArray(b.author_names) ? b.author_names[0] || '' : b.author_names || '';
          return authorB.localeCompare(authorA);
        });
      }

      // Calculate total pages
      setTotalPages(Math.ceil(sortedCatalog.length / pagination));

      // Apply pagination
      const startIndex = (currentPage - 1) * pagination;
      const endIndex = startIndex + pagination;
      setDisplayedCatalog(sortedCatalog.slice(startIndex, endIndex));
    } else {
      setDisplayedCatalog([]);
      setTotalPages(0);
    }
  }, [catalog, sortOrder, currentPage, pagination]);

  /*-------------------DISPLAY RESOURCES IN CATALOG PAGE------------------- */
  const getCatalogOnline = async (resetPage = false) => {
    try {
      if (resetPage) {
        setCurrentPage(1);
        setSelectedFilters({ title: '', author: '', type: '', department: '', topic: '', isArchived:0 });
        setSortOrder({ title: 0, author: 0 });
      }
      setLoading(true); // Show loading spinner
      
      if(advancedSearch.length == 0 && !isSearch) {
        // Use keyword as is, or convert empty string to '%%' for backend wildcard search
        const searchKeyword = keyword === '' ? '%%' : keyword;
           
        const response = await axios.get(`https://api2.tuplrc-cla.com/api/catalog`, {
          params: {
            keyword: searchKeyword,
            type: selectedFilters.type,
            dept: selectedFilters.department,
            topic: selectedFilters.topic,
            isArchived:selectedFilters.isArchived,
            sort: selectedFilters.title ? { column: 'title', order: selectedFilters.title } :
                  selectedFilters.author ? { column: 'author', order: selectedFilters.author } : null
          }
        });
        console.log(response);
        
        setCatalog(response.data);
      } else {
        // Filter advancedSearch results by title and author if they're set
        let filteredResults = [...advancedSearch];

        if (keyword?.trim()) {
          const lowerKeyword = keyword.toLowerCase().trim();
          
          filteredResults = filteredResults.filter(item => {
            const titleMatch = item.resource_title?.toLowerCase().includes(lowerKeyword) ?? false;
            const authorMatch = item.author_names?.toLowerCase().includes(lowerKeyword) ?? false;
            
            return titleMatch || authorMatch;
          });
        }

        setCatalog(filteredResults);
      }
         
    } catch (err) {
      console.error('Error fetching catalog data:', err.message);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const getCatalogOffline = async (resetPage = false) => {
    try {
      setLoading(true);
      const data = await getCatalogDetailsOffline(username);
      if (resetPage) {
        setCurrentPage(1);
        setSelectedFilters({ title: '', author: '', type: '', department: '', topic: '', isArchived:0 });
        setSortOrder({ title: 0, author: 0 });
      }

      let filteredData = data;
      if (keyword !== '') {
        // Filter the data based on the keyword
        filteredData = data.filter(item => {
          console.log(item)
          // Check if the title includes the keyword (case-insensitive)
          const titleMatch = item.resource_title.toLowerCase().includes(keyword.toLowerCase());

          // Check if any author name in the array matches the keyword (case-insensitive)
          const authorMatch = Array.isArray(item.author_names) && item.author_names.some(author =>
            author.toLowerCase().includes(keyword.toLowerCase())
          );

          // Return true if either the title or any author name matches the keyword
          return titleMatch || authorMatch;
        });
      }

      // Apply filters for type, department, topic
      if (selectedFilters.type) {
        filteredData = filteredData.filter(item => item.type_id == selectedFilters.type);
      }
      if (selectedFilters.department) {
        filteredData = filteredData.filter(item => item.dept_id == selectedFilters.department);
      }
      if (selectedFilters.topic) {
        filteredData = filteredData.filter(item => item.topic_id == selectedFilters.topic);
      }

      setCatalog(filteredData);
    } catch (error) {
      console.error('Error fetching offline catalog data:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log(catalog)
  /*------------HANDLE CHANGES------------------------------------*/
  const handleSelectedFilter = (filterCategory, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterCategory]: value
    }));

    if (filterCategory == 'title') {
      setSelectedFilters((prevFilters) => ({
        ...prevFilters,
        author: ''
      }));
    } else if (filterCategory == 'author') {
      setSelectedFilters((prevFilters) => ({
        ...prevFilters,
        title: ''
      }));
    }
    
    // Reset to first page when changing filters
    setCurrentPage(1);
  }

  const handleClear = () => {
    dispatch(setIsSearch(false));
    dispatch(setAdvancedSearch([]))
    setSelectedFilters({ title: '', author: '', type: '', department: '', topic: '', isArchived:0 });
    setKeyword('');
    setSortOrder({ title: 0, author: 0 });
    setCurrentPage(1);
    
    // Trigger a search after clearing
    if(isOnline) {
      getCatalogOnline(true);
    } else {
      getCatalogOffline(true);
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
  }

  // Handle search submission
  const handleSearch = () => {
    if(isOnline) {
      getCatalogOnline();
    } else {
      getCatalogOffline();
    }
  }

  /*------------------------SYNC DATA------------------------------ */
  const syncData2DB = async () => {
    setSyncLoading(true)
    const resources = await getAllResources(username);
    let duplicated = [];
    if(resources.length>0){
      for(const resource of resources){
        const formData = new FormData();
        formData.append('username', username);
        Object.entries(resource).forEach(([key, value]) => {
          formData.append(key, value);
        })
        const response = await axios.post('https://api2.tuplrc-cla.com/api/resources', formData);
        if (response.data.status === 409) {
          duplicated.push(resource.title)
          continue; // Skip the resource if there's a conflict
        }
        // delete if synced
        deleteResourceFromIndexedDB('resources', resource.resource_id);
        console.log(`Synced resource: ${resource.resource_id}`, response.data);
      }

      setDuplicatedResources(duplicated)

      setTimeout(()=>{
        setSyncLoading(false)
        setStatusModal(true);
        Swal.fire({
          title: "All resources synced!",
          html: duplicatedResources && duplicatedResources.length > 0 
              ? `Offline resources synced successfully. These will be deleted from storage. Resources such as <b>${duplicatedResources.join(', ')}</b>, already exist and cannot be synced again.` 
              : 'You have successfully synced offline resources. These resources will now be deleted from offline storage.',
          icon: "success",
          draggable: true,
          confirmButtonColor: "#54CB58",
      }).then(() => {
        window.location.reload(); // Reload the page after confirming
      });    
      },3000)
    }else{
      setSyncLoading(false)
      let timerInterval;
      Swal.fire({
        title: "You have no offline data to sync!",
        html: "I will close in <b></b> milliseconds.",
        timer: 5000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          console.log("I was closed by the timer");
        }
        window.location.reload()
      });
    }
    

    
    console.log('All resources processed.')
  };

  console.log(duplicatedResources)

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

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setPagination(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // handle archive
  const handleArchive = async (id, status)=>{
    const resourceState = status==0?1:0; //if status is 0, set to 1 to indicate that it's about to be archived keme
    let result;

    if(resourceState==1){
      result = await Swal.fire({
        title: "Are you sure",
        text: `You want to archive this resource?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#54CB58",
        cancelButtonColor: "#94152b",
        confirmButtonText: "Yes, archive!"
      });
    }else{
      result = await Swal.fire({
        title: "Are you sure",
        text: `You want to unarchive this resource?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#54CB58",
        cancelButtonColor: "#94152b",
        confirmButtonText: "Yes, unarchive!"
      });
    }
    
    
    if (!result.isConfirmed) return; // Exit if user cancels

    try {
      await axios.post(`https://api2.tuplrc-cla.com/api/catalog`,{id,resourceState,username});
      // Show toast first
      window.toast.fire({ 
        icon: "success", 
        title: `Resource ${resourceState == 1 ? 'Archived' : 'Unarchived'}` 
      });
      
      // Delay reload to allow toast visibility
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Adjust delay as needed
    } catch (error) {
      console.log('Cannot archive resource. An error occurred:', error)
    }
  }

  console.log(keyword)

  return (
    <div className='cat-container bg-light'>
      <h1>Catalog</h1>
      {/* <img src="https://barcodeapi.org/api/128/9789719654025" /> */}
      {/* add and scan item buttons */}
      <div className="add-scan-item">
        <div className='d-flex justify-content-between'>
          {/* add item  */}
          <Link to='/catalog/add'>
            <button type="button" className="btn cat-button d-flex align-items-center justify-content-center gap-2 ">
              <FontAwesomeIcon icon={faPlus}/>
              Add item
            </button>
          </Link>
        </div>
      </div>

      {/* search-filter */}
      <div className="search-filter d-flex">
        {/* search */}
        <div className='input-group z-0'>
          <div>
            <input 
              type="search" 
              className='search-bar form-control shadow-sm mb-1' 
              placeholder="Search by title or author" 
              value={keyword} 
              onChange={handleSearchChange} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }} 
            />
            {isOnline&&(
              <button href="" className='m-0 advanced-search fw-semibold' onClick={()=>setOpenFilter(true)}>Advanced Search</button>
            )}   
          </div>
          <button
            className="btn cat-button shadow-sm px-3"
            onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch}/>
          </button>
          <button
            className="btn btn-warning clear-btn shadow-sm ms-2"
            onClick={handleClear}>
            Clear filter
          </button>
        </div>
        
        
      </div>

      {/*filters and import  */}
      <div className='d-flex justify-content-between mt-4'>
        <div className="filters d-flex gap-3">
          <div className="items-per-page">
            <label htmlFor="itemsPerPage">Items per page: </label>
            <select
              id="itemsPerPage"
              value={pagination}
              onChange={handleItemsPerPageChange}
              className="form-select form-select-sm"
              style={{ width: 'auto', display: 'inline-block', marginLeft: '5px' }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          {/*archived/unarchived  */}
          {isOnline&&(
            <div className="">
              <label htmlFor="">Category: </label>
              <select
                id=""
                name='isArchived'
                onChange={(e) => handleSelectedFilter('isArchived', e.target.value)}
                className="form-select form-select-sm"
                value={selectedFilters.isArchived}
                style={{ width: 'auto', display: 'inline-block', marginLeft: '5px' }}
              >
                <option value="0" selected>Unarchived</option>
                <option value="1" >Archived</option>
              </select>
            </div>
          )}
        </div>

        {isOnline&&(
          <div className='d-flex gap-2'>  
            <button 
              className='btn btn-primary d-flex gap-2 align-items-center' 
              onClick={()=>setIsOpen(true)}
              title='Import excel file'
            >
              <FontAwesomeIcon icon={faUpload}/>
              Import
            </button>
            {/* sync to database */}
            <button
              className='btn btn-danger d-flex align-items-center gap-2 px-3 position-relative'
              onClick={syncData2DB}
              disabled={!isOnline||syncLoading}
              title='Sync offline data to online.'
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
              {syncLoading?'Syncing...':'Sync data'}
            </button>
          </div>   
        )}
      </div>
      
              
      <table className="cat-table">
        <thead>
          <tr>
            <td>
              Title
             
                <FontAwesomeIcon
                  icon={sortOrder.title === 1 ? faArrowUp : sortOrder.title === 2 ? faArrowDown : faArrowUpWideShort}
                  className={`sort-icon ps-2 ${sortOrder.title !== 0 ? 'active' : ''}`}
                  onClick={() => toggleSort('title')}
                />
              
            </td>
            <td>Type
              <select 
                value={selectedFilters.type}
                className='sort' 
                onChange={(e) => handleSelectedFilter('type', e.target.value)}>
                <option value="">All Types</option>
                {type.length > 0 ? type.map(item => {
                  return <option key={item.type_id} value={item.type_id}>{item.type_name}</option>
                }) : ''}
              </select> 
            </td>
            <td>
              Authors
            
                <FontAwesomeIcon
                  icon={sortOrder.author === 1 ? faArrowUp : sortOrder.author === 2 ? faArrowDown : faArrowUpWideShort}
                  className={`sort-icon ps-2 ${sortOrder.author !== 0 ? 'active' : ''}`}
                  onClick={() => toggleSort('author')}
                />
              
            </td>
            <td>
              Department
              
                <select 
                  value={selectedFilters.department}
                  className='sort' 
                  onChange={(e) => handleSelectedFilter('department', e.target.value)}>
                  <option value="">All Departments</option>
                  {department.length > 0 ? department.map(item => {
                    return <option key={item.dept_id} value={item.dept_id}>{item.dept_name}</option>
                  }) : ''}
                </select>
            </td>
            <td>Topic
              
                <select 
                  value={selectedFilters.topic}
                  className='sort' 
                  onChange={(e) => handleSelectedFilter('topic', e.target.value)}>
                  <option value="">All Topics</option>
                  {topic.length > 0 ? topic.map(item => {
                    return <option key={item.topic_id} value={item.topic_id}>{item.topic_name}</option>
                  }) : ''}
                </select>
            </td>
            <td>Copies</td>
            {/* <td>Status</td> */}
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td>
            </tr>
          ) : displayedCatalog.length > 0 ? (
            displayedCatalog.map((item, key) => (
              <tr key={key}>
                <td>{item.resource_title}</td>
                <td>{item.type_name}</td>
                <td>
                  {Array.isArray(item.author_names) && item.author_names.length > 0 
                  ? item.author_names.join(', ') 
                  : (item.author_names || 'N/A')}
                </td>
                <td>{item.dept_name}</td>
                <td>
                  {item.topic_name
                    ? item.topic_name 
                    : 'N/A'}
                </td>
                <td>
                  {`${item.resource_quantity}/${item.original_resource_quantity}`}
                </td>
                {/* <td>
                  <span className={`text-light p-2 rounded fw-semibold ${item.resource_is_archived==0?'bg-success':'bg-danger'}`}>
                    {item.resource_is_archived==0?'unarchived':'archived'}
                  </span>
                </td> */}
                <td className=''>
                  <button type="button" class="btn btn-transparent border-0" data-toggle="tooltip" data-placement="top" title="View Resource" onClick={() => navigate(`/catalog/view/${item.resource_id}`)}>
                    <FontAwesomeIcon icon={faEye} className='archive-btn'/>
                  </button>
                  {isOnline&&(
                    <button type="button" class="btn btn-transparent border-0" data-toggle="tooltip" data-placement="top" title={`${item.resource_is_archived==0?'Archive':'Unarchive'} Resource`} onClick={()=>handleArchive(item.resource_id,item.resource_is_archived)}>
                      <FontAwesomeIcon icon={faArchive} className='archive-btn'/>
                    </button>
                  )}
                  
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>
                <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
                <p className='fw-semibold m-0 mt-2'>Resources not found.</p>
                <p className='text-secondary m-0'>Please try again.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* pagination controls */}
        <nav aria-label="Page navigation d-flex align-items-center justify-content-between">
          <div className="pagination">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className='buttons'>
              <button
                className="btn"
                onClick={handlePreviousButton}
                disabled={currentPage === 1 || totalPages === 0}
                aria-label="Go to previous page"
              >
                <FontAwesomeIcon icon={faArrowLeft}/>
              </button>
              <button
                className='btn'
                onClick={handleNextButton}
                disabled={currentPage === totalPages || totalPages === 0}
                aria-label="Go to next page"
              >
                <FontAwesomeIcon icon={faArrowRight}/>
              </button>
            </div>
          </div>
        </nav>

      <CatalogFilterModal open={openFilter} close={()=>setOpenFilter(false)}/>
      <CatalogImport open={isOpen} close={()=>setIsOpen(false)}/>
    </div>
  )
}

export default Catalog