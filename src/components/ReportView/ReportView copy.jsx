import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import './ReportView.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faX } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import * as XLSX from 'xlsx';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

const ReportView = ({open, close, id}) => {
  const [report, setReport] = useState([]);
  const [generatedReport, setGeneratedReport] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (id) {
      getReport();
    }
  }, [id]);
  
  useEffect(() => {
    if (report && Object.keys(report).length > 0) {
      generateReport();
    }
  }, [report]);
  
  const getReport = async() => {
    try {
        const response = await axios.get(`http://localhost:3001/api/reports/${id}`);
        console.log(response.data);
        
        // Convert dates to local timezone in the report data
        const processedData = response.data.map(item => ({
          ...item,
          report_start_date: item.report_start_date 
            ? dayjs.utc(item.report_start_date).local().format("YYYY-MM-DD") 
            : dayjs().format("YYYY-MM-DD"), // Default to today if null
          report_end_date: item.report_end_date 
            ? dayjs.utc(item.report_end_date).local().format("YYYY-MM-DD") 
            : dayjs().format("YYYY-MM-DD"), // Default to today if null
          // Format created_at for display
          created_at: item.created_at 
            ? dayjs.utc(item.created_at).local().format("MMM DD, YYYY HH:mm A")
            : dayjs().format("MMM DD, YYYY HH:mm A")
        }));
        
        setReport(processedData);
    } catch (error) {
        console.log('Cannot fetch details. ', error);
    }
  };

  const generateReport = async () => {
    console.log('generating report');
    try {
      const reportParams = { ...report[0] };
      
      const response = await axios.get(`http://localhost:3001/api/reports/generate-report`, {
        params: reportParams, // Sending report as query params
      });
      console.log(response);
      
      // Process any date fields in the response data
      const processedReportData = response.data.map(row => {
        const processedRow = { ...row };
        
        // Look for date fields and convert them
        Object.keys(processedRow).forEach(key => {
          // Check if the field contains a date string (simple check for ISO format)
          if (typeof processedRow[key] === 'string' && 
              (processedRow[key].includes('T') && processedRow[key].includes('Z') || 
               processedRow[key].match(/^\d{4}-\d{2}-\d{2}$/))) {
            // Convert UTC date to local timezone
            processedRow[key] = dayjs.utc(processedRow[key]).local().format("YYYY-MM-DD HH:mm:ss");
          }
        });
        
        return processedRow;
      });
      
      setGeneratedReport(processedReportData);
    } catch (error) {
      console.log('Cannot fetch generated report.', error);
    }
  };

  // Function to export data as XLSX
  const exportToExcel = () => {
    if (generatedReport.length === 0) {
      console.log('No data to export');
      return;
    }

    try {
      setExporting(true);
      
      // Get report name for the file
      const reportName = report.length > 0 ? report[0].report_name : 'report';
      const sanitizedReportName = reportName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      // Prepare metadata for the report
      const metadata = [];
      if (report.length > 0) {
        const reportData = report[0];
        metadata.push(
          ['Report Name', reportData.report_name],
          ['Description', reportData.report_description],
          ['Category', reportData.cat_name],
          ['Detail', reportData.detail_name],
          ['Start Date', reportData.report_start_date],
          ['End Date', reportData.report_end_date],
          ['Generated At', dayjs().format("YYYY-MM-DD HH:mm:ss")],
          ['', ''], // Empty row as separator
        );
      }
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create metadata worksheet
      const metadataSheet = XLSX.utils.aoa_to_sheet(metadata);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Report Info');
      
      // Convert data to worksheet
      const dataSheet = XLSX.utils.json_to_sheet(generatedReport);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');
      
      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `${sanitizedReportName}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
      
      console.log('Export successful');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  console.log(generatedReport);

  if(!open){
    return null
  }

  return ReactDom.createPortal(
    <div className='reports-view-container'>
      {/* overlay */}
      <div className="reports-view-overlay"></div>

      {/* Modal Box */}
      <div className="reports-view-box">
        <div className="header w-100 d-flex justify-content-between align-items-center p-0">
          <span className='fw-semibold'>Generated Report</span>
          <button className="btn" onClick={close}>
            <FontAwesomeIcon icon={faX} className='icon' />
          </button>
        </div>
        {generatedReport.length > 0 ? (
          <div className="body">
            {/* details */}
            {report.map((item, index) => (
              <div className="details" key={item.id || index}>
                <div className="row">
                  <div className="col-2 fw-semibold">Report name:</div>
                  <div className="col-10">{item.report_name}</div>

                  <div className="col-2 fw-semibold">Report description:</div>
                  <div className="col-10">{item.report_description}</div>

                  <div className="col-2 fw-semibold">Report category:</div>
                  <div className="col-10">{item.cat_name}</div>

                  <div className="col-2 fw-semibold">Report detail:</div>
                  <div className="col-10">{item.detail_name}</div>
                  
                  {item.cat_name !== 'inventory' && item.cat_name !== 'patron' && item.detail_name !=='most borrowed books' && item.detail_name !== 'least borrowed books' &&(
                    <>
                      <div className="col-2 fw-semibold">Report start date:</div>
                      <div className="col-10">{item.report_start_date || 'N/A'}</div>

                      <div className="col-2 fw-semibold">Report end date:</div>
                      <div className="col-10">{item.report_end_date || 'N/A'}</div>
                    </>
                  )}
                  <div className="col-2 fw-semibold">Report created at:</div>
                  <div className="col-10">{item.created_at}</div>
                </div>
              </div>
            ))}
            
            <button 
              className="btn d-flex align-items-center gap-2 export-btn mt-3"
              onClick={exportToExcel}
              disabled={exporting || generatedReport.length === 0}
            >
              <FontAwesomeIcon icon={faDownload} className='icon'/>
              <span className='m-0 '>{exporting ? 'Exporting...' : 'Export to Excel'}</span>
            </button>
            
            <table>
              <thead>
                <tr>
                  {Object.keys(generatedReport[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {generatedReport.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        ) : (
          <p>No report data available.</p>
        )}
      </div>     
    </div>,
    document.getElementById('portal')
  )
}

export default ReportView