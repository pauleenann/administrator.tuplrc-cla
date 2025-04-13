import React from 'react'
import ReactDom from 'react-dom'
import './Loading.css'

const Loading = ({loading}) => {
    if(loading === false){
        return null
    }
  return ReactDom.createPortal(
    <div className='loading-container'>
        <div className="loading-modal-overlay">
            <div class="spinner-grow text-danger" role="status">
                <span class="sr-only"></span>
            </div>
        </div>
    </div>,
    document.getElementById('portal')
  )
}

export default Loading
