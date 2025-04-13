import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './PatronImport.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx'; // Import xlsx library
import axios from 'axios';
import PatronImportError from '../PatronImportError/PatronImportError';
import { useSelector } from 'react-redux';

const PatronImport = ({open, close}) => {
    const {username} = useSelector(state=>state.username)
    const [importData, setImportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const [importFailed, setImportFailed] = useState(false);
    const [invalidPatrons, setInvalidPatrons] = useState([]);
    const [insertedPatrons, setInsertedPatrons] = useState([]);
    const [showResults, setShowResults] = useState(false);
    
    const acceptedColumns = [
        'tup id',
        'first name',
        'last name',
        'sex',
        'phone number',
        'tup email address',
        'college',
        'program',
        'category'
    ];
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            // Reset state when modal opens
            setImportData([]);
            setError('');
            setImportSuccess(false);
            setImportFailed(false);
            setInvalidPatrons([]);
            setInsertedPatrons([]);
            setShowResults(false);
        }
    }, [open]);

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
    
            const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert Excel to JSON
    
            if (jsonData.length > 0) {
                // Lowercase and trim column names, but leave values untouched
                columnNames = Object.keys(jsonData[0]).map(key => key.trim().toLowerCase());
    
                // Check if the required columns exist
                acceptedColumns.forEach(item => {
                    if (!columnNames.includes(item)) {
                        columnError.push(item);
                    }
                });
    
                setError(columnError.length > 0 ? `Excel file should contain the following column names: ${columnError.join(', ')}` : '');
    
                if (columnError.length === 0) {
                    // No need to change the values to lowercase, just clean the trailing spaces in data
                    const cleanedData = jsonData.map((row) => {
                        const cleanedRow = {};
                        Object.keys(row).forEach((key) => {
                            const cleanedKey = key.trim().toLowerCase(); // Convert column name to lowercase
                            cleanedRow[cleanedKey] = (row[key] || '').toString().trim(); // Trim values but leave them as they are
                        });
                        return cleanedRow;
                    });
    
                    setImportData(cleanedData); // Set the cleaned data for import
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
            const response = await axios.post('http://localhost:3001/api/patron/import', {patrons: importData, username, username});

            setInvalidPatrons(response.data.invalidPatrons || []);
            setInsertedPatrons(response.data.insertedPatrons || []);
            
            if (response.data.invalidPatrons.length > 0 && response.data.insertedPatrons.length === 0) {
                // Only invalid patrons, no successful insertions
                setImportFailed(true);
            } else if (response.data.insertedPatrons.length > 0) {
                // Some patrons were successfully inserted
                setImportSuccess(true);
                setShowResults(true);
                
                // Auto close and reload after delay only if there are no invalid patrons
                if (response.data.invalidPatrons.length === 0) {
                    setTimeout(() => {
                        setImportData([]);
                        close();
                        setImportSuccess(false);
                        setError('');
                        window.location.reload();
                    }, 2000);
                }
            }
            
        } catch (err) {
            console.error('Error importing patrons:', err);
            setError('Failed to import patron data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle final close after viewing results
    const handleCompleteImport = () => {
        setImportData([]);
        close();
        setImportSuccess(false);
        setError('');
        window.location.reload();
    };

    if (!open) {
        return null;
    }

    return ReactDom.createPortal(
        <div className='import-modal-container z-3'>
            <div className="import-modal-overlay"></div>

            {/* modal box */}
            <div className="import-modal-box p-4">
                {/* header */}
                <div className='d-flex align-items-center justify-content-between'>
                    <h4 className='m-0'>Import Patron Data</h4>
                    <FontAwesomeIcon icon={faX} className="cursor-pointer" onClick={close}/>
                </div>
                
                {/* body */}
                <div className='mt-4 d-flex flex-column gap-3'>
                    {importSuccess && (
                        <div className="alert alert-success">
                            Data imported successfully!
                        </div>
                    )}
                    
                    {/* Results section - shown when insertedPatrons > 0 */}
                    {showResults && insertedPatrons.length > 0 && (
                        <div className="import-results">
                            <h5>Import Results</h5>
                            <p className="text-success">Successfully imported: {insertedPatrons.length} records</p>
                            
                            {invalidPatrons.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-warning">Failed to import: {invalidPatrons.length} records</p>
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
                                    onClick={close}
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
            
            {/* Error modal for displaying invalid patrons */}
            <PatronImportError 
                open={importFailed} 
                close={() => setImportFailed(false)} 
                invalidPatrons={invalidPatrons}
            />
        </div>,
        document.getElementById('portal')
    )
};

export default PatronImport;