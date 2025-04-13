import React, { useEffect, useState } from 'react'
import './CatalogInfo.css'
import BookInput from '../BookInput/BookInput'
// for the multi select input
import Select from 'react-select'
import JournalInput from '../JournalInput/JournalInput'
import ThesisInput from '../ThesisInput/ThesisInput'
import axios from 'axios'

const CatalogInfo = ({disabled,handleChange,bookData,addAuthor,setType,addGenre,addAdviser,setBookData,handleFileChange,error,formValidation,publishers,authorOptions,handleAddAuthor,selectedOptions,deleteAuthor,authorList,resourceType,adviserList,deleteAdviser,resourceStatus,genreList,editMode,isOnline}) => {
    // disabled is passed by the viewItem component. This disables the input fields so users can only access the page in view mode 
    const [preview,setPreview] =useState() //for preview kapag pumili ng photo or may naretrieve na photo

    //for displaying preview photo
    useEffect(()=>{
        if(!bookData.file) return;

        let objectUrl;
        try{
            objectUrl = URL.createObjectURL(bookData.file);
            setPreview(objectUrl);
        }catch{
            const blob = new Blob([new Uint8Array(bookData.file.data)], { type: 'image/jpeg' });
            objectUrl = URL.createObjectURL(blob);
            setPreview(objectUrl)
        }
            
        //reset URl
        //pag may naupload na file, wala dapat url
        setBookData((prevdata)=>({
            ...prevdata,
            url:''
        }))

         // Cleanup function to revoke the Object URL
         return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
          };
      },[bookData.file])

      useEffect(()=>{
        if(bookData.url){
            setPreview(bookData.url);
        }
         // Cleanup function to revoke the Object URL
         return () => {
            URL.revokeObjectURL(bookData.url);
          };
      },[bookData.url])

   
  return (
    <div className='cat-info'>
        <div className="row">
            {/* header */}
            <div className="col-12 cat-info-header">Information</div>

            <div className="row catalog-inputs">
                {/* first column - media-genre*/}
                <div className={bookData.mediaType!=='4'?'col-9':'col-12'}>
                    <div className="row">
                        {/* media type */}
                        <div className="col-4 info-input-box">
                            <label htmlFor="">Media Type *</label>
                            <select name="mediaType" id="" className='form-select' disabled={disabled} onChange={handleChange}>
                                 {resourceType.length>0?resourceType.map(item=>(
                                    <option value={item.type_id} selected={disabled||editMode?item.type_id==bookData.mediaType:''}>{item.type_name}</option>
                                )):''}                                 
                            </select>
                           
                        </div>
                        {/* quantity */}
                        <div className="col-4 info-input-box">
                            <label htmlFor="">Quantity *</label>
                            <input type="number" placeholder='Enter Quantity' min='0' disabled={disabled} name='quantity' onChange={handleChange} value={bookData.quantity?bookData.quantity:''} onBlur={formValidation}/>
                            <p className='resource-error'>{error.quantity}</p>
                        </div>
                        {/* status */}
                        <div className="col-4 info-input-box">
                            <label htmlFor="">Status *</label>
                            <select name="status" id="" className='form-select' disabled={disabled} onChange={handleChange} onBlur={formValidation}>   
                                <option selected disabled>Select item status</option>
                                {resourceStatus?resourceStatus.map(item=>(
                                     <option value={item.avail_id} selected={disabled?item.avail_id==bookData.status:''}>{item.avail_name}</option>
                                )):''}
                            </select>
                            <p className='resource-error'>{error.status}</p>
                        </div>
                        {/* title */}
                        <div className="col-12 info-input-box my-3">
                            <label htmlFor="">Title</label>
                            <input type="text" placeholder='Enter Title' disabled={disabled} name='title' onChange={handleChange} value={bookData.title?bookData.title:''} onBlur={formValidation}/>
                            <p className='resource-error'>{error.title}</p>
                        </div>
                        {/* input field changes depending on type */}
                        <div className="col-12">
                            {bookData.mediaType==='2'||bookData.mediaType==='3'?<JournalInput disabled={disabled} handleChange={handleChange} bookData={bookData} addAuthor={addAuthor} setBookData={setBookData} formValidation={formValidation} error={error} publishers={publishers} authorOptions={authorOptions} handleAddAuthor={handleAddAuthor}
                            selectedOptions={selectedOptions} deleteAuthor={deleteAuthor} authorList={authorList}/>:bookData.mediaType==='4'?<ThesisInput disabled={disabled} handleChange={handleChange} bookData={bookData} addAuthor={addAuthor} authorOptions={authorOptions} setBookData={setBookData} handleAddAuthor={handleAddAuthor} selectedOptions={selectedOptions} deleteAuthor={deleteAuthor} authorList={authorList} addAdviser={addAdviser} adviserList={adviserList} deleteAdviser={deleteAdviser} formValidation={formValidation} error={error}/>:<BookInput disabled={disabled} handleChange={handleChange} bookData={bookData} addAuthor={addAuthor} setBookData={setBookData} formValidation={formValidation} error={error} publishers={publishers} authorOptions={authorOptions} handleAddAuthor={handleAddAuthor}
                            selectedOptions={selectedOptions} deleteAuthor={deleteAuthor} authorList={authorList}/>}
                        </div>
                        {/* genre */}
                        {/* {bookData.mediaType==='1'?
                        <div className="col-12 info-input-box mb-3">
                            <label htmlFor="">Genre</label>
                            <Select
                                isMulti
                                name="genre"
                                options={genreList}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholder="Enter to add genre/s"
                                isDisabled={disabled}
                                onChange={(selected)=>{
                                    addGenre(selected);
                                    handleGenre(selected)
                                }}
                                onBlur={formValidation}
                                value={disabled?viewSelectedGenre:selectedGenre}
                            />
                            <p className='resource-error'>{error.genre}</p>
                        </div> 
                        :''} */}           
                    </div>

                </div>

                {/* for cover */}
                {bookData.mediaType!=='4'?<div className="col-3">
                    {/* cover */}
                    <div className="col-12 info-input-box mb-3">
                        <label htmlFor="">Cover</label>
                        <input type="file" src="" alt="" className='cover-upload' id='cover' disabled={disabled} onChange={handleFileChange} onBlur={formValidation}/>
                        <div className="cover-upload-box">
                            {(bookData.file || bookData.url)?'':<label htmlFor="cover">Add cover</label>}
                            {(bookData.file || bookData.url) && ( // Display the selected image if it exists
                                <div>
                                    <img src={preview}
                                    // Create a URL for the selected image
                                    alt="Selected"
                                    style={{ width: '200px', height: 'auto', marginTop: '10px' }} // Adjust the size as needed
                                    />
                                </div>
                                )}
                        </div>
                       <label htmlFor="cover" className='edit-cover'>Edit cover</label>
                    </div>
                    <p className='resource-error'>{error.file}</p>
                </div>:''}
                

                {/* description */}
                <div className="col-12">
                    {/* description */}
                    <div className="col-12 info-input-box mb-3">
                        <label htmlFor="">Description</label>
                        <textarea name="description" id="" disabled={disabled} onChange={handleChange} value={bookData.description?bookData.description:''} onBlur={formValidation}></textarea>
                        <p className='resource-error'>{error.description}</p>
                    </div>
                </div>

            </div>


        </div>
        
    </div>
  )
}

export default CatalogInfo
