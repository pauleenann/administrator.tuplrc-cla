import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './CatalogFilterModal.css'
import AddedFilter from '../AddedFilter/AddedFilter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdvancedSearchResources, setAdvancedSearch } from '../../features/advancedSearchSlice';
import { useNavigate } from 'react-router-dom';

const CatalogFilterModal = ({open, close}) => {
    const navigate = useNavigate()
    const [searchPerformed, setSearchPerformed] = useState(false)
    const {advancedSearch,loading} = useSelector(state=>state.advancedSearch)
    const isOnline = useSelector(state => state.isOnline.isOnline)
    const [selectedType, setSelectedType] = useState('any')
    const [initialFilter, setInitialFilter] = useState({
        filter:'title',
        condition:'contains',
        input:''
    })
    const [addedFilters, setAddedFilters] =useState([])
    const filters = [
        'title',
        'ISBN',
        'publisher',
        'publication year',
        'author',
        'department',
        'topic'
    ]
    const filterCondition = [
        'contains',
        'starts with',
        'equals'
    ]
    const resourceType = [
        'any',
        'book',
        'journal',
        'newsletter',
        'thesis'
    ]
    const tableHeader = [
        'title',
        'type',
        'authors',
        'department',
        'topic',
        'copies'
    ]
    const dispatch = useDispatch();

    // handle changes
    const handleInitialFilter = (e)=>{
        const {name, value} = e.target

        setInitialFilter((prevdata)=>({
            ...prevdata,
            [name]:value
        }))
    }

    const handleAddFilter = ()=>{
        setAddedFilters([...addedFilters,{
                logic:'and',
                filter:'title',
                condition:'contains',
                input:''
            }])
    }
    
    const handleAddFilterChange = (data,index)=>{
        const updatedAddedFilter = [...addedFilters]
        updatedAddedFilter[index] = data;
        setAddedFilters(updatedAddedFilter);
    }

    const handleRemoveFilter = (indexToRemove)=>{
        setAddedFilters(addedFilters.filter((_,index)=>index!==indexToRemove))
    }

    // fetch search
    const handleSearch = ()=>{
        setSearchPerformed(true)
        dispatch(fetchAdvancedSearchResources({initialFilter,addedFilters, selectedType}))
    }
     

    console.log(initialFilter)
    console.log(addedFilters)
    console.log(advancedSearch)
    

    if(!open){
        return null
    }

    return ReactDom.createPortal(
        <div className='catfil-modal-container'>
            {/* overlay */}
            <div className="catfil-modal-overlay overlay" onClick={close}></div>

            {/* modal box */}
            <div className="catfil-modal-box">
                {/* header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Advanced Search</h1>
                    <button className="btn-close" onClick={()=>{
                        setSearchPerformed(false)
                        dispatch(setAdvancedSearch([]))
                        close();
                    }}>
                    </button>
                </div>
                
                <div className='row'>
                    <div className="col-9">
                        <h6 className="mb-3">Search Filter</h6>
                        {/* default filter */}
                        <div className='d-flex gap-2 mb-3'>
                            <select 
                                className='form-select w-50' 
                                onChange={handleInitialFilter}
                                name='filter'
                            >
                                {filters.map((item, index) => (
                                    <option key={index} value={item}>{item}</option>
                                ))}
                            </select>
                            <select 
                                className='form-select w-50'
                                onChange={handleInitialFilter}
                                name='condition'
                            >
                                {filterCondition.map((item, index) => (
                                    <option key={index} value={item}>{item}</option>
                                ))}
                            </select>
                            <input 
                                type="text" 
                                className='form-control w-100'
                                placeholder="Enter search value..."
                                name='input'
                                onChange={handleInitialFilter}
                            />
                        </div>
                        
                        {/* added filters */}
                        {addedFilters.length>0&&addedFilters.map((filter,index)=>(
                            <AddedFilter 
                                index={index}
                                filters={filters} 
                                filterCondition={filterCondition}
                                handleAddFilterChange={(data)=>handleAddFilterChange(data,index)}
                                handleRemoveFilter={()=>handleRemoveFilter(index)}
                            />
                        ))}
                        
                        
                        {/* add filter button */}
                        <button 
                            className='btn mt-2 d-flex align-items-center gap-2 add-filter'
                            onClick={handleAddFilter}
                        >
                            <FontAwesomeIcon icon={faPlus} className='icon' />
                            Add a new line
                        </button>
                    </div>
                    
                    <div className="col">
                        <h6 className="mb-3">Limit results by</h6>
                        {/* resource type */}
                        <select 
                            className='form-select w-100 mb-3'
                            onChange={(e)=>setSelectedType(e.target.value)}
                        >
                            {resourceType.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Action buttons */}
                <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                    <button className="btn btn-secondary me-2" onClick={()=>{
                        setSearchPerformed(false)
                        dispatch(setAdvancedSearch([]))
                        close();
                    }}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSearch}>
                        Apply Filters
                    </button>
                </div>

                {/* table */}
                {advancedSearch.length>0?(
                    <table className='mt-3'>
                        <thead>
                            <tr>
                                {tableHeader.map(item=>(
                                    <td className='text-capitalize'>
                                        {item}
                                    </td>  
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {advancedSearch&&advancedSearch.map((item,key)=>(
                                <tr key={key} onClick={() => navigate(`/catalog/view/${item.resource_id}`)}>
                                    <td>{item.resource_title}</td>
                                    <td>{item.type_name}</td>
                                    <td>
                                    {Array.isArray(item.author_names) && item.author_names.length > 0 
                                    ? item.author_names.join(', ') 
                                    : (item.author_names || 'N/A')}
                                    </td>
                                    <td>{item.dept_name}</td>
                                    <td>
                                    {item.topic_name
                                        ? item.topic_name 
                                        : 'N/A'}
                                    </td>
                                    <td>
                                    {isOnline? `${item.resource_quantity}/${item.original_resource_quantity}`:`${item.resource_quantity}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ):searchPerformed && advancedSearch.length === 0 && (
                    <div className='text-center'>
                        <FontAwesomeIcon icon={faExclamationCircle} className='fs-2'/>
                        <p className="m-0">Resource not found<br/>Please try another filter.</p>
                    </div>)}
            </div>      
        </div>,
        document.getElementById('portal')
    )
}

export default CatalogFilterModal