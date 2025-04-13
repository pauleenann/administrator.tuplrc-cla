import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './Logbook.css'
import search from '../../assets/Management System/logbook/search.svg'
import exportIcon from '../../assets/Management System/logbook/export.svg'
import left from '../../assets/Management System/logbook/arrow-left-red.svg'
import right from '../../assets/Management System/logbook/arrow-right-red.svg'
import * as XLSX from 'xlsx'; // Import xlsx for Excel export

const Logbook = () => {
    const [patron, setPatron] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(()=>{
        getPatron()
        
      },[currentPage, entriesPerPage])

    const getPatron = async()=>{
        try {
            const params = {
                search: searchInput,
                startDate,
                endDate,
                limit: entriesPerPage,
                
            };
          const query = new URLSearchParams(params).toString();
          const response = await axios.get(`http://localhost:3001/patronSort?${query}`).then(res=>res.data);
          setPatron(response)
          
          console.log(response)
        } catch (err) {
            console.log(err.message);
        }
      }
       
    
    const handleClear = () => {
        setSearchInput('');
        setStartDate('');
        setEndDate('');
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
            'Number': index + 1,
            'TUP ID': item.tup_id,
            'First Name': item.patron_fname,
            'Last Name': item.patron_lname,
            'Gender': item.patron_sex,
            'Phone No.': item.patron_mobile,
            'Email' : item.patron_email,
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

    
  return (
    <div className='logbook-container'>
        <h1>Logbook</h1>

        {/* search bar and export button */}
        <div className="search-export">
            {/* search bar */}
            <div class="d-flex " role="search">
                  <input class="form-control me-2 log-search-bar" type="search" placeholder="Enter Student ID or Student Name" aria-label="Search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}/>
                  <button class="btn log-search-button" onClick={getPatron}><img src={search} alt="" />
                  Search</button>
            </div>
            {/* export button */}
            <button className='btn logbook-export-button' onClick={exportToExcel}>
                <img src={exportIcon} alt="" />
                Export
            </button>
        </div>

        {/* logbook filters */}
        <div className="logbook-filters">
            {/* logbook entries per page */}
            <div className="logbook-entries-page">
                <label htmlFor="entries">Entries per page</label>
                <select
                    className="form-select"
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                </select>
            </div>

            {/* date filter */}
            <div className="logbook-date-filter">
                <label htmlFor="" >Date Filter</label>
                <input type="date" className='logbook-filter-date' value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
                <p>to</p>
                <input type="date" className='logbook-filter-date' value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
                <button className='btn logbook-go-button' onClick={getPatron}>Go</button>
                <button className='btn logbook-clear-button' onClick={handleClear}>Clear</button>
            </div>
        </div>

        {/* logbook table */}
        <div className='logbook-table-box'>
            <table className='logbook-table'>
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>TUP ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Gender</th>
                        <th>Phone No.</th>
                        <th>Course</th>
                        <th>College</th>
                        <th>Date</th>
                        <th>Time in</th>
                    </tr>
                </thead>

                <tbody>
                    {patron?patron.length>0?patron.map((item,key)=>(
                    <tr key={key}>
                        <td>{key + 1}</td>
                        <td>{item.tup_id}</td>
                        <td>{item.patron_fname}</td>
                        <td>{item.patron_lname}</td>
                        <td>{item.patron_sex}</td>
                        <td>{item.patron_mobile}</td>
                        <td>{item.course}</td>
                        <td>{item.college}</td>
                        <td>{new Date(item.att_date).toLocaleDateString("en-CA")}</td>
                        <td>{item.att_log_in_time}</td>
                        
                    </tr> )):
                        <tr>
                            <td colSpan="7">No records available</td> 
                        </tr>:''}
                </tbody>


            </table>
        </div>

        {/* logbook table pagination */}
        <div className="logbook-table-pagination">
            <div className="logbook-table-entries">
                Showing <span className='logbook-current-entry'>5</span> of <span className='logbook-total-entry'>10</span> Entries
            </div>
            <div className="logbook-table-button-pagination">
                <img src={left}alt="" />
                <div className='logbook-pages'>
                    <div className='logbook-pages-current'>2</div>
                    <div className='logbook-pages-not-current'>1</div>
                </div>
                <img src={right}alt="" />
            </div>
        </div>

        

             
            
      
    </div>
  )
}

export default Logbook
