import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './PublisherModal.css'

const PublisherModal = ({open,close,setBookData,publisherDetails,handlePublisher}) => {

    if(!open){
        return null
    }else{
        console.log('author-modal')
    }


    // handle save.Pag clinick ung save, masstore ung publisherdetails sa bookdata
    const handleSave = ()=>{
    
            setBookData((prevdata)=>({
                ...prevdata,
                publisher: publisherDetails.publisher || 'n/a',
                publisher_address:publisherDetails.publisher_address || 'n/a',
                publisher_email:publisherDetails.publisher_email || 'n/a',
                publisher_number:publisherDetails.publisher_number || 'n/a',
                publisher_website:publisherDetails.publisher_website || 'n/a',
                publisher_id:0
            }))
            close()
    }

    console.log(publisherDetails)

  return ReactDom.createPortal(
    <div className='publisher-modal-container'>
        {/* overlay */}
        <div className="publisher-modal-overlay"></div>

        {/* modal box */}
        <div className="publisher-modal-box">
            {/* header */}
            <div className="publisher-modal-header">
                <span>Add new publisher</span>
                <i class="fa-solid fa-xmark" onClick={close}></i>
            </div>
            {/* add publisher input */}
            <div className="row publisher-inputs">
                {/* add manually */}
                <div className="col-12 publisher-input">
                    <label htmlFor="">Publisher name</label>
                    <input type="text" name="publisher" id="" placeholder="Enter publisher's name " value={publisherDetails.publisher?publisherDetails.publisher:''} onChange={handlePublisher}/>
                </div>
                <div className="col-12 publisher-input">
                    <label htmlFor="">Publisher address</label>
                    <textarea name="publisher_address" id="" placeholder="Enter publisher's address " value={publisherDetails.publisher_address?publisherDetails.publisher_address:''} onChange={handlePublisher}></textarea>
                </div>
                <div className="col-12 publisher-input">
                    <label htmlFor="">Publisher website</label>
                    <input type="text" name="publisher_website" id="" placeholder="Enter publisher's website " value={publisherDetails.publisher_website?publisherDetails.publisher_website:''} onChange={handlePublisher} />
                </div>
                <div className="col-12 publisher-input">
                    <label htmlFor="">Publisher number</label>
                    <input type="text" name="publisher_number" id="" placeholder="Enter publisher's number " value={publisherDetails.publisher_number?publisherDetails.publisher_number:''} onChange={handlePublisher} />
                </div>
                <div className="col-12 publisher-input">
                    <label htmlFor="">Publisher email</label>
                    <input type="text" name="publisher_email" id="" placeholder="Enter publisher's email " value={publisherDetails.publisher_email?publisherDetails.publisher_email:''} onChange={handlePublisher} />
                </div>
                {/* button */}
                <div className="col-12 publisher-button">
                    <button className="publisher-cancel" onClick={close}>
                    Cancel
                    </button>
                    <button className="publisher-save" onClick={handleSave}>
                        Save
                    </button>
                </div>

            </div>
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default PublisherModal
