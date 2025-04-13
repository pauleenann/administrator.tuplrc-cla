import React, { useEffect, useState } from 'react';
import './Reports.css';
import axios from 'axios';
import Loading from '../Loading/Loading';
import * as XLSX from 'xlsx'; // Import xlsx for Excel export
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faArrowUpWideShort, faDownload, faEye, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

const Reports = () => {
  

  return (
    <div className="reports-container">
      <h1>Reports</h1>

      <div className='d-flex flex-column gap-3'>
        {/* search bar, and sort and create */}
        <div className='d-flex justify-content-between mt-4'>
          {/* search bar */}
          <div className='d-flex gap-2'>
            <input type="text" className='search-bar rounded ps-2'/>
            <button className='btn search-btn'>
              <FontAwesomeIcon icon={faSearch} className='icon'/>
            </button>
          </div>
          {/* sort and create report */}
          <div className='d-flex gap-2'>
            <button className='btn sort-btn'>
              <FontAwesomeIcon icon={faArrowUpWideShort} className='icon'/>
            </button>
            <button className='btn create-btn d-flex gap-3 align-items-center'>
              <FontAwesomeIcon icon={faPlus} className='icon'/>
              Create new report
            </button>
          </div>
        </div>

        {/* header */}
        <div className='header m-0 p-0 row d-flex align-items-center text-center justify-content-center rounded text-light'>
          <div className='col-3'>Report Name</div>
          <div className='col-3'>Report Description</div>
          <div className='col-3'>Created on</div>
          <div className='col-3'>Actions</div>
        </div>

        {/* data */}
        <div className='m-0 p-0 d-flex align-items-center text-center row rounded data'>
          <div className='col-3'>Attendance</div>
          <div className='col-3'>Attendance from Jan 21 - Jan 23</div>
          <div className='col-3'>2025-03-11</div>
          <div className='col-3'>
            <button className="btn download-btn">
              <FontAwesomeIcon icon={faDownload} className='icon'/>
            </button>
            <button className="btn eye-btn">
              <FontAwesomeIcon icon={faEye} className='icon'/>
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Reports;
