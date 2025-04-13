import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Audit.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport,faArrowRight, faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

const Audit = () => {
  const [audit, setAudit] = useState([]); // Stores all audit data
  const [filteredAudit, setFilteredAudit] = useState([]); // Stores filtered data
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Format timestamp function
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error("Error formatting timestamp:", timestamp, error);
      return "Invalid timestamp";
    }
  };

  // Fetch audit logs
  const getAudit = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/audit");
      const updatedAudit = response.data.map((item) => ({
        ...item,
        formatted_timestamp: formatTimestamp(item.action_timestamp),
      }));
      setAudit(updatedAudit);
      setFilteredAudit(updatedAudit);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching audit logs:", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAudit();
  }, []);

  // Apply filters when activity, start date, or end date changes
  useEffect(() => {
    let filtered = audit;

    if (selectedActivity) {
      filtered = filtered.filter((item) => item.new_value.includes(selectedActivity));
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.action_timestamp);
        return itemDate >= start && itemDate <= end;
      });
    }

    setFilteredAudit(filtered);
    setCurrentPage(1); // Reset to first page on new filter
  }, [selectedActivity, startDate, endDate, audit]);

  // Clear filters and reset pagination
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedActivity("");
    setFilteredAudit(audit);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAudit.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredAudit.slice(indexOfFirstRecord, indexOfLastRecord);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Export to CSV
  const exportToCSV = () => {
    if (filteredAudit.length === 0) {
      alert("No data to export.");
      return;
    }

    const header = ["User", "Action", "Description", "Timestamp"];
    const csvRows = [header.join(",")];

    filteredAudit.forEach((item) => {
      const row = [
        `"${item.user_id}"`,
        `"${item.action_type}"`,
        `"${item.new_value.replace(/[{}"]/g, "").replace(/,/g, ";")}"`,
        `"${item.formatted_timestamp}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "audit_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="audit-container bg-light">
      <h1>User Activity Log</h1>

      <div>
        {/* Filter Section */}
        <div className="w-50 mb-2">
          <select
            className="form-select shadow-sm"
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
          >
            <option value="">Filter by activity</option>
            <option value="Added a new user">Insert User</option>
            <option value="Added a new resource">Insert Resource</option>
            <option value="Edited a resource">Update Resource</option>
            <option value="Added new patron">Insert Patron</option>
            <option value="Edited a patron">Edited Patron</option>
            <option value="borrowed a book">Borrowed Book</option>
            <option value="returned a book">Returned Book</option>
            <option value="Edited a user">Edited User</option>
            <option value="Logged In">Login</option>
            <option value="Logged Out">Logout</option>
            
          </select>
        </div>

        {/* Date Filters & Export */}
        <div className="d-flex justify-content-between">
          <div className="d-flex align-items-center gap-1">
            <input type="date" className="shadow-sm form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span>to</span>
            <input type="date" className="shadow-sm form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button className="btn btn-warning w-100" onClick={clearFilters}>Clear filter</button>
          </div>
          <button className="btn export-btn btn-success d-flex align-items-center gap-2" onClick={exportToCSV}>
            <FontAwesomeIcon icon={faDownload}/>
            Export to Excel
          </button>
        </div>
      </div>
      

      {/* Table */}
      <div className="audit-table-box">
        <table className="audit-table">
          <thead>
            <tr>
              <td>User</td>
              <td>Action</td>
              <td>Description</td>
              <td>Timestamp</td>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((item, index) => (
                <tr key={index}>
                  <td>{item.user_id}</td>
                  <td>{item.action_type}</td>
                  <td>{item.new_value.replace(/[{}"]/g, "").replace(/,/g, "\n")}</td>
                  <td>{item.formatted_timestamp}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No records available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span> Page {currentPage} of {totalPages} </span>
        <div>
          <button className="btn" disabled={currentPage === 1} onClick={prevPage}>
            <FontAwesomeIcon icon={faArrowLeft}/>
          </button>
          <button className="btn" disabled={currentPage === totalPages} onClick={nextPage}>
            <FontAwesomeIcon icon={faArrowRight}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Audit;
