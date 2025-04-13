import React, { useEffect, useState } from 'react';
import './ReportsModal.css';
import ReactDom from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faDownload } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

// Use environment variables for API endpoints
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const ReportsModal = ({ open, close, onReportCreate }) => {
  const [generatedReport, setGeneratedReport] = useState([]);
  const [reportData, setReportData] = useState({
    name: '',
    description: '',
    category: '',
    cat_name: '',
    detail: '',
    detail_name:'',
    startDate: '',
    endDate: ''
  });
  const [staffId, setStaffId] = useState('');
  const [staffUname, setStaffUname] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [details, setDetails] = useState([]);
  const [showReportTable, setShowReportTable] = useState(false);

  useEffect(() => {
    if (open) {
      getCategories();
      getDetails();
      getUsername();
      setShowReportTable(false);
      setGeneratedReport([]);
    }
  }, [open]);

  useEffect(() => {
    // Reset date fields when detail changes
    if (reportData.detail) {
      const detailId = parseInt(reportData.detail);
      
      if (detailId === 1 || detailId === 18) {
        // Today's date for both start and end
        setReportData(prevData => ({
          ...prevData,
          startDate: dayjs().format('YYYY-MM-DD'),
          endDate: dayjs().format('YYYY-MM-DD')
        }));
      } else if (detailId === 2 || detailId === 19) {
        // Current month range
        setReportData(prevData => ({
          ...prevData,
          startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
          endDate: dayjs().endOf('month').format('YYYY-MM-DD')
        }));
      }
    }
  }, [reportData.detail]);

  useEffect(()=>{
    setReportData((prevdata)=>({
        ...prevdata,
        cat_name: categories.find(category => category.cat_id == reportData.category)?.cat_name || '',
        detail_name: details.find(detail => detail.detail_id == reportData.detail)?.detail_name || ''
    }))

  },[reportData.category, reportData.detail])

  const getUsername = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/check-session`, { withCredentials: true });
      if (response.data.loggedIn) {
        setStaffId(response.data.userID);
        setStaffUname(response.data.username);
      } else {
        setStaffId('');
        setStaffUname('');
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      setStaffId('');
      setStaffUname('');
    }
  };

  const getCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/reports/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Cannot fetch categories:', error);
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/reports/details`);
      setDetails(response.data);
    } catch (error) {
      console.error('Cannot fetch details:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If changing category, reset detail
    if (name === 'category') {
      setReportData({
        ...reportData,
        category: value,
        detail: ''
      });
      setShowReportTable(false);
    } else {
      setReportData({
        ...reportData,
        [name]: value
      });
      
      // Hide report table when changing inputs
      if (showReportTable) {
        setShowReportTable(false);
      }
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!reportData.name.trim()) {
      newErrors.name = 'Report name is required';
    }
    
    if (!reportData.description.trim()) {
      newErrors.description = 'Report description is required';
    }
    
    if (!reportData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!reportData.detail) {
      newErrors.detail = 'Please select a report detail';
    }
    
    const categoryId = parseInt(reportData.category);
    const detailId = parseInt(reportData.detail);
    const datesRequired = categoryId !== 3 && categoryId !== 4 && detailId !== 7 && detailId !== 8;
    
    if (!reportData.startDate && datesRequired) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!reportData.endDate && datesRequired) {
      newErrors.endDate = 'End date is required';
    } else if (reportData.startDate && reportData.endDate && new Date(reportData.endDate) < new Date(reportData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Format dates for API request
      const formattedStartDate = reportData.startDate ? dayjs(reportData.startDate).format('YYYY-MM-DD') : null;
      const formattedEndDate = reportData.endDate ? dayjs(reportData.endDate).format('YYYY-MM-DD') : null;
      
      // Prepare request payload
      const payload = {
        name: reportData.name,
        description: reportData.description,
        category_id: reportData.category,
        detail_id: reportData.detail,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        staff_id: staffId,
        staff_uname: staffUname
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/reports`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data) {
        resetForm();
        close();
        if (onReportCreate && typeof onReportCreate === 'function') {
          onReportCreate(response.data);
        } else {
          // If no callback is provided, reload the page as in the original code
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error processing report:', error);
      alert('Failed to process report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReportData({
      name: '',
      description: '',
      category: '',
      detail: '',
      startDate: '',
      endDate: ''
    });
    setErrors({});
    setGeneratedReport([]);
    setShowReportTable(false);
  };

  const handleCancel = () => {
    resetForm();
    close();
  };

  const generateReport = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const formattedStartDate = reportData.startDate ? dayjs(reportData.startDate).format('YYYY-MM-DD') : null;
      const formattedEndDate = reportData.endDate ? dayjs(reportData.endDate).format('YYYY-MM-DD') : null;
      
      const params = {
        ...reportData,
        report_start_date: formattedStartDate,
        report_end_date: formattedEndDate
      };
      
      const response = await axios.get(`http://localhost:3001/api/reports/generate-report`, {
        params: params,
      });

      console.log(response)
      
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
      setShowReportTable(true);
    } catch (error) {
      console.error('Cannot fetch generated report:', error);
      alert('Failed to generate report. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToExcel = () => {
    if (generatedReport.length === 0) return;
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(generatedReport);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, reportData.name || 'Report');
    
    // Generate filename with timestamp
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const filename = `${reportData.name || 'Report'}_${timestamp}.xlsx`;
    
    // Write and download
    XLSX.writeFile(wb, filename);
  };

  console.log(reportData)

  if (!open) {
    return null;
  }

  return ReactDom.createPortal(
    <div className='reports-modal-container'>
      {/* overlay */}
      <div className="reports-modal-overlay"></div>

      {/* modal box */}
      <div className="reports-modal-box">
        {/* header with close button - restored from commented code */}
        <div className="reports-modal-header d-flex justify-content-between align-items-center p-4">
          <h4 className="m-0">Generate Report</h4>
          <button 
            className="close-button border-0 bg-transparent" 
            onClick={handleCancel}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>
        
        {/* body */}
        <div className="body px-5 pb-5 d-flex flex-column gap-3">
          {/* report name */}
          <div className='d-flex flex-column'>
            <label htmlFor="reportName">Report name</label>
            <input 
              type="text" 
              id="reportName"
              name="name"
              value={reportData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error-input' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* report description */}
          <div className='d-flex flex-column'>
            <label htmlFor="reportDesc">Report description</label>
            <input 
              type="text" 
              id="reportDesc"
              name="description"
              value={reportData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error-input' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className='d-flex gap-3'>
            {/* report category */}
            <div className='d-flex flex-column w-100'>
                <label htmlFor="reportCategory">Report category</label>
                <select 
                name="category" 
                id="reportCategory"
                value={reportData.category}
                onChange={handleInputChange}
                className={errors.category ? 'error-input' : ''}
                >
                <option value="" disabled>Select a category</option>
                {categories.map(category => (
                    <option key={category.cat_id} value={category.cat_id}>
                    {category.cat_name}
                    </option>
                ))}
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            {/* report detail */}
            <div className='d-flex flex-column w-100'>
                <label htmlFor="reportDetail">Report detail</label>
                <select 
                name="detail" 
                id="reportDetail"
                value={reportData.detail}
                onChange={handleInputChange}
                disabled={!reportData.category}
                className={errors.detail ? 'error-input' : ''}
                >
                <option value="" disabled>Select a detail type</option>
                {reportData.category && details
                  .filter(detail => detail.cat_id == reportData.category)
                  .map(detail => (
                    <option key={detail.detail_id} value={detail.detail_id}>
                      {detail.detail_name}
                    </option>
                  ))
                }
                </select>
                {errors.detail && <span className="error-message">{errors.detail}</span>}
            </div>
          </div>

          {/* Only show date fields for categories other than 3 and 4 */}
          {reportData.category !== '3' && reportData.category !== '4' && reportData.detail !=='7' && reportData.detail !== '8' && (
            <div className='d-flex gap-3'>
              {/* start date */}
              <div className='d-flex flex-column w-100'>
                  <label htmlFor="startDate">Start date</label>
                  <input 
                  type="date" 
                  name="startDate" 
                  id="startDate"
                  value={reportData.startDate}
                  onChange={handleInputChange}
                  max={reportData.endDate || undefined}
                  className={errors.startDate ? 'error-input' : ''}
                  />
                  {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              {/* end date */}
              <div className='d-flex flex-column w-100'>
                  <label htmlFor="endDate">End date</label>
                  <input 
                  type="date" 
                  name="endDate" 
                  id="endDate"
                  value={reportData.endDate}
                  onChange={handleInputChange}
                  min={reportData.startDate || undefined}
                  className={errors.endDate ? 'error-input' : ''}
                  disabled={reportData.detail == '1' || reportData.detail == '2' || reportData.detail == '18' || reportData.detail == '19'}
                  />
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>
            </div>
          )}

          {/* buttons */}
          <div className='d-flex gap-2 justify-content-start buttons mt-3'>
            <button 
              type="button" 
              className="btn cancel-btn" 
              onClick={handleCancel}
              disabled={loading || isGenerating}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn save-btn"
              disabled={isGenerating}
              onClick={generateReport}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
            {showReportTable && generatedReport.length > 0 && (
              <button 
                type="submit" 
                className="btn save-btn ms-auto"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? 'Saving...' : 'Save Report'}
              </button>
            )}
          </div>
          
          <span className="file-format-info mt-2 text-muted small">
            * Generate a report to preview data, then save it or export to Excel
          </span>

          {/* Generated report table */}
          {showReportTable && generatedReport.length > 0 && (
            <div className="report-result mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Report Results</h5>
                <button 
                  className="btn btn-sm export-btn"
                  onClick={exportToExcel}
                >
                  <FontAwesomeIcon icon={faDownload} className="me-1" />
                  Export to Excel
                </button>
              </div>
              <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      {generatedReport.length > 0 && 
                        Object.keys(generatedReport[0]).map((key) => (
                          <th key={key}>{key.replace(/_/g, ' ')}</th>
                        ))
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReport.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex}>{value !== null ? value : '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
        </div>
      </div>      
    </div>,
    document.getElementById('portal')
  );
};

export default ReportsModal;