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

const AddItem = () => {
    //pag may id, nagiging view ung purpose ng add item component
    const {id} = useParams()
    const [uname, setUname] = useState(null);
    const navigate = useNavigate()
    // initialize offline database
    const [disabled,setDisabled] = useState(false)
    const [type, setType] = useState('');
    const [bookData, setBookData] = useState({
        mediaType: '1',
        authors: [],
        genre: [],
        isCirculation: false,
        publisher_id: 0,
        publisher: '',
    });
    const [error, setError] = useState({});
    const [publishers, setPublishers] = useState([]);
    // authorlist and adviserlist are for the <Select>. These are the options to be displayed
    const [authorList, setAuthorList] = useState([]);
    const [adviserList, setAdviserList] = useState([]);
    // for loading modal
    const [loading,setLoading] = useState(false)
    const [resourceType,setResourceType]=useState([])
    // Reset bookData when mediaType changes
    //console.log(resourceId)
    const [resourceStatus,setResourceStatus] = useState([])
    const [editMode, setEditMode] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    const getUsername = async()=>{
        try {
          // Request server to verify the JWT token
          const response = await axios.get('http://localhost:3001/api/user/check-session', { withCredentials: true });
          console.log(response.data)
          // If session is valid, set the role
          if (response.data.loggedIn) {
            setUname(response.data.username);
          } else {
            setUname(null); // If not logged in, clear the role
          }
        } catch (error) {
          console.error('Error verifying session:', error);
          setUname(null); // Set null if there's an error
        }
      }

    useEffect(() => {
        getUsername();
        if(!disabled){
            if (bookData.mediaType== 1) {
                setBookData({
                    mediaType: bookData.mediaType, // keep the changed mediaType
                    authors: [],
                    isCirculation: false,
                    publisher_id: 0,
                    publisher: '',
                });
            } else {
                setBookData({
                    mediaType: bookData.mediaType, // keep the changed mediaType
                    authors: [],
                    isCirculation: false,
                });
            }
        }
    }, [bookData.mediaType]);

    useEffect(() => {
        const handleOnline = () => {
            getOnlineData();
            setIsOnline(true);
        };
    
        const handleOffline = () => {
            initDB();
            getOfflineData();
            setIsOnline(false);
        };
    
        // Initialize online/offline state
        if (navigator.onLine) {
            handleOnline();
        } else {
            handleOffline();
        }
    
        // Handle resource view logic (inside useEffect)
        if (id) {
            setDisabled(true);
            // Check if online or offline after setting the state
            if (navigator.onLine) {
                getOnlineData();
                viewResourceOnline();
            } else {
                getOfflineData();
                viewResourceOffline();
            }
        }
    }, [id]);  // Add `id` as a dependency to run the effect when `id` changes
    

    console.log('isOnline? ', isOnline)

/*-----------------INITIALIZE INPUT---------------------- */
    //get online data
    const getOnlineData = async ()=>{
        getType()
        getStatus()
        getPublishers()
        getAuthors()
        getAdvisers()
    }

    //get offline data
    const getOfflineData = async ()=>{
        // get type offline
        const types = await getAllFromStore('resourcetype');
        setResourceType(types);

        //get status offline
        const status = await getAllFromStore('availability');
        setResourceStatus(status)

        //get existing publishers offline
        getPublishersOffline()

        //get existing authors offline
        getAuthorsOffline()

        //get existing advisers offline
        getAdvisersOffline()
        
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
                        quantity:data.resource_quantity.toString(),
                        title:data.resource_title.toString(),
                        isbn:data.book_isbn?data.book_isbn.toString():'',
                        status:data.avail_id.toString(),
                        publisher_id:data.pub_id,
                        publisher: data.pub_name?data.pub_name.toString():'',
                        file:data.filepath,
                        publishedDate:data.resource_published_date.toString(),
                        department: data.dept_id.toString(),
                        topic:data.topic_id.toString(),
                        isCirculation:data.resource_is_circulation==0?false:true,
                    }))
                    break;
                    
                case '2':
                case '3':
                    setBookData((prevdata)=>({
                        ...prevdata,
                        mediaType:mediaType,
                        authors:data.author_names.split(', '),
                        description:data.resource_description,
                        quantity:data.resource_quantity.toString(),
                        title:data.resource_title.toString(),
                        status:data.avail_id.toString(),
                        file:data.filepath,
                        publishedDate:data.resource_published_date.toString(),
                        department: data.dept_id.toString(),
                        topic:data.topic_id.toString(),
                        volume: data.jn_volume.toString(),
                        issue: data.jn_issue.toString(),
                        isCirculation:data.resource_is_circulation==0?false:true,
                    }))
                    break;

                case '4':
                    setBookData((prevdata)=>({
                        ...prevdata,
                        mediaType:mediaType,
                        authors:data.author_names.split(', '),
                        adviser:data.adviser_name,
                        description:data.resource_description,
                        quantity:data.resource_quantity.toString(),
                        title:data.resource_title.toString(),
                        status:data.avail_id.toString(),
                        publishedDate:data.resource_published_date.toString(),
                        department: data.dept_id.toString(),
                        isCirculation:data.resource_is_circulation==0?false:true,
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
        await viewResourcesOffline(parseInt(id),setBookData)
    }

/*-------------------HANDLE CHANGES---------------------- */
    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData({ ...bookData, [name]: value });
        formValidation();
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
    // Add publisher
    const addPublisher = (publisher) => {
        if (publisher.length !== 1) {
            setBookData((prevData) => ({
                ...prevData,
                publisher
            }));
        } else {
            console.log('Please enter valid publisher data');
        }
    };
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
        if (!bookData.description) {
            err.description = 'Please enter description';
        }
        if (!bookData.department) {
            err.department = 'Please select department';
        }

        if (bookData.mediaType === '1') {
            if (!bookData.file&&!bookData.url) {
                err.file = 'Please select cover';
            }
            if (!bookData.authors || bookData.authors.length === 0) {
                err.authors = 'Please specify author/s';
            }
            // if (!bookData.isbn) {
            //     err.isbn = 'Please enter ISBN';
            // } 
            if (bookData.publisher_id === 0 && bookData.publisher === '') {
                err.publisher = 'Please enter publisher';
            }
            if (!bookData.publishedDate) {
                err.publishedDate = 'Please enter publish date';
            }
            if (!bookData.topic) {
                err.topic = 'Please select topic';
            }
        }else if(bookData.mediaType==='2'||bookData.mediaType==='3'){
            if (!bookData.file&&!bookData.url) {
                err.file = 'Please select cover';
            }
            if (!bookData.authors || bookData.authors.length === 0) {
                err.authors = 'Please specify author/s';
            }
            if(!bookData.volume){
                err.volume = 'Please enter volume'
            }
            if(!bookData.issue){
                err.issue = 'Please enter issue'
            }
            if (!bookData.publishedDate) {
                err.publishedDate = 'Please enter publish date';
            }
            if (!bookData.topic) {
                err.topic = 'Please select topic';
            }
        }else if(bookData.mediaType==='4'){
            if (!bookData.authors || bookData.authors.length === 0) {
                err.authors = 'Please specify author/s';
            }
            if(!bookData.adviser){
                err.adviser = 'Please specify adviser';

            }
            if (!bookData.publishedDate) {
                err.publishedDate = 'Please enter publish date';
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
                formData.append('username', uname);
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
                    isCirculation: false,
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
                const response = await saveResourceOffline(bookData);
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
                formData.append('username', uname);
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

/*--------------FETCH DATA ONLINE---------------------*/ 
    // Fetch publishers from the backend
    const getPublishers = async () => {
        console.log('publishers online')
        const pubs = [];
        try {
            const response = await axios.get('http://localhost:3001/api/data/publishers');
            console.log(response.data)
            response.data.forEach(item => {
                pubs.push({
                    value: item.pub_id,
                    label: item.pub_name
                });
            });
            setPublishers(pubs);
        } catch (err) {
            console.log(err.message);
        }
    };
    // Fetch publishers from the backend
    const getAuthors = async () => {
        const auth = [];
        try {
            const response = await axios.get('http://localhost:3001/api/data/authors');
            response.data.forEach(item => {
                auth.push({
                    value: `${item.author_fname} ${item.author_lname}`,
                    label: `${item.author_fname} ${item.author_lname}`
                });
            });
            setAuthorList(auth);
        } catch (err) {
            console.log(err.message);
        }
    };
    //Fetch advisers
    const getAdvisers = async () => {
        const adv = [];
        try {
            const response = await axios.get('http://localhost:3001/api/data/advisers');
            response.data.forEach(item => {
                adv.push({
                    value: `${item.adviser_fname} ${item.adviser_lname}`,
                    label: `${item.adviser_fname} ${item.adviser_lname}`
                });
            });
            setAdviserList(adv);
        } catch (err) {
            console.log(err.message);
        }
    };
    // fetch resourceType ( book, journal, newsletter, thesis)
    const getType = async()=>{
        try {
            const response = await axios.get('http://localhost:3001/api/data/type').then(res=>res.data);
            //console.log(response)
            setResourceType(response)
        } catch (err) {
            console.log(err.message);
        }
    };
    // fetch status (available,lost,damaged)
    const getStatus = async()=>{
        try {
            const response = await axios.get('http://localhost:3001/api/data/status').then(res=>res.data);
            //console.log(response)
            setResourceStatus(response)
        } catch (err) {
            console.log(err.message);
        }
    };

/*--------------FETCH DATA OFFLINE---------------------*/ 
    // Fetch publishers from the backend
    const getPublishersOffline = async () => {
        console.log('publishers offline')
        const pubs = [];
        try {
            const response = await getAllFromStore('publisher');
            response.forEach(item => {
                pubs.push({
                    value: item.pub_id,
                    label: item.pub_name
                });
            });
            setPublishers(pubs);
        } catch (err) {
            console.log(err.message);
        }
    };
    // Fetch publishers from the backend
    const getAuthorsOffline = async () => {
        const auth = [];
        try {
            const response = await getAllFromStore('author');
            response.forEach(item => {
                auth.push({
                    value: `${item.author_fname} ${item.author_lname}`,
                    label: `${item.author_fname} ${item.author_lname}`
                });
            });
            setAuthorList(auth);
        } catch (err) {
            console.log(err.message);
        }
    };
    //Fetch advisers
    const getAdvisersOffline = async () => {
        const adv = [];
        try {
            const response = await getAllFromStore('adviser');
            console.log('adviser list: ', response)
            response.forEach(item => {
                adv.push({
                    value: `${item.adviser_fname} ${item.adviser_lname}`,
                    label: `${item.adviser_fname} ${item.adviser_lname}`
                });
            });
            setAdviserList(adv);
        } catch (err) {
            console.log(err.message);
        }
    };

    console.log(bookData)
    console.log(publishers)

    return (
        <div className='add-item-container'>
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
                    setType={setType}
                    addAdviser={addAdviser}
                    setBookData={setBookData}
                    handleFileChange={handleFileChange}
                    formValidation={formValidation}
                    error={error}
                    publishers={publishers}
                    deleteAuthor={deleteAuthor}
                    authorList={authorList}
                    resourceType={resourceType}
                    adviserList={adviserList}
                    deleteAdviser={deleteAdviser}
                    resourceStatus={resourceStatus}
                    editMode={editMode}
                    isOnline={isOnline}
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
                    isOnline={isOnline}
                />
            </div>

            {disabled?<div className='edit-btn-cont'><button className="btn edit-item" onClick={()=>{
                setDisabled(false);
                setEditMode(true);
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
                    <i className="fa-regular fa-floppy-disk"></i>
                    <span>Save</span>
                </button>
            </div>}
            
            <Loading loading={loading}/>
        </div>
    );
};

export default AddItem;
