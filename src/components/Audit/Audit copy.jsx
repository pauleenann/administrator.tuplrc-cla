import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Audit.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";

const Audit = () => {
  const [audit, setAudit] = useState([]); // Stores all audit data
  const [filteredAudit, setFilteredAudit] = useState([]); // Stores filtered data
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      setFilteredAudit(updatedAudit); // Display all data initially
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
      end.setHours(23, 59, 59, 999); // Set end date to the end of the day

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.action_timestamp);
        return itemDate >= start && itemDate <= end;
      });
    }

    setFilteredAudit(filtered);
  }, [selectedActivity, startDate, endDate, audit]);

  // Clear filters and show all data
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedActivity("");
    setFilteredAudit(audit);
  };

  // Function to export filtered data to CSV
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
        `"${item.new_value.replace(/[{}"]/g, "").replace(/,/g, ";")}"`, // Formatting description properly
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
    <div className="audit-container">
      <h1>User Activity Log</h1>

      {/* Filter by Activity */}
      <div className="filter-dropdown">
        <select
          className="form-select"
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
        >
          <option value="">Filter by activity</option>
          <option value="Added a new user">Insert User</option>
          <option value="Added a new resource">Insert Resource</option>
          <option value="Edited a resource">Update Resource</option>
          <option value="Added new patron"> Insert Patron</option>
          <option value="Edited a patron"> Edited Patron</option>
          <option value="borrowed a book">Borrowed Book</option>
          <option value="returned a book">Returned Book</option>
          <option value="Edited a user">Edited User</option>
          <option value="Logged In">Login</option>
          <option value="Logged Out">Logout</option>
        </select>
      </div>

      {/* Filter by Date and Export */}
      <div className="filter-date-export">
        <div className="filter-date">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="btn" onClick={clearFilters}>
            Clear
          </button>
        </div>
        <button className="btn export-btn" onClick={exportToCSV}>
          <FontAwesomeIcon icon={faFileExport} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="t-overflow table-bordered" style={{ height: "50vh", overflowY: "auto" }}>
        <table>
          <thead style={{ position: "sticky", zIndex: 10 }}>
            <tr>
              <td className="col-2 text-center">User</td>
              <td className="col-2 text-center">Action</td>
              <td className="col-6 text-center">Description</td>
              <td className="col-2 text-center">Timestamp</td>
            </tr>
          </thead>
          <tbody>
            {filteredAudit.length > 0 ? (
              filteredAudit.map((item, index) => (
                <tr key={index}>
                  <td className="col-2 text-center">{item.user_id}</td>
                  <td className="col-2 text-center">{item.action_type}</td>
                  <td className="col-6 text-start border-start border-end">
                    {item.new_value.replace(/[{}"]/g, "").replace(/,/g, "\n")}
                  </td>
                  <td className="col-2 text-center">{item.formatted_timestamp}</td>
                </tr>
              ))
            ) : !loading ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No records available
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
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
    </div>
  );
};

export default Audit;
