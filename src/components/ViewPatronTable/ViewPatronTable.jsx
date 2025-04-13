import React, { useEffect, useState } from 'react'
import './ViewPatronTable.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowLeft, faArrowRight, faDownload, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import ViewPatronFilter from '../ViewPatronFilter/ViewPatronFilter';

const ViewPatronTable = ({header, title, data, exportXLSX}) => {
  const [filteredData, setFilteredData] = useState([])
  const [totalPages, setTotalPages] = useState(0);
  const [paginatedData, setPaginatedData] = useState([])
  const [currentPage, setCurrentPage] =useState(1);
  const [filter, setFilter] = useState({})
  const itemsPerPage = 5;
  
  useEffect(()=>{
    setTotalPages(Math.ceil(filteredData.length/itemsPerPage))
    setPaginatedData(filteredData.slice(
      (currentPage-1)*itemsPerPage,
      currentPage*itemsPerPage
    ))
  },[filteredData])

  const nextPage = ()=>{
    if(currentPage<totalPages){
      setCurrentPage(currentPage+1)
    }
  }

  const prevPage = ()=>{
    if(currentPage!=1){
      setCurrentPage(currentPage-1)
    }
  }

  const handleChange = (e)=>{
    const {value, name} = e.target;

    setFilter((prevdata)=>({
      ...prevdata,
      [name]:value
    }))
    
    
  }

  const search = ()=>{
      if(title=='Log History'){
        setFilteredData(data.filter(item=>
          (item.att_date>=filter.start_date&&item.att_date<=filter.end_date)||
          (item.att_log_in_time>=filter.start_time&&item.att_log_in_time<=filter.end_time)
        ))
      }else{
        setFilteredData(data.filter(item=>(
          (new Date(item.checkout_date).toLocaleDateString('en-CA')>=filter.start_borrowdate&&
          new Date(item.checkout_date).toLocaleDateString('en-CA')<=filter.end_borrowdate)
          ||
          (new Date(item.checkout_due).toLocaleDateString('en-CA')>=filter.start_duedate&&
          new Date(item.checkout_due).toLocaleDateString('en-CA')<=filter.end_duedate)
          ||
          ((item.checkin_date!=null&&new Date(item.checkin_date).toLocaleDateString('en-CA')>=filter.start_returndate)&&
          (item.checkin_date!=null&&new Date(item.checkin_date).toLocaleDateString('en-CA')<=filter.end_returndate))
          ||
          (item.overdue_days==filter.overdue)
        )))
      }
    
  }

  const reset = ()=>{
    setFilteredData(data)
    setFilter([])
  }

  const sortBook = (order) => {
    setFilteredData([...filteredData].sort((a, b) => 
      order === 'ascending' 
        ? a.resource_title.localeCompare(b.resource_title) 
        : b.resource_title.localeCompare(a.resource_title)
    ));
  };
  

  const getDropdownContent = (category)=>{
    switch(category){
      case "Date":
        return(
          <ViewPatronFilter handleChange={handleChange} start_name={'start_date'} end_name={'end_date'} type={'date'} search={search}/>
        );
      case "Borrow Date":
        return(
          <ViewPatronFilter handleChange={handleChange} start_name={'start_borrowdate'} end_name={'end_borrowdate'} type={'date'} search={search}/>
        );
      case "Due Date":
        return(
          <ViewPatronFilter handleChange={handleChange} start_name={'start_duedate'} end_name={'end_duedate'} type={'date'} search={search}/>
        );
      case "Return Date":
        return(
          <ViewPatronFilter handleChange={handleChange} start_name={'start_returndate'} end_name={'end_returndate'} type={'date'} search={search}/>
        );
      
        case "Time in":
        return(
          <ViewPatronFilter handleChange={handleChange} start_name={'start_time'} end_name={'end_time'} type={'time'} search={search}/>
        );

        case "Book/s Issued":
        return(
          <div>
            <li className='p-2' onClick={()=>sortBook('ascending')}>Sort by Ascending Order</li>
            <li className='p-2' onClick={()=>sortBook('descending')}>Sort by Descending Order</li>  
          </div>
          
        );

        case "Overdue Days":
        return(
          <li className='p-2 d-flex flex-column gap-1 align-items-start'>
            <p>Overdue days:</p>
            <input type="number" placeholder='Input overdue days' className='p-1' min='0' name='overdue' onChange={handleChange}/>
            <button className="btn search" onClick={search}>Search</button>
          </li>
        );

    default:
      return(
        <li className="p-2">
          <p className="m-0">No filters available</p>
        </li>
      )
    }
  }

  useEffect(()=>{
    if(data.length!=0){
      setFilteredData(data)
    }
  },[data])

  console.log(filter)

 
  return (
    <div className='view-patron-table-container d-flex flex-column gap-3'>
        <h4 className='m-0 fw-semibold'>{title}</h4>
        {/* search filter */}
        <div className='d-flex justify-content-between'>
          <div className='search-filter d-flex align-items-center gap-2'>
            {/* <input type="date" name="start_date" id="" onChange={handleChange}/>
            <span className='m-0'>to</span>
            <input type="date" name="end_date" id="" onChange={handleChange}/>
            <button className='btn search' onClick={search}>Search</button> */}
            <button className='btn search btn-warning shadow-sm' onClick={reset}>Clear filter </button>
          </div>
          <button className="btn export d-flex align-items-center gap-2 btn-success shadow-sm" onClick={exportXLSX}>
            <FontAwesomeIcon icon={faDownload}/>
            Export to Excel
          </button>
        </div>
        {/* table */}
        <table>
          <thead>
            {header.length!=0
            ?header.map(item=>(
                <td><div class="dropdown">
                <button class="btn text-white dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {item}
                </button>
                <ul className="dropdown-menu">
                  {getDropdownContent(item)}
                </ul>
              </div></td>
            ))
            :''}
          </thead>
          <tbody>
            {title=='Log History'?
              paginatedData.length!=0
              ?paginatedData.map(item=>(
                <tr>
                  <td>{item.att_date}</td>
                  <td>{item.att_log_in_time}</td>
                </tr>
              ))
              :
              <tr>
                <td colSpan="2" className='no-data-box text-center'>
                  <div className='d-flex flex-column align-items-center gap-2 my-3'>
                    <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
                    <span className='fw-semibold'>No resources available.</span>
                    {/* <button className='btn btn-secondary' onClick={reset}>Clear Filter</button> */}
                  </div>
                </td>
              </tr>
            :paginatedData.length!=0
            ?paginatedData.map(item=>(
              <tr>
                <td>{item.resource_title}</td>
                <td>{new Date(item.checkout_date).toLocaleDateString('en-CA')}</td>
                <td>{new Date(item.checkout_due).toLocaleDateString('en-CA')}</td>
                <td>{item.checkin_date==null
                  ?'Not returned yet'
                  :new Date(item.checkin_date).toLocaleDateString('en-CA')}</td>
                <td>{item.overdue_days}</td>
              </tr>
            ))
            :<tr>
            <td colSpan="5" className='no-data-box text-center'>
              <div className='d-flex flex-column align-items-center gap-2 my-3'>
                <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
                <span className='fw-semibold'>No resources available.</span>
                {/* <button className='btn btn-secondary' onClick={reset}>Clear Filter</button> */}
              </div>
            </td>
          </tr>}
            
          </tbody>
        </table>
        {/* pagination */}
        <div className='pagination d-flex justify-content-between align-items-center'>
          {/* page number */}
          <span>Page {currentPage} of {totalPages}</span>
          {/* buttons */}
          <div className='d-flex gap-1'>
            <button className="btn" onClick={prevPage} disabled={currentPage==1}><FontAwesomeIcon icon={faArrowLeft}/></button>
            <button className="btn" onClick={nextPage}disabled={currentPage==totalPages}><FontAwesomeIcon icon={faArrowRight}/></button>
          </div>
        </div>
    </div>
  )
}

export default ViewPatronTable
