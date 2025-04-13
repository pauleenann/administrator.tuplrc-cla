import React, { useEffect, useState } from 'react';
import './AddItem.css';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import CatalogInfo from '../CatalogInfo/CatalogInfo';
import Cataloging from '../Cataloging/Cataloging';
import axios from 'axios';
import Loading from '../Loading/Loading';
import { initDB } from '../../indexedDb/initializeIndexedDb';
import { getAllFromStore } from '../../indexedDb/getDataOffline';
import { saveResourceOffline } from '../../indexedDb/saveResourcesOffline';
import { viewResourcesOffline } from '../../indexedDb/viewResourcesOffline';
import { editResourceOffline } from '../../indexedDb/editResourcesOffline';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import { fetchTypeOffline, fetchTypeOnline } from '../../features/typeSlice';
import { fetchStatusOffline, fetchStatusOnline } from '../../features/statusSlice';
import { fetchPublisherOffline, fetchPublisherOnline } from '../../features/publisherSlice';
import { fetchAuthorOffline, fetchAuthorOnline } from '../../features/authorSlice';
import { fetchAdviserOnline } from '../../features/adviserSlice';

const AddItem = () => {
    //pag may id, nagiging view ung purpose ng add item component
    const {id} = useParams()
    const {username} = useSelector(state=>state.username)
    const navigate = useNavigate()
    // initialize offline database
    const [disabled,setDisabled] = useState(false)
    const [bookData, setBookData] = useState({
        mediaType: '1',
        authors: [],
        genre: [],
        isCirculation: 1,
        publisher_id: 0,
        publisher: '',
        status:''
    });
    const [error, setError] = useState({});
    // for loading modal
    const [loading,setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [isOfflineView, setIsOfflineView] = useState(false)
    const isOnline = useSelector(state=>state.isOnline.isOnline)
    const dispatch = useDispatch();

    useEffect(() => {
        setError({});
        if(!disabled&&!isOfflineView){
            if (bookData.mediaType== 1) {
                setBookData({
                    mediaType: bookData.mediaType, // keep the changed mediaType
                    authors: [],
                    isCirculation: 1,
                    publisher_id: 0,
                    publisher: '',
                    status:''
                });
            } else {
                setBookData({
                    mediaType: bookData.mediaType, // keep the changed mediaType
                    authors: [],
                    isCirculation: 0,
                    status:''
                });
            }
        }
    }, [bookData.mediaType]);

    useEffect(() => {
        if (isOnline == null) {
            return;
        }
        
        // initDB();
         // Initialize online/offline state
        if (isOnline) {
            getDataOnline();
        } else {
            getDataOffline();
        }

        // Handle resource view logic (inside useEffect)
        if (id) {
            setDisabled(true);
            // Check if online or offline after setting the state
            if(isOnline) {
                getDataOnline();
                viewResourceOnline();
            }else{
                getDataOffline();
                viewResourceOffline();
            }
        }
    }, [id, isOnline]);  // Add `id` as a dependency to run the effect when `id` changes
    
    console.log('isonline? ', isOnline)

    const getDataOnline = ()=>{
        dispatch(fetchTypeOnline());
        dispatch(fetchStatusOnline());
        dispatch(fetchPublisherOnline());
        dispatch(fetchAuthorOnline());
        dispatch(fetchAdviserOnline());
    }

    const getDataOffline = ()=>{
        dispatch(fetchTypeOffline())
        dispatch(fetchStatusOffline())
        dispatch(fetchPublisherOffline())
        dispatch(fetchAuthorOffline())
        dispatch(fetchAdviserOnline())
    }
   
/*-------------------VIEW RESOURCE---------------------- */
    const viewResourceOnline = async()=>{
        console.log('view resource')
        try{
            const response = await axios.get(`http://localhost:3001/api/resources/${id}`);
           
            const data = response.data[0]
            const mediaType = data.type_id.toString();
            console.log(mediaType)
            console.log(data)
            // set bookData based on media type
            switch(mediaType){
                case '1':
                    setBookData((prevdata)=>({
                        ...prevdata,
                        mediaType:mediaType,
                        authors:data.author_names.split(', '),
                        description:data.resource_description,
                        quantity:data.original_resource_quantity.toString(),
                        title:data.resource_title.toString(),
                        isbn:data.book_isbn?data.book_isbn.toString():'',
                        status:data.avail_id.toString(),
                        publisher_id:data.pub_id,
                        publisher: data.pub_name?data.pub_name.toString():'',
                        file:data.filepath,
                        publishedDate:data.resource_published_date.toString(),
                        department: data.dept_id.toString(),
                        topic:data.topic_id.toString(),
                        isCirculation:data.resource_is_circulation,
                    }))
                    break;
                    
                case '2':
                case '3':
                    setBookData((prevdata)=>({
                        ...prevdata,
                        mediaType:mediaType,
                        authors:data.author_names.split(', '),
                        description:data.resource_description,
                        quantity:data.original_resource_quantity.toString(),
                        title:data.resource_title.toString(),
                        status:data.avail_id.toString(),
                        file:data.filepath,
                        publishedDate:data.resource_published_date.toString(),
                        department: data.dept_id.toString(),
                        topic:data.topic_id.toString(),
                        volume: data.jn_volume.toString(),
                        issue: data.jn_issue.toString(),
                        isCirculation:data.resource_is_circulation,
                    }))
                    break;

                case '4':
                    setBookData((prevdata)=>({
                        ...prevdata,
                        mediaType:mediaType,
                        authors:data.author_names.split(', '),
                        adviser:data.adviser_name,
                        description:data.resource_description,
                        quantity:data.original_resource_quantity.toString(),
                        title:data.resource_title.toString(),
                        status:data.avail_id.toString(),
                        publishedDate:data.resource_published_date.toString(),
                        department: data.dept_id.toString(),
                        isCirculation:data.resource_is_circulation,
                    }))
                    break;

                default:
                    console.log('Media type not allowed.')
            }
            
        }catch(err){
            console.log('Cannot view resource. An error occurred: ', err.message)
        }
    }

    const viewResourceOffline = async()=>{
        console.log('viewing resource offline')
        setIsOfflineView(true)
        await viewResourcesOffline(parseInt(id),setBookData)
        
    }

    console.log(bookData)
/*-------------------HANDLE CHANGES---------------------- */
    useEffect(()=>{
        if(Object.keys(error).length>0){
            formValidation();
        }
    },[error])

    useEffect(()=>{
        if(!isOfflineView){
            setBookData((prevData)=>({
                ...prevData,
                topic:''
            }))
        }
    },[bookData.department])

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData({ ...bookData, [name]: value });
    };
    // Add author
    const addAuthor = (author) => {
        if (author.length !== 1) {
            if(!bookData.authors.includes(author)){
                 setBookData((prevData) => ({
                    ...prevData,
                    authors: [...prevData.authors, author]
                }));
                return true
            }else{
                console.log('you inserted it already!')
            }
           
        } else {
            console.log('Please enter valid author data');
        }
    };
    // delete author 
    const deleteAuthor = (index)=>{
        //(_,i) is the index of each element in authors
        //pag true ung condition marereturn sa updatedAuthors
        setBookData(prevData => ({
            ...prevData,
            authors: prevData.authors.filter((_, i) => i !== index)
          }));
    }
    // delete adviser 
    const deleteAdviser = ()=>{
        setBookData(prevData => ({
            ...prevData,
            adviser: ''
        }));
    }

    // Add adviser
    const addAdviser = (adviser) => {
        console.log(adviser)
        setBookData((prevdata)=>({
            ...prevdata,
            adviser: adviser
        }))
    };
    // Handle file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];  // Get the first file from the input
        setBookData((prevData) => ({
            ...prevData,
            file: file  
        }));
    };
    
    // Handle toggle buttons
    const handleToggle = (e) => {
        const { name, checked } = e.target;
        setBookData((prevData) => ({
            ...prevData,
            [name]: checked?1:0
        }));
    };

