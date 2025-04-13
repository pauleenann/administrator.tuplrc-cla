import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './DeactivateModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faX} from '@fortawesome/free-solid-svg-icons'


const DeactivateModal = ({open, close,uname,deactivateUser}) => {

    if(!open){
        return null
    }

    console.log(uname)
  return ReactDom.createPortal(
    <div className='deactivate-modal-container'>
        {/* overlay */}
        <div className="deactivate-modal-overlay overlay"></div>

        {/* modal box */}
        <div className="deactivate-modal-box">
  
           {/* content */}
           <div className="content">
            <p className='label'>Are you sure you want to deactivate <span className='uname'>{uname}</span>?</p>
            
           </div>
            {/* buttons */}
            <div className="buttons">
                <div className="btn cancel-btn" onClick={close}>Cancel</div>
                <div className="btn deac-btn" onClick={deactivateUser}>Deactivate</div>
            </div>
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default DeactivateModal

