import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Circulation.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faCartShopping, faSearch, faArrowLeft, faArrowRight, faExclamationCircle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Circulation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [borrowers, setBorrowers] = useState([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('any');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    const params = new URLSearchParams(location.search).get('filter');
    setQuery(params || 'any');
    getBorrowers();
    localStorage.removeItem('clickedAction');
    localStorage.removeItem('selectedItems');
  }, [location.search]);

  useEffect(() => {
    getBorrowers();
  }, [currentPage, query]);

  useEffect(() => {
    search();
  }, [searchTerm, startDate, endDate]);

  const getBorrowers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api2.tuplrc-cla.com/api/patron/borrowers`, {
        params: { page: currentPage, limit: itemsPerPage, query: query },
      });

      setBorrowers(response.data.data);
      console.log(response.data.data)
      setFilteredBorrowers(response.data.data);
      setTotalPages(Math.ceil(response.data.totalCount / itemsPerPage));
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    if (!borrowers || !Array.isArray(borrowers) || borrowers.length === 0) return;

    const filtered = borrowers.filter((borrower) => {
      // Only search non-date columns
      const matchesSearch = 
        // TUP ID column
        (borrower.tup_id?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        // Name column
        `${borrower.patron_fname ?? ''} ${borrower.patron_lname ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Book/s issued column
        (borrower.borrowed_book?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        // Course column
        (borrower.course?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        // Status column
        (borrower.status?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());

      // Date range filtering using the approach from the first code
      const isDateInRange = (date) => {
        if (!date) return false;
        const parsedDate = new Date(date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        // Set the time to midnight for proper date comparison
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        parsedDate.setHours(12, 0, 0, 0);
        
        return (!start || parsedDate >= start) && (!end || parsedDate <= end);
      };

      // Check if any of the date fields match the date range
      const dateMatches = 
        isDateInRange(borrower.checkout_date) || 
        isDateInRange(borrower.checkout_due) || 
        isDateInRange(borrower.checkin_date);

      // If both search term and dates are provided, both should match
      // If only search term is provided, only search term should match
      // If only dates are provided, only dates should match
      // If nothing is provided, return all results
      if (searchTerm && (startDate || endDate)) {
        return matchesSearch && dateMatches;
      } else if (searchTerm) {
        return matchesSearch;
      } else if (startDate || endDate) {
        return dateMatches;
      }
      return true;
    });

    setFilteredBorrowers(filtered);
  };

  const handleActionClick = (action) => {
    localStorage.setItem('clickedAction', action);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return; // Prevent going out of bounds
    setCurrentPage(newPage);
  };

  const clearFilter = () => {
    setQuery('any'); // Reset query filter
    setSearchTerm(''); // Clear search term
    setCurrentPage(1); // Reset pagination to first page
    setStartDate('');
    setEndDate('');
    getBorrowers(); // Refetch the borrower data
  };

  return (
    <div className="circulation-container bg-light">
      <h1>Book Circulation</h1>

      {/* Check-in buttons */}
      <div className="buttons">
        <Link to="/circulation/patron">
          <button className="btn checkin-btn" onClick={() => handleActionClick('Check Out')}>
            <FontAwesomeIcon icon={faCartShopping} className="fs-1" />
            <span>Borrow</span>
          </button>
        </Link>
        <Link to="/circulation/patron">
          <button className="btn checkin-btn" onClick={() => handleActionClick('Check In')}>
            <FontAwesomeIcon icon={faCartPlus} className="fs-1" />
            <span>Return</span>
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="search-container d-flex justify-content-between">
        <div className="input-group w-50 z-0">
          <input
            type="text"
            className="search-bar form-control shadow-sm"
            placeholder="Search by ID, name, book, or course"
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <button className="btn search-btn" onClick={search}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <select className="form-select dropdown" onChange={(e) => setQuery(e.target.value)}>
          <option value="any">Any</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      
      {/* Date Range Row */}
      <div className="date-filter d-flex align-items-center flex-wrap w-50">
        <div className="d-flex align-items-center flex-grow-1 gap-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-muted" />
            </span>
            <input
              type="date"
              className="form-control border-start-0"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <span className="text-muted">to</span>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-muted" />
            </span>
            <input
              type="date"
              className="form-control border-start-0"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <button 
          className="btn btn-warning ms-2 d-flex align-items-center" 
          onClick={clearFilter}
        >
          {/* <FontAwesomeIcon icon={faTimes} className="me-2" /> */}
          Clear Filters
        </button>
      </div>

      <div className="table-box">
        <h2>Recent transactions</h2>
        {/* Table */}
        <table className="circ-table">
          <thead>
            <tr>
              <td>TUP ID</td>
              <td>Name</td>
              <td>Book/s issued</td>
              <td>Author/s</td>
              <td>Borrow Date</td>
              <td>Due Date</td>
              <td>Return Date</td>
              <td>Status</td>
            </tr>
          </thead>
          <tbody>
            {filteredBorrowers.length > 0 ? (
              filteredBorrowers.map((borrower, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }} className='col'>{borrower.tup_id}</td>
                  <td style={{ padding: '10px' }} className='col'>
                    {borrower.patron_fname} {borrower.patron_lname}
                  </td>
                  <td style={{ padding: '10px' }} onClick={() => navigate(`/catalog/view/${borrower.resource_id}`)} className="resource col-2">
                    {borrower.borrowed_book}
                  </td>
                  <td style={{ padding: '10px' }} className='col-3'>{borrower.authors}</td>
                  <td style={{ padding: '10px' }} className='col'>
                    {borrower.checkout_date ? new Date(borrower.checkout_date).toLocaleDateString('en-CA') : 'N/A'}
                  </td>
                  <td style={{ padding: '10px' }} className='col'>
                    {borrower.checkout_due ? new Date(borrower.checkout_due).toLocaleDateString('en-CA') : 'N/A'}
                  </td>
                  <td style={{ padding: '10px' }} className='col'>
                    {borrower.checkin_date
                      ? new Date(borrower.checkin_date).toLocaleDateString('en-CA')
                      : 'Not Yet Returned'}
                  </td>
                  <td style={{ padding: '10px' }} className='col'>
                    <span
                      className={` text-light p-2 rounded fw-semibold
                        ${borrower.status === 'overdue'
                          ? 'bg-danger'
                          : borrower.status === 'returned'
                          ? 'bg-success'
                          : 'bg-primary'}
                      `}
                    >
                      {borrower.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  <div className="spinner-box">
                    <div className="spinner-grow text-danger" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="8" className="no-data-box text-center">
                  <div className="d-flex flex-column align-items-center my-5">
                    <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
                    <span className='fw-semibold mt-2 m-0'>No records found.</span>
                    <span className='m-0'>Please try a different search.</span>
                    <button className='btn btn-warning mt-2' onClick={clearFilter}>Clear filter</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Page {currentPage} of {totalPages}</span>
        <div className="buttons">
          <button
            className="btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button
            className="btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Circulation;