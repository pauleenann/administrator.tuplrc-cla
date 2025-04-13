import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './CatalogImport.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx'; // Import xlsx library
import axios from 'axios';
import { useSelector } from 'react-redux';
import CatalogImportError from '../CatalogImportError/CatalogImportError';

const CatalogImport = ({open, close}) => {
    const {username} = useSelector(state=>state.username)
    const [importData, setImportData] = useState([])
    const [selectedType, setSelectedType] = useState('1');
    const [acceptedColumns, setAcceptedColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const [importFailed, setImportFailed] = useState(false);
    const [error, setError] = useState('')
    const [invalidResources, setInvalidResources] = useState([])
    const [insertedResources, setInsertedResources] = useState([])
    const [showResults, setShowResults] = useState(false)
    
    const bookColumns = [
        'isbn',
        'topic',
        'department',
        'publisher name',
        'publisher address',
        'publisher email',
        'publisher number',
        'publisher website',
        'title',
        'description',
        'quantity',
        'authors',
        'published date'
    ]

    const jnColumns = [
        'volume',
        'issue',
        'department',
        'topic',
        'title',
        'description',
        'quantity',
        'authors',
        'published date'
    ]

    const thesisColumns = [
        'department',
        'title',
        'description',
        'quantity',
        'adviser',
        'published date'
    ]
    
    useEffect(()=>{
        switch(selectedType){
            case '1': 
                setAcceptedColumns(bookColumns);
                break;
            case '2': 
            case '3': 
                setAcceptedColumns(jnColumns);
                break;
            case '4': 
                setAcceptedColumns(thesisColumns);
                break;
            default:
                console.log('Type not supported.')
        }
    },[selectedType])

    useEffect(() => {
        setImportData([])
        setError('')
        setImportSuccess(false)
        setImportFailed(false)
        setShowResults(false)
    }, [selectedType])

    useEffect(() => {
        if (open) {
            // Reset state when modal opens
            setImportData([])
            setError('')
            setImportSuccess(false)
            setImportFailed(false)
            setInvalidResources([])
            setInsertedResources([])
            setShowResults(false)
        }
    }, [open])

    // Handle file upload and parse Excel file
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setError('');
        setImportData([]);

        const reader = new FileReader();
        reader.readAsBinaryString(file);

        reader.onload = async (e) => {
            let columnNames;
            let columnError = [];
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convert Excel data to JSON
            let jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            if (jsonData.length > 0) {
                // **Remove only trailing spaces and convert column names to lowercase**
                columnNames = Object.keys(jsonData[0]).map(key => key.replace(/\s+$/, "").toLowerCase());

                // Check for missing columns
                acceptedColumns.forEach(item => {
                    if (!columnNames.includes(item)) {
                        columnError.push(item);
                    }
                });

                // Set error message if columns are missing
                setError(columnError.length > 0 ? `Excel file should contain the exact column names: ${columnError.join(', ')}` : '');

                if (columnError.length === 0) {
                    // **Remove only trailing spaces from all column values**
                    const cleanedData = jsonData.map(row => {
                        return Object.fromEntries(
                            Object.entries(row).map(([key, value]) => [
                                key.replace(/\s+$/, "").toLowerCase(), // Remove trailing spaces in column names
                                typeof value === 'string' ? value.replace(/\s+$/, "") : value // Remove trailing spaces in values
                            ])
                        );
                    });

                    setImportData(cleanedData);
                }
            } else {
                setError('File appears to be empty');
            }
        };

        reader.onerror = () => {
            setError('Error reading file');
        };
    };

    const handleImport = async () => {
        try {
            setIsLoading(true);
            // Send the data to the server
            const response = await axios.post('http://localhost:3001/api/resources/import', {importData, selectedType, username});
            
            setInvalidResources(response.data.invalidResources || []);
            setInsertedResources(response.data.insertedRecords || []);
            
            if (response.data.invalidResources.length > 0 && response.data.insertedRecords.length === 0) {
                // Only invalid resources, no successful insertions
                setImportFailed(true);
            } else if (response.data.insertedRecords.length > 0) {
                // Some resources were successfully inserted
                setImportSuccess(true);
                setShowResults(true);
                
                // Auto close and reload after delay only if there are no invalid resources
                if (response.data.invalidResources.length === 0) {
                    setTimeout(() => {
                        setImportData([])
                        close();
                        setImportSuccess(false)
                        setError('')
                        window.location.reload()
                    }, 2000);
                }
            }
        } catch (err) {
            console.error('Error importing catalog:', err);
            setError('Failed to import catalog data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    // Handle complete import after viewing results
    const handleCompleteImport = () => {
        setImportData([])
        close();
        setImportSuccess(false)
        setError('')
        window.location.reload()
    }

    const closeModal = () => {
        setImportData([])
        setError('')
        setImportSuccess(false)
        setImportFailed(false)
        setInvalidResources([])
        setInsertedResources([])
        setShowResults(false)
        setSelectedType('1')
        close()
    }

    if (!open) {
        return null;
    }

    const getResourceTypeName = () => {
        switch(selectedType) {
            case '1': return 'Book';
            case '2': return 'Journal';
            case '3': return 'Newsletter';
            case '4': return 'Thesis';
            default: return 'Resource';
        }
    }

    return ReactDom.createPortal(
        <div className='import-modal-container z-3'>
            <div className="import-modal-overlay"></div>

            {/* modal box */}
            <div className="import-modal-box p-4">
                {/* header */}
                <div className='d-flex align-items-center justify-content-between'>
                    <h4 className='m-0'>Import Catalog Data</h4>
                    <FontAwesomeIcon icon={faX} className="cursor-pointer" onClick={closeModal}/>
                </div>
                
                {/* body */}
                <div className='mt-4 d-flex flex-column gap-3'>
                    {importSuccess && (
                        <div className="alert alert-success">
                            Data imported successfully!
                        </div>
                    )}

                    {/* Results section - shown when insertedResources > 0 */}
                    {showResults && insertedResources.length > 0 && (
                        <div className="import-results">
                            <h5>Import Results</h5>
                            <p className="text-success">
                                Successfully imported: {insertedResources.length} {getResourceTypeName()}
                                {insertedResources.length !== 1 ? 's' : ''}
                            </p>
                            
                            {invalidResources.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-warning">
                                        Failed to import: {invalidResources.length} record
                                        {invalidResources.length !== 1 ? 's' : ''}
                                    </p>
                                    <button 
                                        className="btn btn-sm btn-outline-warning" 
                                        onClick={() => setImportFailed(true)}
                                    >
                                        View Failed Records
                                    </button>
                                </div>
                            )}
                            
                            <div className="d-flex justify-content-end mt-3">
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleCompleteImport}
                                >
                                    Complete Import
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* File input section - hidden when showing results */}
                    {!showResults && (
                        <>
                            {/* resource type */}
                            <div>
                                <label htmlFor="resourceType">Resource Type</label>
                                <select 
                                    id="resourceType" 
                                    className='form-select' 
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="1">Book</option>
                                    <option value="2">Journal</option>
                                    <option value="3">Newsletter</option>
                                    <option value="4">Thesis</option>
                                </select>
                            </div>
                            
                            {/* file */}
                            <div className='d-flex flex-column'>
                                <label htmlFor="file" className=''>Excel File</label>
                                <input 
                                    type="file" 
                                    accept='.xlsx, .xls' 
                                    name="file" 
                                    id="file" 
                                    onChange={handleFileUpload}
                                    className="form-control"
                                />
                                {error && (
                                    <p className='error fst-italic text-danger mt-2'>
                                        <span className='fw-semibold'>{error}</span>
                                    </p>
                                )}
                                {importData.length > 0 && (
                                    <p className="text-success mt-1">
                                        File loaded: {importData.length} records found
                                    </p>
                                )}
                            </div>
                            
                            {/* buttons */}
                            <div className='d-flex justify-content-end gap-2 mt-2'>
                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={closeModal}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleImport}
                                    disabled={isLoading || importData.length === 0}
                                >
                                    {isLoading ? 'Importing...' : 'Import'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <CatalogImportError 
                open={importFailed} 
                close={() => setImportFailed(false)} 
                invalidResources={invalidResources}
            />
        </div>,
        document.getElementById('portal')
    )
}

export default CatalogImport