/*-------------------FORM VALIDATION---------------------- */
    // Form validation
    const formValidation = () => {
        const err = {};

        if (!bookData.quantity || bookData.quantity === 0) {
            err.quantity = 'Please enter quantity';
        }
        if (!bookData.status) {
            err.status = 'Please select status';
        }
        if (!bookData.title || bookData.title.length === 0) {
            err.title = 'Please enter title';
        }
        // if (!bookData.description) {
        //     err.description = 'Please enter description';
        // }
        if (!bookData.department) {
            err.department = 'Please select department';
        }

        if (!bookData.authors || bookData.authors.length == 0) {
            err.authors = 'Please specify author/s';
        }

        const yearRegex = /^\d{4}$/;
        if (!yearRegex.test(bookData.publishedDate)) {
            err.publishedDate = "Please enter publish date in 'YYYY' format";
        }

        if (bookData.mediaType === '1'|| bookData.mediaType==='2'||bookData.mediaType==='3') {
            if (!bookData.topic) {
                err.topic = 'Please select topic';
            }
        }else {
            if(!bookData.adviser){
                err.adviser = 'Please specify adviser';

            }
        }

        setError(err);

        return Object.keys(err).length === 0;
    };

/*----------------SAVE RESOURCE-------------------- */
    // save resource online
    const handleSaveResourceOnline = async () => {
        if (formValidation() === true) {
            setLoading(true)
            try{
                const formData = new FormData();
                formData.append('username', username);
                Object.entries(bookData).forEach(([key, value]) => {
                    formData.append(key, value);
                }
            );
                console.log(formData)
                const response = await axios.post('http://localhost:3001/api/resources', formData);
                console.log(response)
                 // close loading
                 setLoading(false)

                 //handle status
                if(response.data.status==409){
                    window.toast.fire({icon:"warning", title:"Resource already exist"})
                }else if(response.data.status==201){
                    navigate('/catalog')
                    window.toast.fire({icon:"success", title:"Resource added successfully"})
                }
               
                 // Reset bookData if saved successfully
                 setBookData({
                    mediaType: 'book',
                    authors: [],
                    isCirculation: 1,
                    publisher_id: 0,
                    publisher: ''
                });

            }catch(err){
                window.toast.fire({icon:"error", title:"Cannot save resource"})
            }
        } else {
            window.toast.fire({icon:"warning", title:"Please enter complete information"})
        }
    };

    //save resource offline
    const handleSaveResourceOffline = async ()=>{
        if (formValidation() === true) {
            setLoading(true)
            
            try{
                const updatedBookData = {
                    ...bookData,      // Spread the existing bookData
                    username: username // Add the username to the bookData object
                };

                const response = await saveResourceOffline(updatedBookData);
                navigate('/catalog')
                window.toast.fire({icon:"success", title:"Resource added successfully"})
            }catch(err){
                window.toast.fire({icon:"error", title:"Cannot save resource offline"})
            }
        } else {
            window.toast.fire({icon:"warning", title:"Please enter complete information"})
        }
    }

