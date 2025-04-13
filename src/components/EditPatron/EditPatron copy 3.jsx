import React, { useEffect, useState, useRef } from "react";
import "./EditPatron.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditPatron = () => {
  const [patronData, setPatronData] = useState({
    patron_fname: "",
    patron_lname: "",
    patron_sex: "Male",
    patron_mobile: "",
    patron_email: "",
    category: "Student",
    college: "",
    program: null,
    tup_id: "TUPM-",
    username: "",
  });
  const [originalPatronData, setOriginalPatronData] = useState({});

  console.log("Patron Data: ", patronData);
  console.log("Original Patron Data: ", originalPatronData);

  // const [categories, setCategories] = useState([]); // To store category options
  const [colleges, setColleges] = useState([]); // To store college options
  const [courses, setCourses] = useState([]); // To store course options
  const [filteredCourses, setFilteredCourses] = useState([]);
  const { id } = useParams(); // ID from the route parameter
  const navigate = useNavigate(); // For programmatic navigation
  const [errors, setErrors] = useState({
    error: "error",
  });
  const [editMode, setEditMode] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const [userName, setUserName] = useState("");

  console.log("Error", errors);

  useEffect(() => {
    if (id > 0) {
      setEditMode(true);
      getPatronEdit();
    }
    getUsername();
    getColleges();
    getCourses();
  }, []);

  const getUsername = async () => {
    try {
      // Request server to verify the JWT token
      const response = await axios.get(
        `https://api2.tuplrc-cla.com/api/user/check-session`,
        { withCredentials: true }
      );
      console.log(response.data);
      // If session is valid, set the role
      if (response.data.loggedIn) {
        setUserName(response.data.username);
        setPatronData((prevData) => ({
          ...prevData,
          username: response.data.username,
        }));
      }
    } catch (error) {
      console.error("Error verifying session:", error);
    }
  };

  const getColleges = async () => {
    try {
      const response = await axios
        .get("https://api2.tuplrc-cla.com/api/data/college")
        .then((res) => res.data);
      console.log(response);
      setColleges(response);
    } catch (err) {
      console.log("Error fetching colleges ", err.message);
    }
  };

  const getCourses = async () => {
    try {
      const response = await axios
        .get("https://api2.tuplrc-cla.com/api/data/course")
        .then((res) => res.data);
      console.log(response);
      setCourses(response);
      setFilteredCourses(response);
    } catch (err) {
      console.log("Error fetching colleges ", err.message);
    }
  };

  const getPatronEdit = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://api2.tuplrc-cla.com/api/patron/update/${id}`
      );

      const fetchedData = {
        patron_fname: res.data.patronData.patron_fname,
        patron_lname: res.data.patronData.patron_lname,
        patron_sex: res.data.patronData.patron_sex,
        patron_mobile: res.data.patronData.patron_mobile,
        patron_email: res.data.patronData.patron_email,
        category: res.data.patronData.category,
        college: res.data.patronData.college_id,
        college_name: res.data.patronData.college_name,
        program: res.data.patronData.course_id,
        course_name: res.data.patronData.course_name,
        tup_id: res.data.patronData.tup_id || "",
      };

      // Fetch username before updating patron data
      const userResponse = await axios.get(
        `https://api2.tuplrc-cla.com/api/user/check-session`,
        { withCredentials: true }
      );
      if (userResponse.data.loggedIn) {
        fetchedData.username = userResponse.data.username;
        setUserName(userResponse.data.username);
      }

      setPatronData(fetchedData);
      setOriginalPatronData(fetchedData); // Now, correctly setting backup data

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching patron data:", err);
      setIsLoading(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "tup_id") {
      let formattedValue = value;

      if (!value.startsWith("TUPM-")) {
        formattedValue = "TUPM-";
      }

      formattedValue = formattedValue
        .replace(/^TUPM-/g, "") // Remove prefix for manipulation
        .replace(/[^\d-]/g, "") // Allow only digits and dashes
        .padEnd(7, "-") // Add placeholders for remaining format
        .slice(0, 7); // Ensure correct length

      setPatronData((prev) => ({
        ...prev,
        [name]: `TUPM-${formattedValue}`,
      }));

      await validateField(name, `TUPM-${formattedValue}`);
      return;
    }

    setPatronData((prev) => ({
      ...prev,
      [name]: value,
    }));

    await validateField(name, value);
  };

  useEffect(() => {
    if (!patronData.college) return;

    setFilteredCourses(
      courses.filter((item) => item.college_id == patronData.college)
    );
  }, [patronData.college, courses]);

  console.log(filteredCourses);

  const validateField = async (name, value) => {
    const phoneRegex = /^09[0-9]{9}$/; // Must start with 09-
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const tupIdRegex = /^TUPM-\d{2}-\d{4}$/;

    let error = "";

    // Remove default error message on first validation
    setErrors((prev) => {
      if (prev.error) {
        const { error, ...rest } = prev; // Remove the default 'error' key
        return rest;
      }
      return prev;
    });

    switch (name) {
      case "patron_fname":
      case "patron_lname":
        if (!value.trim()) {
          error = `${
            name === "patron_fname" ? "First" : "Last"
          } name is required.`;
        } else if (!/^[A-Za-z\s\-]+$/.test(value.trim())) {
          error = `${
            name === "patron_fname" ? "First" : "Last"
          } name can only contain letters, spaces, or hyphens.`;
        }
        break;

      case "patron_mobile":
        if (!phoneRegex.test(value)) {
          error = "Invalid phone number. Input 11 digits only.";
        }
        break;

      case "patron_email":
        if (!emailRegex.test(value)) {
          error = "Invalid email format.";
        }
        break;

      case "tup_id":
        if (!tupIdRegex.test(value)) {
          error = "TUP ID must follow the format TUPM-**-****.";
        } else {
          if (!editMode) {
            try {
              const response = await axios.post(
                "https://api2.tuplrc-cla.com/api/validate-tup-id",
                { tup_id: value }
              );
              if (response.data.exists) {
                error = response.data.message || "TUP ID already exists.";
              }
            } catch (err) {
              console.error("Error validating TUP ID:", err);
              error = "Unable to validate TUP ID. Please try again.";
            }
          }
        }
        break;

      case "college":
        if (!value) {
          error = "Please select a college.";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }

      return newErrors;
    });

    return error;
  };

  /* const handleTupIdChange = async (e) => {
        const { value, selectionStart } = e.target;
        const prefix = "TUPM-";
        const prefixLength = prefix.length;
    
        // Ensure the input starts with "TUPM-"
        if (!value.startsWith(prefix)) return;
    
        // Extract and clean the editable portion
        let editablePart = value.slice(prefixLength).replace(/[^0-9]/g, ""); // Allow digits only
    
        // Auto-format the editable part as **-****
        if (editablePart.length > 2) {
            editablePart = `${editablePart.slice(0, 2)}-${editablePart.slice(2)}`;
        }
    
        const formattedValue = `${prefix}${editablePart}`;
    
        // Update state with the formatted value
        setPatronData((prev) => ({
            ...prev,
            tup_id: formattedValue,
        }));
    
        // Adjust cursor position after formatting
        const newCursorPos = Math.max(
            prefixLength,
            Math.min(selectionStart, formattedValue.length)
        );
        setTimeout(() => e.target.setSelectionRange(newCursorPos, newCursorPos), 0);
    
        // Validate the TUP ID
        await validateField("tup_id", formattedValue);
    }; */

  const handleTupIdChange = async (e) => {
    const { value, selectionStart } = e.target;
    const prefix = "TUPM-";
    const prefixLength = prefix.length;

    // Ensure the input starts with "TUPM-"
    if (!value.startsWith(prefix)) return;

    // Extract and clean the editable portion
    let editablePart = value.slice(prefixLength).replace(/[^0-9]/g, ""); // Allow digits only

    let formattedPart = editablePart;
    let addedDash = false;

    // Auto-format as "XX-XXXX"
    if (editablePart.length > 2) {
      formattedPart = `${editablePart.slice(0, 2)}-${editablePart.slice(2)}`;
      if (!value.includes("-") && selectionStart > prefixLength + 2) {
        addedDash = true;
      }
    }

    const formattedValue = `${prefix}${formattedPart}`;

    // Update state with the formatted value
    setPatronData((prev) => ({
      ...prev,
      tup_id: formattedValue,
    }));

    // Adjust cursor position after formatting
    let newCursorPos = selectionStart + (formattedValue.length - value.length);

    // If a dash was added, move cursor forward by 1
    if (addedDash && selectionStart === prefixLength + 2) {
      newCursorPos++;
    }

    setTimeout(() => e.target.setSelectionRange(newCursorPos, newCursorPos), 0);

    // Validate the TUP ID
    await validateField("tup_id", formattedValue);
  };

  const handleTupIdKeyDown = (e) => {
    const cursorPos = e.target.selectionStart;
    const prefixLength = 5; // "TUPM-"

    // Prevent moving cursor before the prefix or deleting it
    if (
      cursorPos < prefixLength &&
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft"
    ) {
      e.preventDefault();
    }
  };

  const handleTupIdClick = (e) => {
    const prefixLength = 5; // "TUPM-"

    // Ensure the cursor always starts after the prefix
    if (e.target.selectionStart < prefixLength) {
      e.target.setSelectionRange(prefixLength, prefixLength);
    }
  };

  const handleSave = async () => {
    const isFormValid = await validateAll();
    if (!isFormValid) {
      console.error("Form has validation errors. Fix them before saving.");
      return;
    }

    if (editMode) {
      updatePatron();
    } else {
      addPatron();
    }
  };

  const addPatron = async () => {
    if (!formValidation) {
      return;
    }
    try {
      await axios.post(`https://api2.tuplrc-cla.com/api/patron`, patronData);
      navigate("/patron"); // Redirect after saving
      window.toast.fire({ icon: "success", title: "Patron Added" });
    } catch (error) {
      console.error("Error saving patron:", error);
    }
  };

  const updatePatron = async () => {
    if (!formValidation) {
      return;
    }

    try {
      const updatedData = {
        ...patronData,
        category: patronData.category === "None" ? "" : patronData.category,
      };

      await axios.put(
        `https://api2.tuplrc-cla.com/api/patron/update/${id}`,
        updatedData
      );
      console.log("Patron updated successfully");
      navigate("/patron"); // Redirect after saving
      window.toast.fire({ icon: "success", title: "Patron Updated" });
    } catch (error) {
      console.error("Error saving patron:", error);
    }
  };

  const formValidation = async () => {
    let errors = {};

    // Validate TUP ID and check if it exists
    const tupIdError = await validateField("tup_id", patronData.tup_id);
    if (tupIdError) {
      errors.tup_id = tupIdError;
    }

    // Validate other fields
    if (!patronData.patron_fname.trim()) {
      errors.patron_fname = "First name is required.";
    }

    if (!patronData.patron_lname.trim()) {
      errors.patron_lname = "Last name is required.";
    }

    // If there are errors, block the save operation
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      console.error("Validation errors:", errors);
      return false;
    }
  };

  const validateAll = async () => {
    let newErrors = {};
    let isValid = true;

    // Iterate over all keys in patronData and validate each field
    for (const field in patronData) {
      const error = await validateField(field, patronData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    // Update errors state
    setErrors(newErrors);

    return isValid;
  };

  console.log(patronData);

  return (
    <div className="edit-patron-container">
      <h1 className="m-0">Patrons</h1>
      <div className="edit-patron-path-button">
        <Link to={"/patron"}>
          <button className="edit-patron-back-button btn">
            <p>Back</p>
          </button>
        </Link>
        <div className="edit-patron-path">
          <p>
            Patrons /
            {editMode ? <span> Edit Patron</span> : <span>Add Patron</span>}
          </p>
        </div>
      </div>

      <div className="patron-info">
        <div className="row">
          {/* header */}
          <div className="col-12 patron-info-header">
            <p className="m-0">
              {editMode ? <span>Edit </span> : <span>Add </span>}
              Patron Information
            </p>
          </div>

          <div className="row information-inputs">
            <div className="col-12">
              <div className="row">
                {/* TUP ID */}
                <div className="col-3 patron-input-box">
                  <label htmlFor="">TUP ID</label>
                  <input
                    type="text"
                    placeholder="TUPM-**-****"
                    maxLength={12} // Includes TUPM- and the rest of the format
                    name="tup_id"
                    value={patronData.tup_id}
                    onChange={handleTupIdChange}
                    onClick={handleTupIdClick}
                    onKeyDown={handleTupIdKeyDown}
                  />
                  <p className="patron-error">{errors.tup_id}</p>
                </div>
              </div>

              <div className="row">
                {/* First Name Input */}
                <div className="col-6 patron-input-box">
                  <label htmlFor="">First name</label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    name="patron_fname"
                    value={patronData.patron_fname}
                    onChange={handleChange}
                  />
                  <p className="patron-error">{errors.patron_fname}</p>
                </div>

                {/* Last Name Input */}
                <div className="col-6 patron-input-box">
                  <label htmlFor="">Last name</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    name="patron_lname"
                    value={patronData.patron_lname}
                    onChange={handleChange}
                  />
                  <p className="patron-error">{errors.patron_lname}</p>
                </div>
              </div>

              <div className="row">
                {/* SEX */}
                <div className="col-3 patron-input-box">
                  <label htmlFor="">Sex</label>
                  <select
                    name="patron_sex"
                    value={patronData.patron_sex}
                    onChange={handleChange}
                    className="patron-dropdown"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <p className="patron-error"></p>
                  </select>
                </div>

                {/* PHONE NUMBER */}
                <div className="col-4 patron-input-box">
                  <label htmlFor="">Phone number</label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    name="patron_mobile"
                    value={patronData.patron_mobile}
                    onChange={handleChange}
                  />
                  <p className="patron-error">{errors.patron_mobile}</p>
                </div>

                {/* EMAIL */}
                <div className="col-5 patron-input-box">
                  <label htmlFor="">Email</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    name="patron_email"
                    value={patronData.patron_email}
                    onChange={handleChange}
                  />
                  <p className="patron-error">{errors.patron_email}</p>
                </div>

                {/* CATEGORY */}
                <div className="col-3 patron-input-box">
                  <label htmlFor="">Category</label>
                  <select
                    name="category"
                    value={patronData.category}
                    onChange={handleChange}
                    className="patron-dropdown"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                  </select>
                  <p className="patron-error"></p>
                </div>

                {/* COLLEGE */}
                <div className="col-6 patron-input-box">
                  <label htmlFor="">College</label>
                  <select
                    name="college"
                    value={patronData.college}
                    onChange={handleChange}
                    className="patron-dropdown"
                  >
                    <option value="">Select College</option>
                    {colleges.map((college) => (
                      <option
                        key={college.college_id}
                        value={college.college_id}
                      >
                        {college.college_name}
                      </option>
                    ))}
                  </select>
                  <p className="patron-error">{errors.college}</p>
                </div>
              </div>

              {patronData.category == "Student" && (
                <div className="row">
                  {/* PROGRAM */}
                  <div className="col-9 patron-input-box">
                    <label htmlFor="">Program</label>
                    <select
                      name="program"
                      value={patronData.program}
                      onChange={handleChange}
                      className="patron-dropdown"
                    >
                      <option value="">Select Course</option>
                      {filteredCourses.length > 0 &&
                        filteredCourses.map((course) => (
                          <option
                            key={course.course_id}
                            value={course.course_id}
                          >
                            {course.course_name}
                          </option>
                        ))}
                    </select>
                    <p className="patron-error"></p>
                  </div>
                </div>
              )}

              <div className="row">
                {/* Save Button */}
                <div className="col-16">
                  <button
                    type="button"
                    className="save-button"
                    onClick={handleSave}
                    disabled={
                      editMode
                        ? JSON.stringify(patronData) ==
                            JSON.stringify(originalPatronData) ||
                          Object.keys(errors).length > 0
                        : Object.keys(errors).length > 0
                    }
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatron;
