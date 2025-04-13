import React, { useEffect, useState } from 'react';
import './Reports.css';
import axios from 'axios';
import Loading from '../Loading/Loading'
import * as XLSX from 'xlsx'; // Import xlsx for Excel export
import dayjs from 'dayjs'

const Reports = () => {
  const reportType = [
    'Attendance Report',
    'Circulation Report',
    'Inventory Report'
  ];

  const subOptions = {
    'Attendance Report': ['Daily Report', 'Monthly Report', 'Custom Date'],
    'Circulation Report': ['Daily Report','Monthly Report','Custom Date','Borrowed Resources'],
    'Inventory Report': ['All Resources', 'Book', 'Journals', 'Thesis & Dissertations', 'Newsletters', 'Available Resources', 'Lost Resources', 'Damaged Resources'],
  };

  const [selectedType, setSelectedType] = useState({
    type: '',
    kind: '',
  });
  const [customDate, setCustomDate] = useState({
    startDate: '',
    endDate: '',
  });
  const [generatedReport,setGeneratedReport] = useState([])
  const [loading, setLoading] = useState(false)

  // Reset kind when type changes
  useEffect(() => {
    setSelectedType((prevSelected) => ({
      ...prevSelected,
      kind: '',
    }));
  }, [selectedType.type]);

  const handleSelectedFilter = (e) => {
    const { name, value } = e.target;
    setSelectedType((prevSelected) => ({
      ...prevSelected,
      [name]: value,
    }));
  };

  const handleCustomDateChange = (e) => {
    const { id, value } = e.target;
    setCustomDate((prevCustomDate) => ({
      ...prevCustomDate,
      [id]: value,
    }));
  };

  const handleClear = () => {
    setSelectedType({
      type: '',
      kind: '',
    });
    setCustomDate({
      startDate: '',
      endDate: '',
    });
  };

  const handleGenerate = async () => {
    console.log('Generating report...');
    setLoading(true)
    try {
      const params = {
        type: selectedType.type,
        kind: selectedType.kind,
        ...(selectedType.kind === 'Custom Date' && {
          startDate: customDate.startDate,
          endDate: customDate.endDate,
        }),
      };
      
      const response = await axios.get('http://localhost:3001/api/reports', { params });
      console.log(response.data);  // Handle response here
      setGeneratedReport(response.data)
    } catch (error) {
      console.error('Error generating report:', error);
    }finally{
      setLoading(false)
    }
  };

  const exportToExcel = () => {
    // Check if the report data exists
    if (generatedReport.length === 0) {
      console.error('No data to export');
      return;
    }
  
    // Prepare the headers dynamically based on the report data
    const headers = Object.keys(generatedReport[0]);
  
    // Format the data for Excel export
    const data = generatedReport.map((item, index) => {
      const formattedItem = {};
      Object.keys(item).forEach((key) => {
        formattedItem[key.replace(/_/g, ' ')] = item[key];
      });
      return formattedItem;
    });
  
    // Create a worksheet and a workbook
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
    // Export to Excel file
    XLSX.writeFile(workbook, `${selectedType.type}-${selectedType.kind}.xlsx`);
  };

  return (
    <div className="reports-container">
      <h1>Reports</h1>
      {/* Reports Summary */}
      <div className="reports-summary">
        <h4>Generate Reports</h4>

        {/* Type of Report */}
        <div className="report-type">
          <label htmlFor="report-type mb-1">Type of Report</label>
          <select
            name="type"
            id="report-type"
            defaultValue=""
            onChange={handleSelectedFilter}
          >
            <option value="" disabled>
              Select a type
            </option>
            {reportType.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Display Based on Selected Type */}
        {selectedType.type && subOptions[selectedType.type] && (
          <div className="sub-options">
            <label htmlFor="sub-option mb-1">Report Detail</label>
            <select
              name="kind"
              id="sub-option"
              onChange={handleSelectedFilter}
              value={selectedType.kind}
            >
              <option value="" disabled>
                Select a detail
              </option>
              {subOptions[selectedType.type].map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Date Range */}
        {selectedType.kind === 'Custom Date' && (
          <div className="custom">
            <input
              type="date"
              id="startDate"
              value={customDate.startDate}
              onChange={handleCustomDateChange}
            />
            <span>to</span>
            <input
              type="date"
              id="endDate"
              value={customDate.endDate}
              onChange={handleCustomDateChange}
            />
          </div>
        )}

        <div className="buttons">
          <button
            className="btn clear-btn"
            disabled={!selectedType.type}
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            className="btn generate-report"
            onClick={handleGenerate}
            disabled={!selectedType.type || !selectedType.kind}
          >
            Generate Report
          </button>
        </div>

        {/* display generated report */}
        {generatedReport.length > 0 ? (
        <div className="report">
          <table>
            <thead>
              <tr>
                {Object.keys(generatedReport[0]).map((key, index) => (
                  <td key={index}>{key}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {generatedReport.map((item, index) => (
                <tr key={index}>
                  {Object.keys(item).map((key, index) => {
                    const value = item[key];
                    const isDate = dayjs(value).isValid() && isNaN(value); // Ensure it's not a number

                    return (
                      <td key={index}>
                        {isDate ? dayjs(value).format("DD/MM/YYYY") : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available</p>
      )}

      {generatedReport.length>0?
      <div className="d-flex"><button className='btn export-report' onClick={exportToExcel}>Export</button></div>:''}

        
      </div>
      <Loading loading={loading}/>
    </div>
  );
};

export default Reports;
