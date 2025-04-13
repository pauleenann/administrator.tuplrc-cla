import React, { useEffect, useState } from 'react'
import './ViewItem.css'
import { Link } from 'react-router-dom'
import CatalogInfo from '../CatalogInfo/CatalogInfo'
import Cataloging from '../Cataloging/Cataloging'

const ViewItem = () => {
    const [disabled, setdisabled] = useState(true) 
  return (
    <div className='view-item-container'>
        <h1 className='m-0'>Cataloging</h1>

        <div className='view-item-path-button'>
            <Link to='/catalog'>
                <button className='view-item-back-button'>
                    <i class="fa-solid fa-arrow-left"></i>
                    <p>Back</p>
                </button>
            </Link>
            <div className="view-item-path">
                <p>Cataloging / <span>View Item</span></p>
            </div>
        </div>

        <div className='item-information'>
            {/* will disable input fields */}
            <CatalogInfo disabled={disabled}/>
        </div>

        <div className="cataloging">
            {/* will disable input fields */}
            <Cataloging disabled={disabled}/>
        </div>

        <div className="edit">
            <button className="view-item">
                <i class="fa-regular fa-pen-to-square"></i>
                <span>Edit</span>
            </button>
        </div>
      
    </div>
  )
}

export default ViewItem
