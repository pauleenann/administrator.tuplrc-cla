import React from 'react';
import './DashboardTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router";

const DashboardTable = ({ header, data, type, loading }) => {
  const navigate = useNavigate();
  
  const handleClick = (id)=>{
    if(type=='overdue'){
      navigate(`/patron/view/${id}`)
    }else if(type=='books'){
      navigate(`/catalog/view/${id}`)
    }
  }

  const displayData = (item)=>{
    if(type=='overdue'){
      return(
        <>
          <td>{item.tup_id}</td>
          <td>{item.pname}</td>
          <td>{item.resource_id}</td>
          <td>{item.resource_title}</td>
          <td>{item.overdue_days}</td>
        </>
      )
    }else if(type=='books'){
      return(
        <>
          <td>{item.resource_id}</td>
          <td>{item.resource_title}</td>
          <td>{item.authors}</td>
          <td>{item.resource_quantity}</td>
        </>
      )
    }else{
      return(
        <>
          <td>{item.tup_id}</td>
          <td>{item.resource_title}</td>
          <td>{item.duedate}</td>
        </>
      )
    }
  }

  return (
    
    <table className='dashboard-table'>
      <thead>
        <tr>
          {header.map((item, index) => (
            <td key={index}>{item}</td>
          ))}
        </tr>
      </thead>
      <tbody>
      {loading ? (
        // Show skeleton rows while loading
        [...Array(5)].map((_, index) => (
          <tr key={index}>
            <td colSpan={header.length}>
              <div className='d-flex flex-column align-items-center gap-2 my-3 text-center'>
                <div className="skeleton skeleton-text"></div>
              </div>
            </td>
          </tr>
        ))
      ) : Array.isArray(data) && data.length !== 0 ? (
        data.map((item, rowIndex) => (
          <tr key={rowIndex} className={type !== 'issued' ? 'clickable' : ''} onClick={() => {
            if (type === 'overdue') {
              handleClick(item.patron_id);
            } else if (type === 'books') {
              handleClick(item.resource_id);
            }
          }}>
            {displayData(item)}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={header.length}>
            <div className='d-flex flex-column align-items-center gap-2 my-3 text-center'>
              <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
              <span className='fw-semibold'>No resources available<br/>for this category.</span>
            </div>
          </td>
        </tr>
      )}
    </tbody>
    </table>
  );
};

export default DashboardTable;
