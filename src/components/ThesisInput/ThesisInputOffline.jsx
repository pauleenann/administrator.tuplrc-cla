import React, { useState } from 'react'
import './ThesisInput.css'
import AuthorInput from '../AuthorInput/AuthorInput'
import AdviserModal from '../AdviserModal/AdviserModal'

const ThesisInputOffline = ({disabled,handleChange,bookData,addAuthor,addAdviser,authorOptions,setBookData,handleAddAuthor,selectedOptions,deleteAuthor,authorList,adviserList,deleteAdviser,error}) => {
    const [open,setOpen] = useState(false)
    
  return (
    <div className='row'>
        {/* author */}
        <div className="col-6 info-input-box">
            <label htmlFor="">Author/s *</label>
            {/* author box */}
            <AuthorInput disabled={disabled} handleChange={handleChange} bookData={bookData} addAuthor={addAuthor} authorOptions={authorOptions} setBookData={setBookData} handleAddAuthor={handleAddAuthor} selectedOptions={selectedOptions} deleteAuthor={deleteAuthor} authorList={authorList}/>
            <p className="resource-error">{error.authors?error.authors:''}</p>
        </div>
        {/* thesis adviser*/}
        <div className="col-6 info-input-box">
            <label htmlFor="">Adviser *</label>
            <div className="adviser-box">
                {/* adviser */}
                <div className="advisers">
                    {/* adviser name */}
                        <div className="adviser">
                            {bookData.adviser?
                                <span>{bookData.adviser}
                                {!disabled?<button className='delete-adviser' onClick={deleteAdviser}>x</button>:''}</span>
                            :''}
                            <button>
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                </div>
                    {/* button */}
                    <button className='add-adviser' onClick={()=>{disabled?setOpen(false):setOpen(!open)}} disabled={bookData.adviser?bookData.adviser.length>1:''}>
                        <i class="fa-solid fa-plus"></i>
                        <span>Add adviser</span>
                    </button>
                </div>
                <p className="resource-error">{error.adviser?error.adviser:''}</p>
            </div>
            

        {/* publish date */}
        <div className="col-6 info-input-box my-3">
            <label htmlFor="">Publish Date *</label>
            <input type="text" name="publishedDate" id="" placeholder='Select date' disabled={disabled?true:false} value={bookData.publishedDate?bookData.publishedDate:''} onChange={handleChange}/>
            <p className="resource-error">{error.publishedDate?error.publishedDate:''}</p>
        </div>
        <AdviserModal open={open} close={()=>setOpen(!open) } addAdviser={addAdviser} handleChange={handleChange} bookData={bookData} adviserList={adviserList} />
    </div>
  )
}

export default ThesisInputOffline
