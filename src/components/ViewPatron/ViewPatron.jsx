import React, { useEffect, useState } from 'react'
import './ViewPatron.css'
import { Link, useParams } from 'react-router-dom'
import ViewPatronTable from '../ViewPatronTable/ViewPatronTable';
import axios from 'axios'
import * as XLSX from 'xlsx'; // Import xlsx for Excel export

const ViewPatron = () => {
  const logHistoryHeader = ['Date', 'Time in'];
  const circulationHistoryHeader = ['Book/s Issued','Borrow Date','Due Date','Return Date','Overdue Days']
  const {id} = useParams();

  const [patron, setPatron] = useState([]);
  const [patronLoading, setPatronLoading] = useState(false);
  
  const [logHistory, setLogHistory] = useState([]);
  const [logHistoryLoading, setLogHistoryLoading] = useState(false)

  const [circulationHistory, setCirculationHistory] = useState([]);
  const [circulationHistoryLoading, setCirculationHistoryLoading] = useState(false)

  useEffect(()=>{
    getPatron();
    getLogHistory();
    getCirculationHistory()
  },[])

  const getPatron = async ()=>{
    setPatronLoading(true)
    axios.get(`http://localhost:3001/api/patron/${id}`) 
      .then((response) => {
         setPatron(response.data[0]);
      })
      .catch((error) => {
        console.error('Error fetching patron data:', error);
      }).finally(()=>{
        setTimeout(()=>{
          setPatronLoading(false)
        },3000)
      })
  }

  const getLogHistory = async ()=>{
    setLogHistoryLoading(true)
    axios.get(`http://localhost:3001/api/patron/log/${id}`) 
      .then((response) => {
         setLogHistory(response.data);
      })
      .catch((error) => {
        console.error('Error fetching patron data:', error);
      }).finally(()=>{
        setTimeout(()=>{
          setLogHistoryLoading(false)
        },3000)
      })
  }

  const getCirculationHistory = async ()=>{
    setCirculationHistoryLoading(true)
    axios.get(`http://localhost:3001/api/patron/circulation/${id}`) 
      .then((response) => {
         setCirculationHistory(response.data);
      })
      .catch((error) => {
        console.error('Error fetching patron data:', error);
      }).finally(()=>{
        setTimeout(()=>{
          setCirculationHistoryLoading(false)
        },3000)
      })
  }

  const exportLogHistory = () => {
    if (logHistory.length === 0) {
      console.error('No data to export');
      return;
    }
  
    const data = logHistory.map((item) => ({
      'Attendance Date': item.att_date,
      'Attendance Time': item.att_log_in_time
    }));
  
    // Create worksheet with correctly formatted data
    const worksheet = XLSX.utils.json_to_sheet(data);
  
    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Log History');
  
    // Generate filename based on patron's last name
    const fileName = `${patron?.patron_lname || 'Unknown'}-log_history.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportCirculationHistory = () => {
    if (circulationHistory.length === 0) {
      console.error('No data to export');
      return;
    }
  
    const data = circulationHistory.map((item) => ({
      'Book/s Issued': item.resource_title,
      'Borrowed Date': new Date(item.checkout_date).toLocaleDateString('en-CA'),
      'Due Date': new Date(item.checkout_due).toLocaleDateString('en-CA'),
      'Return Date': item.checkin_date==null
      ?'Not returned yet'
      :new Date(item.checkin_date).toLocaleDateString('en-CA'),
      'Overdue Days': item.overdue_days
    }));
  
    // Create worksheet with correctly formatted data
    const worksheet = XLSX.utils.json_to_sheet(data);
  
    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Circulation History');
  
    // Generate filename based on patron's last name
    const fileName = `${patron?.patron_lname || 'Unknown'}-circulation_history.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  
  return (
    <div className='viewpatron-container  bg-light'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <Link to={'/patron'}>
          <button className='view-patron-back-button btn '>
            Back
          </button>
        </Link>
        {!patronLoading && (
          <h5 className="text-muted">Patron ID: {patron.tup_id}</h5>
        )}
      </div>

      {/* Patron Profile Card */}
      <div className='card shadow-sm mb-4'>
        <div className='card-body p-5'>
          <div className='row'>
            {/* Left side - Profile Picture */}
            <div className='col-md-3 text-center mb-3 mb-md-0'>
              {patronLoading ? (
                <div className='loadingAvatar rounded-circle mx-auto'></div>
              ) : (
                <div className='patron-avatar rounded-circle d-flex justify-content-center align-items-center bg-primary text-white mx-auto' style={{width: '150px', height: '150px', fontSize: '3rem'}}>
                  {patron.patron_fname && patron.patron_lname ? 
                    `${patron.patron_fname.charAt(0)}${patron.patron_lname.charAt(0)}` : '??'}
                </div>
              )}
            </div>
            
            {/* Right side - Profile Info */}
            <div className='col-md-9'>
              {patronLoading ? (
                <>
                  <div className='loadingName mb-3'></div>
                  <div className='loadingInfo'></div>
                </>
              ) : (
                <>
                  <h1 className='card-title mb-3 fw-bold'>{patron.patron_fname} {patron.patron_lname}</h1>
                  
                  <div className='row g-3'>
                    <div className='col-md-6'>
                      <div className='patron-info-item'>
                        <span className='text-muted me-2'>Category:</span>
                        <span className='badge bg-primary'>{patron.category}</span>
                      </div>
                    </div>
                    
                    <div className='col-md-6'>
                      <div className='patron-info-item'>
                        <span className='text-muted me-2'>Sex:</span>
                        <span>{patron.patron_sex}</span>
                      </div>
                    </div>
                    
                    <div className='col-md-6'>
                      <div className='patron-info-item'>
                        <span className='text-muted me-2'>Email:</span>
                        <span>{patron.patron_email}</span>
                      </div>
                    </div>
                    
                    <div className='col-md-6'>
                      <div className='patron-info-item'>
                      <span className='text-muted me-2'>Mobile no.:</span>
                        <span>{patron.patron_mobile}</span>
                      </div>
                    </div>
                    
                    <div className='col-md-6'>
                      <div className='patron-info-item'>
                        <span className='text-muted me-2'>College:</span>
                        <span>{patron.college_name}</span>
                      </div>
                    </div>
                    
                    <div className='col-md-6'>
                      <div className='patron-info-item'>
                        <span className='text-muted me-2'>Program:</span>
                        <span>{patron.course_name}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Log History Table */}
      <div className='card mb-4 shadow-sm p-5'>
        <div className='card-body p-0'>
          {logHistoryLoading ? (
            <div className='loadingTable p-4'></div>
          ) : (
            <ViewPatronTable 
              header={logHistoryHeader} 
              title={'Log History'} 
              data={logHistory} 
              exportXLSX={exportLogHistory}
            />
          )}
        </div>
      </div>

      {/* Circulation History Table */}
      <div className='card shadow-sm p-5'>
        <div className='card-body p-0'>
          {circulationHistoryLoading ? (
            <div className='loadingTable p-4'></div>
          ) : (
            <ViewPatronTable 
              header={circulationHistoryHeader} 
              title={'Circulation History'} 
              data={circulationHistory} 
              exportXLSX={exportCirculationHistory}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewPatron