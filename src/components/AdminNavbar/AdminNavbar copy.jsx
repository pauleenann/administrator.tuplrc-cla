import React, { useEffect, useState } from 'react';
import './AdminNavbar.css';
import tuplogo from '../../assets/tuplogo.png';
import clalogo from '../../assets/clalogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faChartSimple, faFileLines, faCartShopping, faUser, faList, faFileExcel, faUsersGear, faUserPlus, faBookOpenReader, faLayerGroup, faBook, faArrowDown, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import axios from 'axios';


const AdminNavbar = () => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCatalogingOpen, setIsCatalogingOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPathname = '/' + location.pathname.split('/')[1];

    console.log(currentPathname)

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/user/check-session', { withCredentials: true });
                if (response.data.loggedIn) {
                    setRole(response.data.userRole);
                } else {
                    setRole(null);
                }
            } catch (error) {
                console.error('Error verifying session:', error);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUserRole();
    }, [navigate]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className='admin-navbar-container'>
            {/* Logo and Heading */}
            <div className="navbar-logo-heading">
                <div className="navbar-logos">
                    <img src={tuplogo} alt="tup-logo" />
                    <img src={clalogo} alt="cla-logo" />
                </div>
                <div className="navbar-heading">
                    <p className='navbar-heading-text navbar-heading-cla'>College of Liberal Arts</p>
                    <p className='navbar-heading-text navbar-heading-lrc'>Learning Resource Center</p>
                </div>
            </div>

            {/* Menu */}
            <div className="navbar-menu">
                <ul>
                    {/* Dashboard */}
                    <li className={currentPathname=='/dashboard'?'selected':''}>
                        <Link to='/dashboard' className='menu'>
                            <FontAwesomeIcon icon={faChartSimple} className='menu-icon'/>
                            <p>Dashboard</p>
                        </Link>
                    </li>

                    {/* Logbook */}
                    <li className={currentPathname=='/logbook'?'selected':''}>
                        <Link to='/logbook' className="menu">
                            <FontAwesomeIcon icon={faFileLines} className='menu-icon'/>
                            <p>Logbook</p>
                        </Link>
                    </li>

                    {/* Circulation */}
                    <li className={currentPathname=='/circulation'?'selected':''}>
                        <Link to='/circulation' className="menu">
                            <FontAwesomeIcon icon={faCartShopping} className='menu-icon'/>
                            <p>Circulation</p>
                        </Link>
                    </li>

                    {/* Patrons */}
                    <li className={currentPathname=='/patron'?'selected':''}>
                        <Link to='/patron' className="menu">
                            <FontAwesomeIcon icon={faUser} className='menu-icon' />
                            <p>Patrons</p>
                        </Link>
                    </li>

                    {/* Cataloging */}
                    <li className={currentPathname=='/catalog'?'selected':''}>
                        <Link to='/catalog'className='d-flex align-items-center gap-3'>
                            <div className='menu'>
                               <FontAwesomeIcon icon={faList} className='menu-icon'/>
                                <p>Cataloging</p> 
                            </div>
                            <FontAwesomeIcon icon={faChevronDown} className='dropdown' onClick={() => setIsCatalogingOpen(!isCatalogingOpen)} style={{ cursor: 'pointer' }}/>
                        </Link>
                    </li>

                    {/* Display Authors, Publishers, Departments, and Topics when Cataloging is clicked */}
                    {isCatalogingOpen && (
                        <>
                            <li className=''>
                                <Link to='/authors' className='menu-dropdown'>
                                    <FontAwesomeIcon icon={faUserPlus} className='menu-icon'/> 
                                    <p>Authors</p>
                                </Link>
                            </li>
                            <li className=''>
                                <Link to='/publishers' className='menu-dropdown'>
                                    <FontAwesomeIcon icon={faBookOpenReader} className='menu-icon'/> 
                                    <p>Publishers</p>
                                </Link>
                            </li>
                            <li className=''>
                                <Link to='/departments' className='menu-dropdown'>
                                    <FontAwesomeIcon icon={faLayerGroup} className='menu-icon'/> 
                                    <p>Departments</p>
                                </Link>
                            </li>
                            <li className=''>
                                <Link to='/topics' className='menu-dropdown'>
                                    <FontAwesomeIcon icon={faBook} className='menu-icon'/> 
                                    <p>Topics</p>
                                </Link>
                            </li>
                        </>
                    )}

                    {/* Conditionally Render Menu Items Based on Role */}
                    {role !== 'staff' && (
                        <>
                            <li className={currentPathname=='/reports'?'selected':''}>
                                <Link to='/reports' className="menu">
                                    <FontAwesomeIcon icon={faFileExcel} className='menu-icon'/>
                                    <p>Reports</p>
                                </Link>
                            </li>

                            <li className={currentPathname=='/audit'?'selected':''}>
                                <Link to='/audit' className="menu">
                                    <FontAwesomeIcon icon={faFile} className='menu-icon'/>
                                    <p>Audit Logs</p>
                                </Link>
                            </li>

                            <li className={currentPathname=='/accounts'?'selected':''}>
                                <Link to='/accounts' className="menu">
                                    <FontAwesomeIcon icon={faUsersGear} className='menu-icon'/>
                                    <p>Accounts</p>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminNavbar;
