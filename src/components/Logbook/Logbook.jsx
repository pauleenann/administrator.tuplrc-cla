import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Logbook.css';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowLeft, faArrowRight, faExclamationCircle, faSmile } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx'; // Import xlsx for Excel export
import { io } from 'socket.io-client';

const Logbook = () => {
    const [patron, setPatron] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0); // Total number of entries
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        // Clean up socket connection on unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            // Listen for attendance updates
            socket.on('attendanceUpdated', () => {
                console.log('Attendance updated, refreshing data...');
                fetchTodayEntries();
            });

            // Clean up event listener
            return () => {
                socket.off('attendanceUpdated');
            };
        }
    }, [socket, currentPage, entriesPerPage, searchInput]);

    useEffect(() => {
        fetchTodayEntries();
    }, [location.search, currentPage, entriesPerPage]);
    
    // This function handles the search when either the button is clicked or Enter key is pressed
    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page when searching
        fetchTodayEntries();
    };

    const fetchTodayEntries = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0]; // Get today's date
            let url = `http://localhost:3001/api/patron/sort?startDate=${today}&endDate=${today}&limit=${entriesPerPage}&page=${currentPage}`;
            
            // Add search parameter if searchInput is not empty
            if (searchInput.trim() !== '') {
                url += `&search=${encodeURIComponent(searchInput.trim())}`;
            }
            
            const response = await axios.get(url);
            setPatron(response.data.results);
            setTotalEntries(response.data.total);
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        // First update all states
        setSearchInput('');
        setCurrentPage(1);
        setEntriesPerPage(5);
        
        // Then use the actual values directly in the fetch call
        fetchClearEntries();
    };
    
    // Create a new function that doesn't depend on the state values that are being updated
    const fetchClearEntries = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            // Use hard-coded values instead of state variables that were just updated
            let url = `http://localhost:3001/api/patron/sort?startDate=${today}&endDate=${today}&limit=5&page=1`;
            
            const response = await axios.get(url);
            setPatron(response.data.results);
            setTotalEntries(response.data.total);
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    console.log(patron);
    return (
        <div className='logbook-container bg-light'>
            <h1>Logbook</h1>

            <div className='d-flex justify-content-between align-items-center'> 
                {/* search bar and export button */}
                <div className="search-export">
                    <div className="input-group z-0" role="search">
                        <input
                            className="log-search-bar form-control shadow-sm"
                            type="search"
                            placeholder="Enter Student ID or Student Name"
                            aria-label="Search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <button 
                            className="btn log-search-button" 
                            onClick={handleSearch}
                        >
                            <FontAwesomeIcon icon={faSearch}/> 
                        </button>

                        <button className='btn btn-warning ms-2 d-flex align-items-center' 
                            onClick={clearFilters}>
                            Clear Filters
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
                    Showing {patron ? patron.length : 0} of {totalEntries} Entries
                </p>
                <table className='logbook-table mt-2'>
                    <thead>
                        <tr>
                            {/* <td>No.</td> */}
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
                        {Array.isArray(patron) ? patron.length > 0 ? (
                            patron.map((item, index) => (
                                <tr key={index}>
                                    {/* <td>{entriesPerPage === "All"
                        ? index + 1 
                        : index + 1 + (currentPage - 1) * entriesPerPage}</td> */}
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
                        ) : patron.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="9" className='no-data-box text-center'>
                                    <div className='d-flex flex-column align-items-center gap-2 '>
                                        <FontAwesomeIcon icon={faSmile} className="fs-2 no-data" />
                                        <span>No logbook data available<br/>for today.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                <div className="spinner-box">
                                    <div className="spinner-grow text-danger" role="status">
                                    <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                                </td>
                            </tr>
                        ) : ''}
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
                                <FontAwesomeIcon icon={faArrowLeft}/>
                            </button>
                            <button onClick={() => handlePageChange(currentPage + 1)} className="btn ">
                                <FontAwesomeIcon icon={faArrowRight}/>
                            </button>
                        </div>
                        
                    </div>
                )}
        </div>
    );
};

export default Logbook;