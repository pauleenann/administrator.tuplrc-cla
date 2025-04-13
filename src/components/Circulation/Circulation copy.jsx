import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Circulation.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faCartShopping, faL,faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Circulation = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false)

  
  useEffect(() => {
    getBorrowers();
    localStorage.removeItem('clickedAction');
    localStorage.removeItem('selectedItems');

  }, []);

  const getBorrowers = async () => {
    setLoading(true)
    try {
      const response = await axios
        .get(`http://localhost:3001/getCirculation`)
        .then((res) => res.data);
      setBorrowers(response);
      setFilteredBorrowers(response); 
      console.log(response);
    } catch (err) {
      console.log(err.message);
    }finally{
      setLoading(false)
    }
  };

  const handleActionClick = (action) => {
    localStorage.setItem('clickedAction', action);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value); 

    if (!borrowers || !Array.isArray(borrowers)) return;

    const filtered = borrowers.filter((borrower) => {
        const fullName = `${borrower.patron_fname ?? ''} ${borrower.patron_lname ?? ''}`.toLowerCase();
        
        return (
            fullName.includes(value) ||
            (borrower.tup_id?.toLowerCase() ?? '').includes(value) ||
            (borrower.course?.toLowerCase() ?? '').includes(value) ||
            (borrower.borrowed_books?.toLowerCase() ?? '').includes(value)
        );
    });
    setFilteredBorrowers(filtered);
  };


  

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
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="btn search-btn">Search</button>
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
                  {/* <td style={{ padding: '10px' }}>{borrower.total_checkouts}</td> */}
                  <td style={{ padding: '10px' }}>{borrower.borrowed_book}</td>
                  <td style={{ padding: '10px' }}>{borrower.course}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(borrower.checkout_date).toLocaleDateString('en-CA')}
                  </td>
                  <td style={{ padding: '10px' }}>{borrower.status}</td>
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


      {/* Pagination */}
      <div className="pagination">
        <span>Page 1 of 1</span>
        <div className="buttons">
          <button className="btn"><FontAwesomeIcon icon={faArrowLeft} className='icon'/></button>
          <button className="btn"><FontAwesomeIcon icon={faArrowRight} className='icon'/></button>
        </div>
      </div>
    </div>
  );
};

export default Circulation;
