import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './ActivateModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faX} from '@fortawesome/free-solid-svg-icons'


const ActivateModal = ({open, close,uname, activateUser}) => {

    if(!open){
        return null
    }

  return ReactDom.createPortal(
    <div className='activate-modal-container'>
        {/* overlay */}
        <div className="activate-modal-overlay overlay"></div>

        {/* modal box */}
        <div className="activate-modal-box">
           {/* content */}
           <div className="content">
            <p className='label'>Are you sure you want to activate <span className='uname'>{uname}</span>?</p>
           </div>
            {/* buttons */}
            <div className="buttons">
                <div className="btn cancel-btn" onClick={close}>Cancel</div>
                <div className="btn acc-btn" onClick={activateUser}>Activate</div>
            </div>
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default ActivateModal
