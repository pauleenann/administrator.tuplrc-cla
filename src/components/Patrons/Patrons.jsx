import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Patrons.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faPen,
  faFile,
  faArrowRight,
  faArrowLeft,
  faExclamationCircle,
  faUpload,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import PatronImport from "../PatronImport/PatronImport";

const Patrons = () => {
  const [patrons, setPatrons] = useState([]);
  const [filteredPatrons, setFilteredPatrons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    category: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPatrons.length / itemsPerPage);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedCreds = JSON.parse(localStorage.getItem("token"));
        if (storedCreds.message === "Login successful") {
          setUserRole(storedCreds.user.role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error verifying session:", error);
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    if (searchTerm == "") {
      getPatron();
    }
  }, [searchTerm]);

  const getPatron = async () => {
    setLoading(true);
    axios
      .get("https://api2.tuplrc-cla.com/api/patron")
      .then((response) => {
        setPatrons(response.data);
        setFilteredPatrons(response.data);
      })
      .catch((error) => {
        console.error("Error fetching patron data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  const handleSearch = () => {
    filterPatrons(searchTerm.toLowerCase(), selectedFilters);
  };

  const handleFilterChange = (e) => {
    const { value, name } = e.target;

    const newFilters = {
      ...selectedFilters,
      [name]: value,
    };

    setSelectedFilters(newFilters);
    filterPatrons(searchTerm.toLowerCase(), newFilters); // Pass the updated filters directly here
  };

  const filterPatrons = (term, filters) => {
    const filtered = patrons.filter((patron) => {
      const matchesSearch =
        patron.tup_id.toString().toLowerCase().includes(term.toLowerCase()) ||
        `${patron.patron_fname} ${patron.patron_lname}`
          .toLowerCase()
          .includes(term) ||
        patron.patron_email.toLowerCase().includes(term);

      const matchesCategory =
        filters.category === "" ||
        patron.category.toLowerCase() === filters.category.toLowerCase();

      const matchesStatus =
        filters.status === "" ||
        patron.status.toLowerCase() === filters.status.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus; //if true, it returns the patron object
    });
    console.log(filtered);
    setFilteredPatrons(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const paginatedPatrons =
    filteredPatrons.length > 0 &&
    filteredPatrons.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const handleClearFilter = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setFilteredPatrons(patrons);
    setCurrentPage(1);
  };

  return (
    <div className="patrons-container bg-light">
      <h1>Patrons</h1>
      {/* <div className="search-field-category-filter">
                <div className="patrons-category">
                    <label>Category</label>
                    <select className="form-select shadow-sm" value={categoryFilter} onChange={handleCategoryChange}>
                        <option value="">Any</option>
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                    </select>
                </div>
            </div> */}
      <div className="search-bar-box">
        <div className="d-flex gap-2">
          <div className="input-group z-0">
            <input
              type="text"
              className="patrons-search-bar form-control shadow-sm"
              placeholder="Search by TUP ID, email, or name"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key == "Enter" && handleSearch()}
            />
            <button
              className="patrons-search-button btn btn-primary"
              onClick={handleSearch}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link to="/patron/add">
            <button className="patrons-add-btn btn btn-success shadow-sm">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Patron
            </button>
          </Link>
          <button
            className="btn btn-primary d-flex align-items-center justify-content-center gap-2 shadow-sm"
            onClick={() => setIsOpen(true)}
          >
            <FontAwesomeIcon icon={faUpload} />
            Import
          </button>
        </div>
      </div>
      <div className="">
        <div className="mb-3 d-flex gap-3">
          <div>
            <label>Category</label>
            <select
              id=""
              name="category"
              value={selectedFilters.category}
              onChange={handleFilterChange}
              className="form-select form-select-sm"
              style={{
                width: "auto",
                display: "inline-block",
                marginLeft: "5px",
                height: "35px",
              }}
            >
              <option value="">Any</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select
              id=""
              name="status"
              value={selectedFilters.status}
              onChange={handleFilterChange}
              className="form-select form-select-sm"
              style={{
                width: "auto",
                display: "inline-block",
                marginLeft: "5px",
                height: "35px",
              }}
            >
              <option value="">Any</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <table className=" table-hover shadow-sm">
          <thead className="">
            <tr>
              <td>TUP ID</td>
              <td>Name</td>
              <td>Email</td>
              <td>Category</td>
              <td>Checkouts</td>
              <td>Status</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {paginatedPatrons.length > 0 ? (
              paginatedPatrons.map((patron, index) => (
                <tr key={index}>
                  <td className="tup-id">{patron.tup_id}</td>
                  <td className="name">
                    {patron.patron_fname} {patron.patron_lname}
                  </td>
                  <td className="email">{patron.patron_email}</td>
                  <td className="category">{patron.category}</td>
                  <td>{patron.total_checkouts}</td>
                  <td className="">
                    {patron.status == "active" ? (
                      <span className="bg-success p-2 fw-semibold text-white rounded">
                        active
                      </span>
                    ) : (
                      <span className="bg-danger p-2 fw-semibold text-white rounded">
                        inactive
                      </span>
                    )}
                  </td>
                  {userRole === "admin" || userRole === "staff" ? (
                    <td className="patron-edit-checkout">
                      <Link to={`/patron/edit/${patron.patron_id}`}>
                        <button className="btn patron-edit-button">
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                      </Link>
                      <Link to={`/patron/view/${patron.patron_id}`}>
                        <button className="btn patron-view-button">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </Link>
                    </td>
                  ) : (
                    <td></td>
                  )}
                </tr>
              ))
            ) : !loading ? (
              <tr>
                <td colSpan="8" className="no-data-box text-center">
                  <div className="d-flex flex-column align-items-center gap-2 my-3">
                    <FontAwesomeIcon
                      icon={faExclamationCircle}
                      className="fs-2"
                    />
                    <span className="">
                      Resource not available.
                      <br />
                      Please try again.
                    </span>
                    <button
                      className="btn btn-warning"
                      onClick={handleClearFilter}
                    >
                      Clear Filter
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredPatrons.length > 0 && (
        <div className="pagination">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="buttons">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      )}
      <PatronImport open={isOpen} close={() => setIsOpen(false)} />
    </div>
  );
};

export default Patrons;
