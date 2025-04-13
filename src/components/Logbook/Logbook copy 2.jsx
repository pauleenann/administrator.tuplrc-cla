import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Logbook.css'
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowLeft, faArrowRight, faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx'; // Import xlsx for Excel export

const Logbook = () => {
    const [patron, setPatron] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0); // Total number of entries
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    /* useEffect(() => {
        getPatron();
    }, [currentPage, entriesPerPage]); */

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filterToday = params.get('filter') === 'today';
    
        if (filterToday) {
            fetchTodayEntries();
        } else {
            if (searchInput !== '') {
                getPatron(); // Fetch once if searchInput is not empty
            } else {
                const interval = setInterval(getPatron, 1000); // Start polling if searchInput is empty
    
                return () => clearInterval(interval); // Cleanup on unmount or re-run
            }
        }
    }, [location.search, currentPage, entriesPerPage, searchInput]); // Add searchInput to dependency array
    

    function backupData() {
        const backup = localStorage.getItem("backupData");
        const parsedData = backup ? JSON.parse(backup) : [];
        setPatron(parsedData)
        if (backup) {
            console.log("Using backup data:", JSON.parse(backup));
        } else {
            console.log("No backup data available.");
        }
    }

    const getPatron = async () => {
        setLoading(true)
        if (navigator.onLine) {
            try {
                const params = {
                    search: searchInput,
                    startDate,
                    endDate,
                    limit: entriesPerPage,
                    page: currentPage, // Include current page in the request
                };
                const query = new URLSearchParams(params).toString();
                const response = await axios.get(`http://localhost:3001/api/patron/sort?${query}`);
                setPatron(response.data.results); // Expect results array in response
                setTotalEntries(response.data.total); // Set total entries for pagination
                localStorage.setItem("backupData", JSON.stringify(response.data.results));
            } catch (err) {
                console.log(err.message);
            }finally{
                setLoading(false)
            }
        } else {
            backupData();
        }
    };

    

    const fetchTodayEntries = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0]; // Get today's date
            const response = await axios.get(`http://localhost:3001/api/patron/sort?startDate=${today}&endDate=${today}&limit=${entriesPerPage}&page=${currentPage}`);
            setPatron(response.data.results);
            setTotalEntries(response.data.total);
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchInput('');
        setStartDate('');
        setEndDate('');
        setEntriesPerPage('5')
        setCurrentPage(1); // Reset to first page
        getPatron();
    };

    const exportToExcel = () => {
        const headers = [
            'Number',
            'TUP ID',
            'First Name',
            'Last Name',
            'Gender',
            'Phone No.',
            'Email',
            'Course',
            'College',
            'Date',
            'Time in',
        ];

        // Format data for Excel
        const data = patron.map((item, index) => ({
            'Number': index + 1 + (currentPage - 1) * entriesPerPage,
            'TUP ID': item.tup_id,
            'First Name': item.patron_fname,
            'Last Name': item.patron_lname,
            'Gender': item.patron_sex,
            'Phone No.': item.patron_mobile,
            'Email': item.patron_email,
            'Course': item.course,
            'College': item.college,
            'Date': new Date(item.att_date).toLocaleDateString('en-CA'),
            'Time in': item.att_log_in_time,
        }));

        // Create a worksheet and a workbook
        const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Logbook');

        // Export to Excel file
        XLSX.writeFile(workbook, 'Logbook.xlsx');
    };

    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    console.log(patron)
    return (
        <div className='logbook-container'>
            <h1>Logbook</h1>

            <div className='d-flex justify-content-between align-items-center'> 
                {/* search bar and export button */}
                <div className="search-export">
                    <div className="d-flex" role="search">
                        <input
                            className="log-search-bar"
                            type="search"
                            placeholder="Enter Student ID or Student Name"
                            aria-label="Search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                
                                getPatron();
                                }
                            }}
                        />
                        <button className="btn log-search-button" onClick={getPatron}>
                            <FontAwesomeIcon icon={faSearch} className='icon'/> 
                        </button>
                    </div>
                    
                </div>

                {/* filters */}
                <div className="logbook-filters">
                        <label htmlFor="entries">Entries per page</label>
                        <select
                            className="form-select"
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(e.target.value === "All" ? "All" : Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value="All">All</option>
                        </select>
                    
                </div>
            </div>
            

            {/* table */}
            <div>
                <p className="logbook-table-entries m-0">
                    Showing {patron?patron.length:0} of {totalEntries}   Entries
                </p>
                <table className='logbook-table mt-2'>
                    <thead>
                        <tr>
                            <td>No.</td>
                            <td>TUP ID</td>
                            <td>First Name</td>
                            <td>Last Name</td>
                            <td>Gender</td>
                            <td>Phone No.</td>
                            <td>Course</td>
                            <td>College</td>
                            <td>Date</td>
                            <td>Time in</td>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(patron)?patron.length > 0 ? (
                            patron.map((item, index) => (
                                <tr key={index}>
                                    <td>{entriesPerPage === "All"
                        ? index + 1 
                        : index + 1 + (currentPage - 1) * entriesPerPage}</td>
                                    <td>{item.tup_id}</td>
                                    <td>{item.patron_fname}</td>
                                    <td>{item.patron_lname}</td>
                                    <td>{item.patron_sex}</td>
                                    <td>{item.patron_mobile}</td>
                                    <td>{item.course}</td>
                                    <td>{item.college}</td>
                                    <td>{new Date(item.att_date).toLocaleDateString('en-CA')}</td>
                                    <td>{item.att_log_in_time}</td>
                                </tr>
                            ))
                        ) : patron.length==0 && !loading?(
                            <tr>
                                <td colSpan="10" className='no-data-box text-center'>
                                    <div className='d-flex flex-column align-items-center gap-2 '>
                                        <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
                                        <span>No logbook data available.<br/></span>
                                    </div>
                                </td>
                            </tr>
                        ):(
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                                <div className="spinner-box">
                                    <div className="spinner-grow text-danger" role="status">
                                    <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                                </td>
                            </tr>
                        ):''}
                    </tbody>
                    
                </table>
            </div>
                
            {/* pagination */}
                {entriesPerPage !== "All" && (
                    <div className="logbook-table-button-pagination d-flex align-items-center justify-content-between">
                        <div className="logbook-pages">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div>
                            <button onClick={() => handlePageChange(currentPage - 1)} className="btn ">
                                <FontAwesomeIcon icon={faArrowLeft} className='icon'/>
                            </button>
                            <button onClick={() => handlePageChange(currentPage + 1)} className="btn ">
                                <FontAwesomeIcon icon={faArrowRight} className='icon'/>
                            </button>
                        </div>
                        
                    </div>
                )}


            {/* <div className="logbook-table-pagination">
                <div className="logbook-table-entries">
                    Showing {patron.length} of {totalEntries} Entries
                </div>
                <div className="logbook-table-button-pagination">
                    <button onClick={() => handlePageChange(currentPage - 1)} class="btn btn-outline-danger">
                        <img src={left} alt="" />
                    </button>
                    <div className='logbook-pages'>
                        Page {currentPage} of {totalPages}
                    </div>
                    <button onClick={() => handlePageChange(currentPage + 1)} class="btn btn-outline-danger">
                        <img src={right} alt="" />
                    </button>
                </div>
            </div> */}
        </div>
    );
};

export default Logbook;
