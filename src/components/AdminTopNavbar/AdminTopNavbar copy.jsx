import React, { useEffect, useState } from 'react';
import './AdminTopNavbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkIfOnline } from '../../features/isOnlineSlice';
import { setUsername } from '../../features/userSlice';
import { fetchStatusOffline, fetchStatusOnline } from '../../features/statusSlice';
import { fetchPublisherOffline, fetchPublisherOnline } from '../../features/publisherSlice';
import { fetchAuthorOffline, fetchAuthorOnline } from '../../features/authorSlice';
import { fetchAdviserOffline, fetchAdviserOnline } from '../../features/adviserSlice';
import { fetchDepartmentOffline, fetchDepartmentOnline } from '../../features/departmentSlice';
import { fetchTopicOffline, fetchTopicOnline } from '../../features/topicSlice';
import { initDB, refreshNonResourceStores, resetDBExceptResources } from '../../indexedDb/initializeIndexedDb';
import { fetchPublisherInfo } from '../../features/publisherInfoSlice';

const AdminTopNavbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [dateTime, setDateTime] = useState(new Date());
    const isOnline = useSelector((state) => state.isOnline.isOnline);
    const [uname, setUname] = useState(null);
    const {status} = useSelector(state=>state.status)
    const {publisher} = useSelector(state=>state.publisher)
    const {author} = useSelector(state=>state.author)
    const {adviser} = useSelector(state=>state.adviser)
    const {department} = useSelector(state=>state.department)
    const {topic} = useSelector(state=>state.topic)
    const {type} = useSelector(state=>state.type)
    const {publisherInfo} = useSelector(state=>state.publisherInfo)

    useEffect(() => {
        // Update time every second
        const timerId = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        const getUsername = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/user/check-session', { withCredentials: true });
                console.log(response.data);
                if (response.data.loggedIn) {
                    setUname(response.data.username);
                    dispatch(setUsername(response.data.username))
                } else {
                    setUname(null);
                }
            } catch (error) {
                console.error('Error verifying session:', error);
                setUname(null);
            }
        };
        getUsername();
    }, []);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDay = days[today.getDay()];

    useEffect(() => {
        const checkOnlineStatus = async () => {
            try {
                await fetch("https://jsonplaceholder.typicode.com/todos/1", { cache: "no-store" });
                dispatch(checkIfOnline(true));
                getOnlineData();
            } catch (error) {
                dispatch(checkIfOnline(false));
                getOfflineData();
            }
        };

        dispatch(checkIfOnline(null));
        checkOnlineStatus();

        const handleOnline = () => dispatch(checkIfOnline(true));
        const handleOffline = () => dispatch(checkIfOnline(false));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const intervalId = setInterval(checkOnlineStatus, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(intervalId);
        };
    }, [dispatch]);

    // Logout function remains the same
    const logout = async () => {
        try {
            await axios.post('http://localhost:3001/api/user/logout', { username: uname }, { withCredentials: true });
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            navigate('/');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const getOnlineData = ()=>{
        dispatch(fetchStatusOnline());
        dispatch(fetchPublisherOnline());
        dispatch(fetchAuthorOnline());
        dispatch(fetchAdviserOnline());
        dispatch(fetchDepartmentOnline());
        dispatch(fetchTopicOnline());
        dispatch(fetchPublisherInfo())
    }

    const getOfflineData = ()=>{
        dispatch(fetchStatusOffline());
        dispatch(fetchPublisherOffline());
        dispatch(fetchAuthorOffline());
        dispatch(fetchAdviserOffline());
        dispatch(fetchDepartmentOffline());
        dispatch(fetchTopicOffline());
    }

    
    // This useEffect now only handles the REFRESH when online with new data
    useEffect(() => {
        // Check if all required data arrays fetched from online source are populated
        const allDataLoaded = status.length > 0 && type.length > 0 && publisher.length > 0 && publisherInfo.length > 0 &&
            author.length > 0 && adviser.length > 0 && department.length > 0 && topic.length > 0;

        if (isOnline === true && allDataLoaded) { // Explicitly check isOnline === true
            console.log("Online and all necessary data loaded, refreshing IndexedDB non-resource stores...");

            // Call the corrected refresh function directly.
            // No need to call initDB here anymore for the refresh cycle.
            refreshNonResourceStores(status, type, publisher, publisherInfo, author, adviser, department, topic)
                .then(() => {
                    console.log("Successfully refreshed non-resource stores in IndexedDB.");
                })
                .catch(error => {
                    console.error("Failed to refresh non-resource stores in IndexedDB:", error);
                    // Handle error appropriately (e.g., show a message to the user)
                });

        } else if (isOnline === false) {
            console.log("Offline. Will rely on existing IndexedDB data (fetched via getOfflineData).");
            // The getOfflineData logic should be handling reads from IndexedDB here or elsewhere
            getOfflineData(); // Make sure this function correctly reads from IDB
        } else {
            // Cases: isOnline is null (initial check) OR isOnline is true but data isn't loaded yet.
             console.log("Waiting for online status check or for all data to load...");
        }
        // Add dispatch to dependencies if any thunks inside getOfflineData use it,
        // otherwise, base dependencies on what triggers the effect.
    }, [status, type, publisher, publisherInfo, author, adviser, department, topic, isOnline, dispatch]);
    

    return (
        <div className="top-navbar bg-light">
            {/* Online/Offline Indicator */}
            <div className="border text-secondary p-2 rounded">
                {isOnline === null ? 'Loading...' : isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="info">
                {/* Date and Time */}
                <div className="top-navbar-datetime">
                    <span>{dateTime.toLocaleTimeString()}</span>
                    <span className="separator">|</span>
                    <span>{currentDay}</span>
                    <span className="separator">|</span>
                    <span>{dateTime.toLocaleDateString()}</span>
                </div>

                {/* Admin Account Dropdown */}
                <div className="user-box">
                    <div className="dropdown">
                        <button 
                            className="btn cat-dropdown dropdown-toggle" 
                            type="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false"
                        >
                            <FontAwesomeIcon icon={faCircleUser} className="icon" />
                            <span className="user-greeting">
                                Hello, <span className="user-welcome-uname">{uname}</span>
                            </span>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <button className="dropdown-item" onClick={logout}>
                                    <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTopNavbar;