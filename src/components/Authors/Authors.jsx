import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus,faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import './Authors.css'

const Authors = () => {
  return (
    <div className='authors-container'>
      <h1>Authors</h1>
      <div className='authors-content'>
        {/* search and add authors */}
        <div className='d-flex justify-content-between'>
          <input type="text" name="" id="" placeholder='Search Author' className='search'/>
          <button className='add-author btn' >
            <FontAwesomeIcon icon={faPlus} className='icon'/>
            Add author
          </button>
        </div>

        <div className='d-flex flex-column gap-2 authors'>
          {/* header */}
          <div className='author-header'>
            <div>First name</div>
            <div>Last name</div>
            <div>No. of Books written</div>
          </div>

          {/* author details */}
          <div className='author-details'>
            <p>Author fname</p>
            <p>Author lname</p>
            <p>8</p>
          </div>
        </div>

        {/* pagination */}
        <div className='d-flex justify-content-between align-items-center pagination'>
          <div>Page 1 of 1</div>
          <div className='d-flex'>
            <button className='btn'>
              <FontAwesomeIcon icon={faArrowLeft} className='icon'/></button>
            <button className='btn'>
              <FontAwesomeIcon icon={faArrowRight} className='icon'/>
            </button>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default Authors
