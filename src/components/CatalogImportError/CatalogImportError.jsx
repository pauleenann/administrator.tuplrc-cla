import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './CatalogImportError.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

const CatalogImportError = ({open, close, invalidResources}) => {
    

    if (!open) {
        return null;
    }

    return ReactDom.createPortal(
        <div className='import-error-container z-3'>
            <div className="import-error-overlay"></div>

            {/* modal box */}
            <div className="import-error-box p-4">
                {/* header */}
                <div className='d-flex align-items-center justify-content-between'>
                    <h4 className='m-0'></h4>
                    <FontAwesomeIcon icon={faX} className="cursor-pointer" onClick={close}/>
                </div>
                
                {/* body */}
                <div className='mt-4 d-flex flex-column gap-3'>
                    <div className="alert alert-danger">
                        Failed to import some resource/s due to the following reasons:
                    </div>
                    <div className="data-box">  
                        {invalidResources.map((item, index) => (
                            <div className="row mt-2" key={index}>
                                <div className=" fw-semibold">
                                    {item.title}:
                                </div>
                                <div className=" text-danger">
                                    {item.reason}
                                    {item.missingFields && (
                                        <ul>
                                            {item.missingFields.map((field, fieldIndex) => (
                                                <li key={fieldIndex}>{field}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}       
                    </div>
                                 
                </div>
            </div>
        </div>,
        document.getElementById('portal')
    )
}

export default CatalogImportError