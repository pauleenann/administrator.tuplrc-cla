import React, { useEffect, useState } from 'react'
import './CatalogInfo.css'
import BookInput from '../BookInput/BookInput'  
import JournalInput from '../JournalInput/JournalInput'
import ThesisInput from '../ThesisInput/ThesisInput'
import {useParams} from 'react-router-dom';
import { useSelector } from 'react-redux'


const CatalogInfo = ({disabled,handleChange,bookData,addAuthor,addAdviser,setBookData,handleFileChange,error,formValidation,handleAddAuthor,selectedOptions,deleteAuthor,deleteAdviser,editMode}) => {
    // disabled is passed by the viewItem component. This disables the input fields so users can only access the page in view mode 
    const [preview,setPreview] =useState() //for preview kapag pumili ng photo or may naretrieve na photo
    const {id} = useParams();
    const {status} = useSelector(state=>state.status)
    const {type} = useSelector(state=>state.type)

    //for displaying preview photo/hindi pa nasasave
    useEffect(() => {
        if(!bookData.file) return;

        let objectUrl;

        if(!id || editMode){
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
        }else{
            try{
                objectUrl = URL.createObjectURL(bookData.file);
                setPreview(objectUrl);
            }catch{
                if (bookData.file.includes("http://books.google.com")) {
                    setPreview(bookData.file);
                } else {
                    setPreview(`https://api.tuplrc-cla.com/${bookData.file}`);
                }
            }
        }

         // Cleanup function to revoke the Object URL
         return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
          };
    }, [bookData.file]);
    

      useEffect(()=>{
        if(bookData.url){
            setPreview(bookData.url);
        }
         // Cleanup function to revoke the Object URL
         return () => {
            URL.revokeObjectURL(bookData.url);
          };
      },[bookData.url])

      console.log(preview)
   
  return (
    <div className='cat-info shadow-sm'>
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
                            <select name="mediaType" id="" className='form-select' disabled={disabled} onChange={handleChange} value={bookData.mediaType}>
                                 {type.length>0?type.map(item=>(
                                    <option value={item.type_id} selected={disabled||editMode?item.type_id==bookData.mediaType:''}>{item.type_name}</option>
                                )):''}                                 
                            </select>
                           
                        </div>
                        {/* quantity */}
                        <div className="col-4 info-input-box">
                            <label htmlFor="">Quantity *</label>
                            <input 
                                type="number" 
                                placeholder='Enter Quantity' 
                                min='0' disabled={disabled} name='quantity'
                                onChange={handleChange} 
                                value={bookData.quantity?bookData.quantity:''} 
                                // onBlur={formValidation}
                            />
                            <p className='resource-error'>{error.quantity}</p>
                        </div>
                        {/* status */}
                        <div className="col-4 info-input-box">
                            <label htmlFor="">Status *</label>
                            <select 
                                name="status" id="" className='form-select' 
                                disabled={disabled} 
                                onChange={handleChange}
                                value={bookData.status}
                                // onBlur={formValidation}
                            >   
                                <option selected disabled value=''>Select item status</option>
                                {status?status.map(item=>(
                                     <option value={item.avail_id} selected={disabled?item.avail_id==bookData.status:''}>{item.avail_name}</option>
                                )):''}
                            </select>
                            <p className='resource-error'>{error.status}</p>
                        </div>
                        {/* title */}
                        <div className="col-12 info-input-box my-3">
                            <label htmlFor="">Title *</label>
                            <input 
                                type="text" 
                                placeholder='Enter Title' 
                                disabled={disabled} 
                                name='title' 
                                onChange={handleChange} 
                                value={bookData.title?bookData.title:''} 
                                // onBlur={formValidation}
                            />
                            <p className='resource-error'>{error.title}</p>
                        </div>
                        {/* input field changes depending on type */}
                        <div className="col-12">
                            {bookData.mediaType==2||bookData.mediaType==3
                            ?<JournalInput 
                                disabled={disabled} 
                                handleChange={handleChange} 
                                bookData={bookData} 
                                addAuthor={addAuthor} 
                                setBookData={setBookData} 
                                formValidation={formValidation} 
                                error={error}
                                handleAddAuthor={handleAddAuthor}
                                selectedOptions={selectedOptions} 
                                deleteAuthor={deleteAuthor}/>
                            :bookData.mediaType==4?
                            <ThesisInput 
                                disabled={disabled} 
                                handleChange={handleChange} 
                                bookData={bookData} 
                                addAuthor={addAuthor}
                                setBookData={setBookData} 
                                handleAddAuthor={handleAddAuthor} 
                                selectedOptions={selectedOptions} 
                                deleteAuthor={deleteAuthor} 
                                addAdviser={addAdviser} 
                                deleteAdviser={deleteAdviser} 
                                formValidation={formValidation} 
                                error={error}/>
                            :<BookInput 
                                disabled={disabled} 
                                handleChange={handleChange} 
                                bookData={bookData} 
                                addAuthor={addAuthor} 
                                setBookData={setBookData} 
                                formValidation={formValidation} 
                                error={error}
                                handleAddAuthor={handleAddAuthor}
                                selectedOptions={selectedOptions} 
                                deleteAuthor={deleteAuthor} 
                            />}
                        </div>      
                    </div>

                </div>

                {/* for cover */}
                {bookData.mediaType!=='4'?<div className="col-3">
                    {/* cover */}
                    <div className="col-12 info-input-box mb-3">
                        <label htmlFor="">Cover</label>
                        <input 
                            type="file" 
                            src="" 
                            alt="" 
                            className='cover-upload' id='cover' disabled={disabled} 
                            onChange={handleFileChange} 
                            onBlur={formValidation}/>
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
