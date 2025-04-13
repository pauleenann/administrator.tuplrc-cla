import React, { useEffect, useState } from 'react';
import './Reports.css';
import axios from 'axios';
import Loading from '../Loading/Loading';
import * as XLSX from 'xlsx'; // Import xlsx for Excel export
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const Reports = () => {
  const reportType = ['Attendance Report', 'Circulation Report', 'Inventory Report'];
  const subOptions = {
    'Attendance Report': ['Daily Report', 'Monthly Report', 'Custom Date'],
    'Circulation Report': ['Daily Report', 'Monthly Report', 'Custom Date'],
    'Inventory Report': ['All Resources', 'Book', 'Journals', 'Thesis & Dissertations', 'Newsletters', 'Available Resources', 'Lost Resources', 'Damaged Resources'],
  };

  const [selectedType, setSelectedType] = useState({ type: '', kind: '' });
  const [customDate, setCustomDate] = useState({ startDate: '', endDate: '' });
  const [isNoData, setIsNoData] = useState(false)
  const [generatedReport, setGeneratedReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setSelectedType((prevSelected) => ({ ...prevSelected, kind: '' }));
  }, [selectedType.type]);

  const handleSelectedFilter = (e) => {
    const { name, value } = e.target;
    setSelectedType((prevSelected) => ({ ...prevSelected, [name]: value }));
  };

  const handleCustomDateChange = (e) => {
    const { id, value } = e.target;
    setCustomDate((prevCustomDate) => ({ ...prevCustomDate, [id]: value }));
  };

  const handleClear = () => {
    setSelectedType({ type: '', kind: '' });
    setCustomDate({ startDate: '', endDate: '' });
    setSearchQuery('');
    setGeneratedReport([])
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = {
        type: selectedType.type,
        kind: selectedType.kind,
        ...(selectedType.kind === 'Custom Date' && { startDate: customDate.startDate, endDate: customDate.endDate }),
      };
      const response = await axios.get('http://localhost:3001/api/reports', { params });
      if(response.data.length!=0){
        setIsNoData(false)
        setGeneratedReport(response.data);
      }else{
        setIsNoData(true);
        setGeneratedReport([])
      }
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (generatedReport.length === 0) {
      console.error('No data to export');
      return;
    }
    const headers = Object.keys(generatedReport[0]);
    const data = generatedReport.map((item) => {
      const formattedItem = {};
      Object.keys(item).forEach((key) => {
        formattedItem[key.replace(/_/g, ' ')] = item[key];
      });
      return formattedItem;
    });
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${selectedType.type}-${selectedType.kind}.xlsx`);
  };

  const filteredReport = generatedReport.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const paginatedReport = filteredReport.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);

  return (
    <div className="reports-container">
      <h1>Reports</h1>

      <div className="reports-summary">
        <h4>Generate Reports</h4>

        <div className='report-choices'>
          <div className="report-type">
            <label>Type of Report</label>
            <select name="type" onChange={handleSelectedFilter} value={selectedType.type}>
              <option value="" disabled>Select a type</option>
              {reportType.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {selectedType.type && subOptions[selectedType.type] && (
            <div className="sub-options">
              <label>Report Detail</label>
              <select name="kind" onChange={handleSelectedFilter} value={selectedType.kind}>
                <option value="" disabled>Select a detail</option>
                {subOptions[selectedType.type].map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}

          {selectedType.kind === 'Custom Date' && (
            <div className="custom">
              <input type="date" id="startDate" value={customDate.startDate} onChange={handleCustomDateChange} />
              <span>to</span>
              <input type="date" id="endDate" value={customDate.endDate} onChange={handleCustomDateChange} />
            </div>
          )}
        </div>


        <div className="buttons">
          <button className="btn clear-btn" disabled={!selectedType.type} onClick={handleClear}>Clear</button>
          <button className="btn generate-report" onClick={handleGenerate} disabled={!selectedType.type || !selectedType.kind}>Generate Report</button>
        </div>
        
        {generatedReport.length > 0 && <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='search mt-4'/>}

        {generatedReport.length > 0 ? (
          <div >
            <table className="report">
              <thead>
                <tr>
                  {Object.keys(generatedReport[0]).map((key, index) => (<td key={index}>{key}</td>))}
                </tr>
              </thead>
              <tbody>
                {paginatedReport.map((item, index) => (
                  <tr key={index}>
                    {Object.keys(item).map((key, i) => (
                      <td key={i}>{dayjs(item[key]).isValid() && isNaN(item[key]) ? dayjs(item[key]).format("DD/MM/YYYY") : item[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span>Page {currentPage} of {totalPages}</span>
              <div className='buttons'>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className='btn'>
                  <FontAwesomeIcon icon={faArrowLeft} className='icon' />
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className='btn'>
                  <FontAwesomeIcon icon={faArrowRight} className='icon'/>
                </button>
              </div>
            </div>
          </div>
        ):isNoData?"No data available":''}

        {generatedReport.length > 0 && <button className='btn export-report' onClick={exportToExcel}>Export</button>}
      </div>

      <Loading loading={loading} />
    </div>
  );
};

export default Reports;
