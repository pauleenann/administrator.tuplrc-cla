import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./AttendancePage.css"; // External CSS file for styles
// import Webcam from "react-webcam";

const AttendancePage = () => {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState(null);
  const [message, setMessage] = useState("");
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });  // e.g., "2024-12-16"
  const time = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Manila" });  // e.g., "14:30:00"
  const [lastScannedId, setLastScannedId] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(null);
  const searchInputRef = useRef(null); // Create a ref for the input
      
        useEffect(() => {
          searchInputRef.current?.focus(); // Automatically focus on mount
        }, []);

  // Handle input change
  const handleInputChange = (e) => {
    setStudentId(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!studentId) {
      setMessage("Please enter a student ID.");
      return;
    }
    
    const currentTime = Date.now(); // Get the current timestamp

    // Check if the student ID was scanned recently
    if (lastScannedId === studentId && lastScanTime && currentTime - lastScanTime < 5000) {
        setMessage("This student ID was scanned recently. Please wait a few seconds.");
        setStudentId("")
        return;
    }

    // Update the last scanned ID and time
    setLastScannedId(studentId);
    setLastScanTime(currentTime);


    try {
      console.log(date, time, studentId);
      // Fetch student name and log attendance
      const response = await axios.post(`http://localhost:3001/api/attendance`, { studentId, date, time }, { headers: { "Content-Type": "application/json" }});
      console.log(response.message)
      if (response.data.success) {
        setStudentName(response.data.studentName);
        setMessage("Attendance logged successfully.");
        console.log(response.message)
        setStudentId("")
      } else {
        setStudentName(null);
        console.log(response.message)
        setMessage(response.data.message || "Unable to log attendance.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while processing the request.");
    }
  };

  return (
      <div className="attendance-container">
        <header className="header">
            <img src="/tuplogo.png" className="header-logo" alt="TUP Logo" />
            <img src="/clalogo.png" className="header-logo" alt="TUP Logo" />
          <div className="header-title">
            <h1>College of Liberal Arts</h1>
            <h6>Learning Resource Center</h6>
          </div>
        </header>
        
      <div className="content">

     {/*<div className="d-flex justify-content-center">
          <Webcam height={300} width={300 } mirrored='true'/>
      </div>*/}

        
      <div>
        <div className="results">
          {studentName && (
            <div className="student-info">
              <h2 className="welcome-message">Welcome,</h2>
              <h2 className="student-name"> {studentName}!</h2>
            </div>
          )}
          </div>

        <div className="search-bar">
          <div className="form-inline">
            <input
              type="text"
              className="form-input"
              id="studentId"
              value={studentId}
              onChange={handleInputChange}
              ref={searchInputRef}
              placeholder="Please scan your Student ID or enter your name here"
              onKeyDown={(e)=>e.key=='Enter'&&handleSubmit()}
            />
            <button onClick={handleSubmit} className="search-button">
              Search
            </button>
          </div>
        </div>
      </div>  
        <div className="results">
          {message && (
            <div className="message">
              <p className="status-message">{message}</p>
            </div>
          )}
        </div>
      </div>
      <div className="footer">
        <p>&copy; TUP CLA Learning Resource Center 2025</p>
      </div>
    </div>

  );
};

export default AttendancePage;
