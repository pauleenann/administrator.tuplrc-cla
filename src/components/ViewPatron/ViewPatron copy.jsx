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
  

    console.log(logHistory)

  return (
    <div className='viewpatron-container'>
      <div className=''>
          <Link to={'/patron'}>
              <button className='view-patron-back-button btn'>
                <p className='m-0'>Back</p>
              </button>
          </Link>
      </div>
      {/* user profile */}
      <div className='d-flex flex-column gap-2 py-3'>
        <div>
          {patronLoading
          ?<div className='loadingName'></div>
          :<h1 className='m-0 fs-1'>{patron.patron_fname} {patron.patron_lname}</h1>}

          {patronLoading
          ?<div className='loadingID mt-2'></div>
          :<p  className='m-0 fs-3'>{patron.tup_id}</p>}
        </div>
        {patronLoading
        ?<div className='loadingInfo'></div>
        :<div className='row w-50 py-1'>
          <div className="col-2 fw-semibold">Category:</div>
          <div className='col-10'>{patron.category}</div>
          
          <div className="col-2 fw-semibold">Sex:</div>
          <div className="col-10">{patron.patron_sex}</div>

          <div className="col-2 fw-semibold">Email:</div>
          <div className="col-10">{patron.patron_email}</div>

          <div className="col-2 fw-semibold">Mobile:</div>
          <div className="col-10">{patron.patron_mobile}</div>

          <div className="col-2 fw-semibold">College:</div>
          <div className="col-10">{patron.college_name}</div>

          <div className="col-2 fw-semibold">Program:</div>
          <div className="col-10">{patron.course_name}</div>
        </div>}
        
      </div>

      <hr />

      {/* log history */}
      {logHistoryLoading
      ?<div className='loadingTable'></div>
      :<ViewPatronTable header={logHistoryHeader} title={'Log History'} data={logHistory} exportXLSX={exportLogHistory}/>}
      
      <hr />

      {/* Circulation history */}
      {circulationHistoryLoading
      ?<div className='loadingTable'></div>
      :<ViewPatronTable header={circulationHistoryHeader} title={'Circulation History'} data={circulationHistory} exportXLSX={exportCirculationHistory}/>}
      
    </div>
  )
}

export default ViewPatron
