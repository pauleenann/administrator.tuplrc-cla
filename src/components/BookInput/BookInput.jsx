import React, { useEffect, useRef, useState } from 'react'
import './BookInput.css'
import AuthorInput from '../AuthorInput/AuthorInput'
import PublisherModal from '../PublisherModal/PublisherModal'
import Select from 'react-select'
import { useSelector } from 'react-redux'

const BookInput = ({disabled,handleChange,bookData,addAuthor,setBookData,formValidation,error,handleAddAuthor,selectedOptions,deleteAuthor}) => {
    const [open, setOpen] = useState(false)
    // dito ko muna isstore ung publisher details then kapag clinick ung save, tsaka lang sya masstore sa bookdata
    const [publisherDetails, setPublisherDetails] = useState({})
    const searchInputRef = useRef(null); // Create a ref for the input
    const {publisher} = useSelector(state=>state.publisher)
    
      useEffect(() => {
        searchInputRef.current?.focus(); // Automatically focus on mount
      }, []);
    
    useEffect(()=>{
        if(bookData.isbn&&!disabled){
               getBookData(); 
        }
        
    },[bookData.isbn])

    useEffect(() => {
        if (bookData.publisher==='') {
          setPublisherDetails({});
        }
      }, [bookData.publisher]);
    
    // handle publisher
    const handlePublisher = (e) =>{
        const {name,value} = e.target
        setPublisherDetails({...publisherDetails,[name]:value
        })
    }
    // for getting info sa google books api
    const getBookData = async()=>{
        try{
                const response = await fetch(`http://localhost:3001/api/isbn/${bookData.isbn}`).then(data=>data.json()).then(data=>data.items[0].volumeInfo)
                console.log(response);
                // // store retrieve data sa book object
                setBookData((prevdata)=>({
                    ...prevdata,
                    title: response.title || '',
                    authors: response.authors || [],
                    publishedDate: response.publishedDate || '',
                    url: response.imageLinks?response.imageLinks.thumbnail :'',
                    description: response.description || ''
                }))
            }catch(err){
                console.log(err.message)
            }
        
    }

    const handleSelectedPublisher = (item)=>{
        console.log(item)
        if(item){
            setBookData((prevdata)=>({...prevdata,
                publisher_id:item.value,
                publisher: '',
                publisher_address:'',
                publisher_email:'',
                publisher_number:'',
                publisher_website:'',
            }))
        }else{
            setBookData({...bookData,publisher_id:0})
        }       
    }

    const resetPublisher = ()=>{
        setBookData((prevdata)=>({
            ...prevdata,
            publisher_id:0,
            publisher: '',
            publisher_address:'',
            publisher_email:'',
            publisher_number:'',
            publisher_website:'',
        }))
    }

    console.log(bookData.isbn)
  return (
    <div className='row'>
        {/* author */}
        <div className="col-6 info-input-box">
            <label htmlFor="">Author/s *</label>
            {/* author box */}
            <AuthorInput 
                disabled={disabled} 
                handleChange={handleChange} 
                bookData={bookData} 
                addAuthor={addAuthor} 
                setBookData={setBookData} 
                handleAddAuthor={handleAddAuthor} 
                selectedOptions={selectedOptions} 
                deleteAuthor={deleteAuthor} 
                formValidation={formValidation}
            />
            <p className="resource-error">{error.authors?error.authors:''}</p>
        </div>
        {/* isbn, publisher, publish date */}
        <div className="col-6 info-input-box">
            <div className="row">
                {/* isbn */}
                <div className="col-12 info-input-box mb-3">
                    <label htmlFor="">ISBN</label>
                    <input 
                        type="number" 
                        placeholder='Enter ISBN' 
                        disabled={disabled}
                        onChange={handleChange} 
                        name='isbn' 
                        value={bookData.isbn?bookData.isbn:''} 
                        // onBlur={formValidation} 
                        ref={searchInputRef}/>
                    <p className="resource-error">{error.isbn?error.isbn:''}</p>
                </div>
                {/* publisher */}
                <div className="col-12 info-input-box mb-3">
                    <label htmlFor="">Publisher</label>
                    {bookData.publisher&&bookData.publisher.length >=1?
                       <div>
                        <input 
                            type="text" 
                            value={bookData.publisher} 
                            name='publisher' 
                            onChange={resetPublisher} 
                            // onBlur={formValidation} 
                            disabled={disabled}/> 
                       </div> 
                         
                   :<Select  
                    options={publisher}
                    placeholder="Search publisher"
                    classNamePrefix="select"
                    isClearable
                    onChange={handleSelectedPublisher}
                    // onBlur={formValidation}
                    isDisabled={disabled}
                    />}

                    <span className='add-publisher'>Publisher not listed? Please <button className='add-publisher-button' onClick={()=>{disabled?setOpen(false):setOpen(true)}} >"add publisher here"</button> first.</span>
                    <p className="resource-error">{error.publisher?error.publisher:''}</p>
                    
                </div>
                {/* publisher date*/}
                <div className="col-12 info-input-box mb-3">
                    <label htmlFor="">Publish Date *</label>
                    {/* <input type="date" name="" id="" placeholder='Select date' disabled={disabled?true:false}/> */}
                    <input 
                        type="text" 
                        name="publishedDate" 
                        id="" 
                        placeholder='Enter Date' 
                        disabled={disabled?true:false} 
                        onChange={handleChange} 
                        value={bookData.publishedDate?bookData.publishedDate:''} 
                        // onBlur={formValidation} 
                        maxLength={4}
                    />
                    <p className="resource-error">{error.publishedDate?error.publishedDate:''}</p>
                </div>
            </div>
        </div>
        <PublisherModal open={open} close={()=>setOpen(!open)} handleChange={handleChange} bookData={bookData} setBookData={setBookData} publisherDetails={publisherDetails} handlePublisher={handlePublisher}/>
    </div>
  )
}

export default BookInput
