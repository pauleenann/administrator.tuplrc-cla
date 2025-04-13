import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Circulation.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faCartShopping, faSearch,faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Circulation = () => {
  const location = useLocation();
  const [borrowers, setBorrowers] = useState([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Borrowed');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate()
  let query;
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    query = params.get('filter');
        
    getBorrowers();
    localStorage.removeItem('clickedAction');
    localStorage.removeItem('selectedItems');

  }, [currentPage]);

  useEffect(()=>{
    if(searchTerm==''){
      getBorrowers();
    }
  },[searchTerm])

  const getBorrowers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/patron/borrowers`, {
        params: { page: currentPage, limit: itemsPerPage, query:  query}
      });

      setBorrowers(response.data.data);
      setFilteredBorrowers(response.data.data); // You can filter the data here if needed

      // Assuming you get the total number of items, set the totalPages
      // Update this based on your backend's response (you may need to modify the backend)
      //setTotalPages(10); // Set this dynamically after modifying backend
      setTotalPages(Math.ceil(response.data.totalCount / itemsPerPage));
      console.log(response);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleActionClick = (action) => {
    localStorage.setItem('clickedAction', action);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value); 
  };

  const search = ()=>{
    if (!borrowers || !Array.isArray(borrowers)) return;

    const filtered = borrowers.filter((borrower) => {
        const fullName = `${borrower.patron_fname ?? ''} ${borrower.patron_lname ?? ''}`.toLowerCase();
        
        return (
            (fullName.includes(searchTerm) ||
            (borrower.tup_id?.toLowerCase() ?? '').includes(searchTerm) ||
            (borrower.course?.toLowerCase() ?? '').includes(searchTerm) ||
            (borrower.borrowed_books?.toLowerCase() ?? '').includes(searchTerm))
        );
    });
    setFilteredBorrowers(filtered);
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return; // Prevent going out of bounds
    setCurrentPage(newPage);
  };

  useEffect(()=>{
    const borrowersByCategory = borrowers.filter(item=>item.status==selectedFilter)
    setFilteredBorrowers(borrowersByCategory)
  },[selectedFilter])

  console.log(filteredBorrowers)
  

  return (
    <div className="circulation-container">
      <h1>Circulation</h1>

      {/* Check-in buttons */}
      <div className="buttons">
      <Link to='/circulation/patron'>
          <button
            className='btn checkin-btn'
            onClick={() => handleActionClick('Check Out')}
          >
            <FontAwesomeIcon icon={faCartShopping} className='icon' />
            <span>Check out</span>
          </button>
        </Link>
        <Link to='/circulation/patron'>
          <button
            className='btn checkin-btn'
            onClick={() => handleActionClick('Check In')}
          >
            <FontAwesomeIcon icon={faCartPlus} className='icon' />
            <span>Check in</span>
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="search-container d-flex justify-content-between">
        <div className='d-flex gap-2'>
          <input
            type="text"
            className="search-bar"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={(e)=>e.key=='Enter'&&search()}
          />
          <button className="btn search-btn" onClick={search}>
            <FontAwesomeIcon icon={faSearch} className='icon'/> 
          </button>
        </div>
        <select className="form-select dropdown" onClick={(e)=>setSelectedFilter(e.target.value)}>
            <option value="borrowed">Borrowed</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
        </select>
      </div>

      <div>
        <h2>Recent transactions</h2>
        {/* Table */}
        <table className="circ-table">
          <thead>
            <tr>
              <td>TUP ID</td>
              <td>Name</td>
              {/* <td>No. of book/s issued</td> */}
              <td>Book/s issued</td>
              <td>Course</td>
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
                  <td style={{ padding: '10px' }}>{borrower.tup_id}</td>
                  <td style={{ padding: '10px' }}>
                    {borrower.patron_fname} {borrower.patron_lname}
                  </td>
                  <td style={{ padding: '10px' }} onClick={()=>navigate(`/catalog/view/${borrower.resource_id}`)} className='resource'> {borrower.borrowed_book} </td>
                  <td style={{ padding: '10px' }}>{borrower.course}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(borrower.checkout_date).toLocaleDateString('en-CA')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {new Date(borrower.checkout_due).toLocaleDateString('en-CA')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {borrower.checkin_date
                      ? new Date(borrower.checkin_date).toLocaleDateString('en-CA')
                      : "Not Yet Returned"}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className={borrower.status=='overdue'?'overdue':borrower.status=='returned'?'returned':'borrowed'}>{borrower.status}</span>
                    
                  </td>
                </tr>
              ))
            ) : filteredBorrowers.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '10px' }}>
                  No records found...
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  <div className="spinner-box">
                    <div className="spinner-grow text-danger" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
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
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
          </button>
          <button
            className="btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faArrowRight} className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Circulation;
