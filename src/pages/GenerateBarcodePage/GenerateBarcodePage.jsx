import React, { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminTopNavbar from "../../components/AdminTopNavbar/AdminTopNavbar";
import "./GenerateBarcodePage.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarcode,
  faSearch,
  faArrowLeft,
  faArrowRight,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import BarcodeData from "../../components/BarcodeData/BarcodeData";
import axios from "axios";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BarcodePDF from "../../components/BarcodePDF.js";

const GenerateBarcodePage = () => {
  const [dataToGenerate, setDataToGenerate] = useState([]);
  const [selectedResource, setSelectedResource] = useState([]);
  const [barcodeQuantities, setBarcodeQuantities] = useState({}); // Stores barcode count per resource
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  const getData = async () => {
    try {
      const response = await axios.get(
        "https://api2.tuplrc-cla.com/api/catalog/generate-barcode"
      );
      setDataToGenerate(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.log(
        "Can't retrieve data to generate barcode. An error occurred.",
        error
      );
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    if (checked) {
      const resourceIds = dataToGenerate.map((item) => item.resource_id);
      setSelectedResource(resourceIds);
    } else {
      setSelectedResource([]);
    }
  };

  const handleSelectResource = (resource_id) => {
    setSelectedResource((prevSelected) =>
      prevSelected.includes(resource_id)
        ? prevSelected.filter((id) => id !== resource_id)
        : [...prevSelected, resource_id]
    );
  };

  // Handle barcode quantity input
  const handleQuantityChange = (resource_id, value) => {
    const quantity = Math.max(1, parseInt(value, 10) || 1); // Ensure at least 1 barcode
    setBarcodeQuantities((prevQuantities) => ({
      ...prevQuantities,
      [resource_id]: quantity,
    }));
  };

  // Filter selected resources and map their barcode count
  const selectedResourcesWithQuantity = selectedResource.flatMap(
    (resource_id) => {
      const resource = dataToGenerate.find(
        (item) => item.resource_id === resource_id
      );
      const quantity = barcodeQuantities[resource_id] || 1;
      return resource ? Array(quantity).fill(resource) : [];
    }
  );

  const search = () => {
    setFilteredData(
      dataToGenerate.filter((item) =>
        item.resource_title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(dataToGenerate.length / itemsPerPage);

  const clearFilters = () => {
    setSearchQuery("");
    getData();
  };

  useEffect(() => {
    if (searchQuery == "") {
      getData();
    }
  }, [searchQuery]);

  console.log(filteredData);

  return (
    <div className="barcodepage bg-light">
      <div>
        <AdminNavbar />
      </div>
      <div>
        <AdminTopNavbar />
        <div className="cat-container">
          <h1>Generate Barcode</h1>
          <div className="barcode-path-box"></div>
          <div className="search-filter input-group w-50 shadow-sm z-0">
            <input
              type="search"
              className="form-control"
              placeholder="Search by title"
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key == "Enter" && search()}
              value={searchQuery}
            />
            <button className="btn search-btn" onClick={search}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
          <div className="d-flex align-items-end justify-content-between barcode-instruct m-auto">
            <p className="m-0">Select book/s to generate its barcode</p>
            <div className="d-flex gap-2">
              {selectedResourcesWithQuantity.length > 0 ? (
                <PDFDownloadLink
                  document={
                    <BarcodePDF
                      selectedResources={selectedResourcesWithQuantity}
                    />
                  }
                  fileName="Generated_Barcodes.pdf"
                >
                  {({ loading }) => (
                    <button
                      className="btn d-flex align-items-center gap-2 btn-success"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faBarcode} />
                      {loading ? "Generating PDF..." : "Export as PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
              ) : (
                <button
                  className="btn d-flex align-items-center gap-2 btn-success"
                  disabled
                >
                  <FontAwesomeIcon icon={faBarcode} />
                  Export as PDF
                </button>
              )}
            </div>
          </div>
          <div className="barcode-data m-auto d-flex flex-column gap-2">
            <div className="row d-flex align-items-center header rounded text-center">
              <div className="col-2 d-flex gap-2 justify-content-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedResource.length === dataToGenerate.length &&
                    dataToGenerate.length > 0
                  }
                />
                Select all
              </div>
              <div className="col-3">Title</div>
              <div className="col-3">Type</div>
              <div className="col-2">ISBN</div>
              <div className="col-2">
                Quantity{" "}
                <span className="qnty-reminder">
                  (Specify no. of barcode to generate)
                </span>
              </div>
            </div>
            {currentItems.length != 0 ? (
              currentItems.map((item) => (
                <BarcodeData
                  key={item.resource_id}
                  data={item}
                  isSelected={selectedResource.includes(item.resource_id)}
                  handleSelectResource={handleSelectResource}
                  barcodeQuantities={barcodeQuantities}
                  handleQuantityChange={handleQuantityChange}
                />
              ))
            ) : (
              <div className="text-center py-5">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="fs-2 no-data"
                />
                <p className="fw-semibold m-0">Book not found.</p>
                <p className="mb-2">Please try another search.</p>
                <button className="btn btn-warning" onClick={clearFilters}>
                  Clear filter
                </button>
              </div>
            )}
          </div>
          {/* Pagination Controls */}
          <div className="pagination d-flex justify-content-between mt-3 m-auto">
            <span className="">
              Page {currentPage} of {totalPages}
            </span>
            <div>
              <button
                className="btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <button
                className="btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateBarcodePage;
