import React, { useEffect, useState, useRef } from "react";
import "./EditPatron.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const EditPatron = () => {
  const { username } = useSelector((state) => state.username);
  const [patronData, setPatronData] = useState({
    patron_fname: "",
    patron_lname: "",
    patron_sex: "Male",
    patron_mobile: "",
    patron_email: "",
    category: "Student",
    patron_status: "active",
    college: "",
    program: null,
    tup_id: "TUPM-",
    username: "",
  });
  const [originalPatronData, setOriginalPatronData] = useState({});
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    error: "error",
  });
  const [editMode, setEditMode] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (id > 0) {
      setEditMode(true);
      getPatronEdit();
    }
    getColleges();
    getCourses();
  }, []);

  useEffect(() => {
    setPatronData((prevData) => ({
      ...prevData,
      username: username,
    }));
  }, [username]);

  const getColleges = async () => {
    try {
      const response = await axios
        .get("https://api2.tuplrc-cla.com/api/data/college")
        .then((res) => res.data);
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
        patron_status: res.data.patronData.status,
        college: res.data.patronData.college_id,
        college_name: res.data.patronData.college_name,
        program: res.data.patronData.course_id,
        course_name: res.data.patronData.course_name,
        tup_id: res.data.patronData.tup_id || "",
      };

      const storedCreds = JSON.parse(localStorage.getItem("token"));
      if (storedCreds.message === "Login successful") {
        fetchedData.username = storedCreds.user.username;
        setUserName(storedCreds.user.username);
      }

      setPatronData(fetchedData);
      setOriginalPatronData(fetchedData);
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
        .replace(/^TUPM-/g, "")
        .replace(/[^\d-]/g, "")
        .padEnd(7, "-")
        .slice(0, 7);

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

  const validateField = async (name, value) => {
    const phoneRegex = /^09[0-9]{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const tupIdRegex = /^TUPM-\d{2}-\d{4}$/;

    let error = "";

    setErrors((prev) => {
      if (prev.error) {
        const { error, ...rest } = prev;
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

  console.log(patronData);

  const handleTupIdChange = async (e) => {
    const { value, selectionStart } = e.target;
    const prefix = "TUPM-";
    const prefixLength = prefix.length;

    if (!value.startsWith(prefix)) return;

    let editablePart = value.slice(prefixLength).replace(/[^0-9]/g, "");

    let formattedPart = editablePart;
    let addedDash = false;

    if (editablePart.length > 2) {
      formattedPart = `${editablePart.slice(0, 2)}-${editablePart.slice(2)}`;
      if (!value.includes("-") && selectionStart > prefixLength + 2) {
        addedDash = true;
      }
    }

    const formattedValue = `${prefix}${formattedPart}`;

    setPatronData((prev) => ({
      ...prev,
      tup_id: formattedValue,
    }));

    let newCursorPos = selectionStart + (formattedValue.length - value.length);

    if (addedDash && selectionStart === prefixLength + 2) {
      newCursorPos++;
    }

    setTimeout(() => e.target.setSelectionRange(newCursorPos, newCursorPos), 0);

    await validateField("tup_id", formattedValue);
  };

  const handleTupIdKeyDown = (e) => {
    const cursorPos = e.target.selectionStart;
    const prefixLength = 5;

    if (
      cursorPos < prefixLength &&
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft"
    ) {
      e.preventDefault();
    }
  };

  const handleTupIdClick = (e) => {
    const prefixLength = 5;

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
      navigate("/patron");
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
      navigate("/patron");
      window.toast.fire({ icon: "success", title: "Patron Updated" });
    } catch (error) {
      console.error("Error saving patron:", error);
    }
  };

  const formValidation = async () => {
    let errors = {};

    const tupIdError = await validateField("tup_id", patronData.tup_id);
    if (tupIdError) {
      errors.tup_id = tupIdError;
    }

    if (!patronData.patron_fname.trim()) {
      errors.patron_fname = "First name is required.";
    }

    if (!patronData.patron_lname.trim()) {
      errors.patron_lname = "Last name is required.";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      console.error("Validation errors:", errors);
      return false;
    }
  };

  const validateAll = async () => {
    let newErrors = {};
    let isValid = true;

    for (const field in patronData) {
      const error = await validateField(field, patronData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  console.log(patronData);

  return (
    <div className="edit-patron-container bg-light">
      {/* Header with breadcrumb */}
      <div className=" mb-4">
        <div className="">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                {editMode ? "Edit Patron" : "Add New Patron"}
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb d-flex align-items-center mb-0 mt-1">
                  <li className="breadcrumb-item">
                    <Link to="/patron">
                      <button className="btn edit-patron-back-button">
                        Back
                      </button>
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/patron" className="text-decoration-none">
                      Patrons
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {editMode ? "Edit Patron" : "Add Patron"}
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="card shadow-sm">
        <div className="card-header py-3">
          <h2 className="card-title text-white text-center h5 mb-0">
            <i className="bi bi-person-badge me-2 text-primary"></i>
            Patron Information
          </h2>
        </div>

        <div className="card-body p-5">
          {isloading ? (
            <div className="d-flex justify-content-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <form>
              {/* TUP ID Section */}
              <div className="mb-4">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className={`form-control ${
                      errors.tup_id ? "is-invalid" : ""
                    }`}
                    id="tup_id"
                    placeholder="TUPM-**-****"
                    maxLength={12}
                    name="tup_id"
                    value={patronData.tup_id}
                    onChange={handleTupIdChange}
                    onClick={handleTupIdClick}
                    onKeyDown={handleTupIdKeyDown}
                  />
                  <label htmlFor="tup_id">
                    <i className="bi bi-person-badge me-2"></i>
                    TUP ID
                  </label>
                  {errors.tup_id && (
                    <div className="invalid-feedback">{errors.tup_id}</div>
                  )}
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <h3 className="h6 text-muted mb-3">
                    <i className="bi bi-person me-2"></i>
                    Personal Information
                  </h3>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="form-floating">
                    <input
                      type="text"
                      className={`form-control ${
                        errors.patron_fname ? "is-invalid" : ""
                      }`}
                      id="patron_fname"
                      placeholder=""
                      name="patron_fname"
                      value={patronData.patron_fname}
                      onChange={handleChange}
                    />
                    <label htmlFor="patron_fname">First Name</label>
                    {errors.patron_fname && (
                      <div className="invalid-feedback">
                        {errors.patron_fname}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="form-floating">
                    <input
                      type="text"
                      className={`form-control ${
                        errors.patron_lname ? "is-invalid" : ""
                      }`}
                      id="patron_lname"
                      placeholder=""
                      name="patron_lname"
                      value={patronData.patron_lname}
                      onChange={handleChange}
                    />
                    <label htmlFor="patron_lname">Last Name</label>
                    {errors.patron_lname && (
                      <div className="invalid-feedback">
                        {errors.patron_lname}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <h3 className="h6 text-muted mb-3">
                    <i className="bi bi-envelope me-2"></i>
                    Contact Information
                  </h3>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="form-floating">
                    <select
                      className="form-select"
                      id="patron_sex"
                      name="patron_sex"
                      value={patronData.patron_sex}
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <label htmlFor="patron_sex">Sex</label>
                  </div>
                </div>

                <div className="col-md-8 mb-3">
                  <div className="form-floating">
                    <input
                      type="text"
                      className={`form-control ${
                        errors.patron_mobile ? "is-invalid" : ""
                      }`}
                      id="patron_mobile"
                      placeholder=""
                      name="patron_mobile"
                      value={patronData.patron_mobile}
                      onChange={handleChange}
                    />
                    <label htmlFor="patron_mobile">
                      <i className="bi bi-phone me-2"></i>
                      Phone Number (09XXXXXXXXX)
                    </label>
                    {errors.patron_mobile && (
                      <div className="invalid-feedback">
                        {errors.patron_mobile}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <div className="form-floating">
                    <input
                      type="email"
                      className={`form-control ${
                        errors.patron_email ? "is-invalid" : ""
                      }`}
                      id="patron_email"
                      placeholder=""
                      name="patron_email"
                      value={patronData.patron_email}
                      onChange={handleChange}
                    />
                    <label htmlFor="patron_email">
                      <i className="bi bi-envelope me-2"></i>
                      Email Address
                    </label>
                    {errors.patron_email && (
                      <div className="invalid-feedback">
                        {errors.patron_email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="row mb-4">
                <div className="col-12">
                  <h3 className="h6 text-muted mb-3">
                    <i className="bi bi-mortarboard me-2"></i>
                    Academic Information
                  </h3>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="form-floating">
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={patronData.category}
                      onChange={handleChange}
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                    </select>
                    <label htmlFor="category">Category</label>
                  </div>
                </div>

                <div className="col-md-8 mb-3">
                  <div className="form-floating">
                    <select
                      className={`form-select ${
                        errors.college ? "is-invalid" : ""
                      }`}
                      id="college"
                      name="college"
                      value={patronData.college}
                      onChange={handleChange}
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
                    <label htmlFor="college">College</label>
                    {errors.college && (
                      <div className="invalid-feedback">{errors.college}</div>
                    )}
                  </div>
                </div>

                {patronData.category == "Student" && (
                  <div className="col-12">
                    <div className="form-floating">
                      <select
                        className="form-select"
                        id="program"
                        name="program"
                        value={patronData.program || ""}
                        onChange={handleChange}
                        disabled={!patronData.college}
                      >
                        <option value="">Select Program</option>
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
                      <label htmlFor="program">Program</label>
                    </div>
                    {!patronData.college && (
                      <small className="text-muted">
                        Select a college first to view available programs
                      </small>
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="row mb-4">
                <div className="col-12">
                  <h3 className="h6 text-muted mb-3">
                    <i className="bi bi-mortarboard me-2"></i>
                    Status
                  </h3>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="form-floating">
                    <select
                      className="form-select"
                      id="patron_status"
                      name="patron_status"
                      value={patronData.patron_status}
                      onChange={handleChange}
                    >
                      <option selected disabled>
                        Select Status
                      </option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <label htmlFor="patron_status">Status</label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-between mt-4">
                <Link to="/patron" className="btn btn-outline-secondary px-4">
                  Cancel
                </Link>
                <button
                  type="button"
                  className="btn btn-primary px-5"
                  onClick={handleSave}
                  disabled={
                    editMode
                      ? JSON.stringify(patronData) ===
                          JSON.stringify(originalPatronData) ||
                        Object.keys(errors).length > 0
                      : Object.keys(errors).length > 0
                  }
                >
                  <i className="bi bi-check2 me-2"></i>
                  {editMode ? "Update Patron" : "Save Patron"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPatron;