/*-------------------EDIT RESOURCE---------------------- */
    // Handle resource save online
    const handleEditResourceOnline = async () => {
        console.log('edit resource online')
            try{
                setLoading(true)
                const formData = new FormData();
                formData.append('username', username);
                Object.entries(bookData).forEach(([key, value]) => {
                    formData.append(key, value);  
                });
                const response = await axios.put(`http://localhost:3001/api/resources/${id}`, formData);
                setLoading(false)
                if(response.data.status==201){
                    navigate('/catalog')
                    window.toast.fire({icon:"success", title:"Resource edited successfully"})
                }            
            }catch(err){
                window.toast.fire({icon:"error", title:"Cannot edit resource"})
            }
    };

    //handle resource save offline
    const handleEditResourceOffline = async () => {
        console.log('edit resource offline')
            try{
                setLoading(true)
                const response = await editResourceOffline(bookData,parseInt(id))
                navigate('/catalog')
                window.toast.fire({icon:"success", title:"Resource edited successfully"})
            }catch(err){
                window.toast.fire({icon:"error", title:"Cannot edit resource offline"})
            }
    };

    console.log(bookData)
    return (
        <div className='add-item-container bg-light'>
            <h1 className='m-0'>Cataloging</h1>

            <div className='add-item-path-button'>
                {/* <Link to='/catalog'> */}
                    <button onClick={() => navigate(-1)} className='btn add-item-back-button'>
                        Back
                    </button>
                {/* </Link> */}
                <div className="add-item-path">
                    <p>Cataloging / <span>{disabled?'View':editMode?'Edit':'Add new'} Item</span></p>
                </div>
            </div>

            <div className='item-information'>
                <CatalogInfo
                    disabled={disabled}
                    handleChange={handleChange}
                    bookData={bookData}
                    addAuthor={addAuthor}
                    addAdviser={addAdviser}
                    setBookData={setBookData}
                    handleFileChange={handleFileChange}
                    formValidation={formValidation}
                    error={error}
                    deleteAuthor={deleteAuthor}
                    deleteAdviser={deleteAdviser}
                    editMode={editMode}
                />
            </div>

            <div className="cataloging">
                <Cataloging
                    disabled={disabled}
                    handleChange={handleChange}
                    bookData={bookData}
                    handleToggle={handleToggle}
                    formValidation={formValidation}
                    error={error}
                    editMode={editMode}
                />
            </div>

            {disabled?<div className='edit-btn-cont'><button className="btn edit-item" onClick={()=>{
                setDisabled(false);
                setEditMode(true);
                setIsOfflineView(false);
                }}>
                    Edit
                </button></div>:<div className="cancel-save">
                <button className="btn add-item-cancel">
                    Cancel
                </button>
                <button className="btn add-item-save" onClick={()=>{
                    //if not in edit mode, save resource
                    if(!editMode){
                        if(isOnline){
                            handleSaveResourceOnline()
                        }else{
                            handleSaveResourceOffline()
                        }           
                    }else{
                        if(isOnline){
                            handleEditResourceOnline()
                        }else{
                            handleEditResourceOffline()
                        }
                        
                    }
                }} disabled={Object.values(error).length>=1&&!editMode}>
                    <FontAwesomeIcon icon={faFloppyDisk}/>
                    <span>Save</span>
                </button>
            </div>}
            
            <Loading loading={loading}/>
        </div>
    );
};

export default AddItem;
