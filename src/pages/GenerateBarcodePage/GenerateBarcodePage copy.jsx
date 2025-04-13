import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar';
import './GenerateBarcodePage.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faBarcode, faCaretLeft, faChevronLeft, faChevronRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import BarcodeData from '../../components/BarcodeData/BarcodeData';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import BarcodePDF from '../../components/BarcodePDF.js';

const GenerateBarcodePage = () => {
    const [dataToGenerate, setDataToGenerate] = useState([]);
    const [selectedResource, setSelectedResource] = useState([]);
    const [barcodeQuantities, setBarcodeQuantities] = useState({}); // Stores barcode count per resource
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items per page

    const getData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/catalog/generate-barcode');
            setDataToGenerate(response.data);
            setFilteredData(response.data)
        } catch (error) {
            console.log("Can't retrieve data to generate barcode. An error occurred.", error);
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

    const search = ()=>{
        setFilteredData(dataToGenerate.filter(item=>item.resource_title.toLowerCase().includes(searchQuery.toLowerCase())))
    }


    console.log(searchQuery)

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(dataToGenerate.length / itemsPerPage);

    return (
        <div className='barcodepage'>
            <div>
                <AdminNavbar />
            </div>
            <div>
                <AdminTopNavbar />
                <div className='cat-container'>
                    <h1>Catalog</h1>
                    <div className='barcode-path-box'>
                        <Link to={'/catalog'}>
                            <button className='back'>
                                <p>Back</p>
                            </button>
                        </Link>
                        <div className='barcode-path'>
                            <p>Patrons / <span> Generate Barcode</span></p>
                        </div>
                    </div>
                    <div className="search-filter">
                        <input type="search" placeholder="Search by title" onChange={(e)=>setSearchQuery(e.target.value)} onKeyDown={(e)=>e.key=='Enter'&&search()}/>
                        <button className="btn cat-search-button" onClick={search}>
                            <FontAwesomeIcon icon={faSearch} className='icon' />
                        </button>
                    </div>
                    <div className='d-flex align-items-end justify-content-between barcode-instruct m-auto'>
                        <p className='m-0'>Select book/s to generate its barcode</p>
                        <div className='d-flex gap-2'>
                            <PDFDownloadLink
                                document={<BarcodePDF selectedResources={selectedResource} />}
                                fileName="Generated_Barcodes.pdf"
                            >
                                {({ loading }) => (
                                    <button className='btn d-flex align-items-center gap-2 generate-btn'>
                                        <FontAwesomeIcon icon={faBarcode} className='icon' />
                                        {loading ? "Generating PDF..." : "Export as PDF"}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </div>
                    <div className='barcode-data m-auto d-flex flex-column gap-2'>
                        <div className='row text-center header rounded'>
                            <div className="col-2 d-flex gap-2 justify-content-center">
                                <input type="checkbox" onChange={handleSelectAll} checked={selectedResource.length === dataToGenerate.length && dataToGenerate.length > 0} />
                                Select all
                            </div>
                            <div className="col-3">Title</div>
                            <div className="col-3">Type</div>
                            <div className="col-2">ISBN</div>
                            <div className="col-2">Quantity</div>
                        </div>
                        {currentItems.length!=0?currentItems.map((item) => (
                            <BarcodeData
                                key={item.resource_id}
                                data={item}
                                isSelected={selectedResource.includes(item.resource_id)}
                                handleSelectResource={handleSelectResource}
                                barcodeQuantities={barcodeQuantities}
                                handleQuantityChange={handleQuantityChange}
                            />
                        )):<p className='m-auto'>No records available</p>}
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
                                <FontAwesomeIcon icon={faArrowRight}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateBarcodePage;
