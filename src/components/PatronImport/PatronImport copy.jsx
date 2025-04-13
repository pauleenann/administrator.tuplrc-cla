import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './PatronImport.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx'; // Import xlsx library
import axios from 'axios';

const PatronImport = ({open, close}) => {
    const [importData, setImportData] = useState({
        file: [],
        college: '',
        course: ''
    })
    const [colleges, setColleges] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    
    const acceptedColumns = [
        'tup id',
        'first name',
        'last name',
        'sex',
        'mobile number',
        'email',
    ]
    const [error, setError] = useState('')

    useEffect(() => {
        setImportData({
            file: [],
            college: '',
            course: ''
        })
        setError('')
        getColleges();
        getCourses();
    }, [])

    useEffect(() => {
        if (!importData.college) return;
        setFilteredCourses(courses.filter(item => item.college_id == importData.college));
    }, [importData.college, courses]);

    // Handle file upload and parse Excel file
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        setError('');
        setImportData(prevdata => ({
            ...prevdata,
            file: []
        }));
    
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
            console.log("Parsed Excel Data:", jsonData);

            if (jsonData.length > 0) {
                columnNames = Object.keys(jsonData[0]).map(key => key.toLowerCase());
                console.log(columnNames);
                
                acceptedColumns.forEach(item => {
                    if (!columnNames.includes(item)) {
                        columnError.push(item);
                    }
                });
                
                setError(columnError.length > 0 ? `Excel file should contain the following column names:  ${columnError.join(', ')}` : '');
                
                if (columnError.length === 0) {
                    setImportData(prevdata => ({
                        ...prevdata,
                        file: jsonData
                    }));
                }
            } else {
                setError('File appears to be empty');
            }
        };
        
        reader.onerror = () => {
            setError('Error reading file');
        };
    };

    const getColleges = async() => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:3001/api/data/college').then(res => res.data);
            setColleges(response);
            if (response.length > 0) {
                setImportData(prevData => ({
                    ...prevData,
                    college: response[0].college_id
                }));
            }
        } catch (err) {
            console.log('Error fetching colleges ', err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const getCourses = async() => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:3001/api/data/course').then(res => res.data);
            setCourses(response);
            setFilteredCourses(response);
            if (response.length > 0) {
                setImportData(prevData => ({
                    ...prevData,
                    course: response[0].course_id
                }));
            }
        } catch (err) {
            console.log('Error fetching courses ', err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (e) => {
        const {name, value} = e.target;

        setImportData(prevdata => ({
            ...prevdata,
            [name]: value
        }));
    }
    
    const handleImport = async () => {
        // Validate before importing
        if (importData.file.length === 0) {
            setError('Please upload a valid file with the required columns');
            return;
        }
        
        if (!importData.college || !importData.course) {
            setError('Please select both college and course');
            return;
        }
        
        try {
            setIsLoading(true);
            // Send the data to the server
            await axios.post('http://localhost:3001/api/patron/import', {
                patrons: importData.file,
                collegeId: importData.college,
                courseId: importData.course
            });
            
            setImportSuccess(true);
            setTimeout(() => {
                close();
                setImportSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Error importing patrons:', err);
            setError('Failed to import patron data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    if (!open) {
        return null;
    }

    return ReactDom.createPortal(
        <div className='import-modal-container'>
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
                                <span className='text-capitalize fw-semibold'> {error}</span>
                            </p>
                        )}
                        {importData.file.length > 0 && (
                            <p className="text-success mt-1">
                                File loaded: {importData.file.length} records found
                            </p>
                        )}
                    </div>
                    
                    {/* college */}
                    <div className='d-flex flex-column'>
                        <label htmlFor="college" className=''>College</label>
                        <select 
                            name="college" 
                            id="college" 
                            className='form-select' 
                            onChange={handleChange}
                            value={importData.college}
                            disabled={isLoading}
                        >
                            <option value="" disabled>Select a college</option>
                            {colleges.map(college => (
                                <option key={college.college_id} value={college.college_id}>
                                    {college.college_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* course */}
                    <div className='d-flex flex-column'>
                        <label htmlFor="course" className=''>Course</label>
                        <select 
                            name="course" 
                            id="course" 
                            className='form-select' 
                            onChange={handleChange}
                            value={importData.course}
                            disabled={isLoading || !importData.college}
                        >
                            <option value="" disabled>Select a course</option>
                            {filteredCourses.length > 0 && filteredCourses.map(course => (
                                <option key={course.course_id} value={course.course_id}>
                                    {course.course_name}
                                </option>
                            ))}
                        </select>
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
                            disabled={isLoading || importData.file.length === 0 || !importData.college || !importData.course}
                        >
                            {isLoading ? 'Importing...' : 'Import'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('portal')
    )
}

export default PatronImport