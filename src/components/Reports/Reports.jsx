import React, { useEffect, useState } from 'react';
import './Reports.css';
import axios from 'axios';
import Loading from '../Loading/Loading';
import * as XLSX from 'xlsx'; // Import xlsx for Excel export
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faArrowDown, faArrowUp, faArrowUpWideShort, faDownload, faEye, faPlus, faSearch, faExclamationCircle, faArchive } from '@fortawesome/free-solid-svg-icons';
import ReportsModal from '../ReportsModal/ReportsModal';
import ReportView from '../ReportView/ReportView';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2'

const Reports = () => {
  const {username, userId} = useSelector(state=>state.username)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports]= useState([]);
  const [categories, setCategories] = useState([]);
  const [viewId, setViewId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [selectedFilter, setSelectedFilter] = useState({
    category: 'any',
    status: 'any'
  })
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);

  useEffect(() => {
    getReports();
    getCategories();
  }, [userId]);

  useEffect(() => {
    const search = searchTerm?.toLowerCase() || "";
  
    const filtered = reports.filter(report => {
      const matchesSearch = 
        report.report_name.toLowerCase().includes(search) ||
        report.report_description.toLowerCase().includes(search);
  
      const matchesCategory = 
        selectedFilter.category == 'any' || report.cat_id == selectedFilter.category;
  
      const matchesStatus = 
        selectedFilter.status == 'any' || report.is_archived == selectedFilter.status;
  
      return matchesSearch && matchesCategory && matchesStatus;
    });
  
    // Apply sorting
    const sortedReports = [...filtered].sort((a, b) => {
      if (sortConfig.key === 'created_at') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      } else {
        return sortConfig.direction === 'asc'
          ? a[sortConfig.key]?.localeCompare?.(b[sortConfig.key]) ?? 0
          : b[sortConfig.key]?.localeCompare?.(a[sortConfig.key]) ?? 0;
      }
    });
  
    setFilteredReports(sortedReports);
    setCurrentPage(1); // Reset to first page when filtering or sorting
  }, [searchTerm, reports, sortConfig, selectedFilter]);

  const getReports = async() => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/reports/${userId}`);
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (error) {
      console.log('Cannot fetch details. ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/reports/categories`);
      console.log(response.data)
      setCategories(response.data);
    } catch (error) {
      console.error('Cannot fetch categories:', error);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSortConfig({ key: 'created_at', direction: 'desc' });
    setCurrentPage(1);
    setSelectedFilter({
      category: 'any',
      status: 'any'
    })
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    setSortConfig(prevSortConfig => ({
      key,
      direction: prevSortConfig.key === key && prevSortConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get current reports for pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? faArrowUp : faArrowDown;
    }
    return faArrowUpWideShort;
  };

  // archive/unarchive
  const handleArchive = async (id, status)=>{
    const reportState = status==0?1:0; //if status is 0, set to 1 to indicate that it's about to be archived keme
    let result;

    if(reportState==1){
      result = await Swal.fire({
        title: "Are you sure",
        text: `You want to archive this report?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#54CB58",
        cancelButtonColor: "#94152b",
        confirmButtonText: "Yes, archive!"
      });
    }else{
      result = await Swal.fire({
        title: "Are you sure",
        text: `You want to unarchive this report?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#54CB58",
        cancelButtonColor: "#94152b",
        confirmButtonText: "Yes, unarchive!"
      });
    }
    
    
    if (!result.isConfirmed) return; // Exit if user cancels

    try {
      await axios.put(`http://localhost:3001/api/reports/archive`,{id,reportState,username});
      // Show toast first
      window.toast.fire({ 
        icon: "success", 
        title: `Report ${reportState == 1 ? 'Archived' : 'Unarchived'}` 
      });
      
      // Delay reload to allow toast visibility
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Adjust delay as needed
    } catch (error) {
      console.log('Cannot archive report. An error occurred:', error)
    }
  }

  const handleFilterChange = (e)=>{
    const {value,name} = e.target;

    setSelectedFilter((prev)=>({
      ...prev,
      [name]:value
    }))
  }

  console.log(categories)

  console.log(reports)

  return (
    <div className="reports-container bg-light">
      <h1>Reports</h1>

      <div className='d-flex flex-column gap-3'>
        {/* search bar, and sort and create */}
        <div className='d-flex justify-content-between mt-4'>
          {/* search bar */}
          <div className='input-group w-50 shadow-sm z-0'>
            <input 
              type="text" 
              className='form-control' 
              placeholder='Search' 
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className='btn search-btn'>
              <FontAwesomeIcon icon={faSearch}/>
            </button>
          </div>
          {/* sort and create report */}
          <div className='d-flex gap-2'>
            <button className='btn create-btn d-flex gap-2 align-items-center shadow-sm' onClick={() => setIsReportModalOpen(true)}>
              <FontAwesomeIcon icon={faPlus}/>
              Create new report
            </button>
          </div>
        </div>

        {/* filter */}
        <div className='d-flex align-items-center gap-3 mt-3'>
          {/* Category */}
          <div className='d-flex gap-1 align-items-center'>
            <label htmlFor="">Category</label>
            <select 
              name="category" 
              id="" 
              onChange={handleFilterChange}
              className='form-select form-select-sm'
              style={{ width: 'auto', display: 'inline-block', marginLeft: '5px',height:'35px' }}
            >
              <option value="any">Any</option>
                {categories.map(category => (
                    <option key={category.cat_id} value={category.cat_id}>
                    {category.cat_name}
                    </option>
                ))}
            </select>
          </div>
          <div className='d-flex gap-1 align-items-center'>
            <label htmlFor="">Status</label>
            <select 
              name="status" 
              id="" 
              onChange={handleFilterChange}
              className='form-select form-select-sm'
              style={{ width: 'auto', display: 'inline-block', marginLeft: '5px',height:'35px' }}
            >
              <option value="any">Any</option>
              <option value="1">Archived</option>
              <option value="0">Unarchived</option>
            </select>
          </div>
        </div>

        <div className='d-flex flex-column gap-3 data-box'>
          {/* header */}
          <div className='header m-0 p-0 row d-flex align-items-center text-center justify-content-center rounded text-light shadow-sm'>
            <div className='col-3 cursor-pointer' onClick={() => handleSort('report_name')}>
              Report Name
              <FontAwesomeIcon 
                icon={getSortIcon('report_name')} 
                className='ms-2'
              />
            </div>
            <div className='col-3 cursor-pointer' onClick={() => handleSort('report_description')}>
              Report Description
              <FontAwesomeIcon 
                icon={getSortIcon('report_description')} 
                className='ms-2'
              />
            </div>
            <div className='col-3 cursor-pointer' onClick={() => handleSort('created_at')}>
              Created at
              <FontAwesomeIcon 
                icon={getSortIcon('created_at')} 
                className='ms-2'
              />
            </div>
            <div className='col-3'>Actions</div>
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <Loading />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
              <p className='fw-semibold m-0 mt-2'>No reports available.</p>
              <p className='text-secondary m-0'>Please create one.</p>
              {/* <button className='btn clear-btn' onClick={clearFilters}>Clear Filter</button> */}
            </div>
          ) : currentReports.length === 0 ? (
            <div className="text-center py-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
              <p className='fw-semibold m-0 mt-2'>Report not found.</p>
              <p className='text-secondary m-0'>Please try a different search.</p>
              <button className='btn btn-warning mt-2' onClick={clearFilters}>Clear Filter</button>
            </div>
          )
          : (
            currentReports.map(report => (
              <div key={report.report_id} className='m-0 p-0 d-flex align-items-center text-center row rounded data shadow-sm'>
                <div className='col-3'>{report.report_name}</div>
                <div className='col-3'>{report.report_description}</div>
                <div className='col-3'>{dayjs(report.created_at).format("YYYY-MM-DD HH:mm:ss")}</div>
                <div className='col-3'>
                  <button className="btn eye-btn" onClick={() => {
                    setViewId(report.report_id);
                    setIsViewModalOpen(true);
                  }}>
                    <FontAwesomeIcon icon={faEye}/>
                  </button>
                  <button className="btn eye-btn" onClick={()=>handleArchive(report.report_id, report.is_archived)}>
                    <FontAwesomeIcon icon={faArchive}/>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {!isLoading && filteredReports.length > 0 && (
            <div className="pagination d-flex justify-content-between mt-4">
              <div className="pagination-info d-flex align-items-center">
                Page {currentPage} of {totalPages}
              </div>
              <div>
                <button 
                  className="btn pagination-btn" 
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <button 
                  className="btn pagination-btn" 
                  disabled={currentPage === totalPages}
                  onClick={() => paginate(currentPage + 1)}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
              
            </div>
          )}
        </div>
        </div>
        
      <ReportsModal 
        open={isReportModalOpen} 
        close={() => setIsReportModalOpen(false)}
        onSuccess={() => getReports()}
      />
      
      <ReportView 
        open={isViewModalOpen} 
        close={() => setIsViewModalOpen(false)} 
        id={viewId}
      />
    </div>
  );
};

export default Reports;