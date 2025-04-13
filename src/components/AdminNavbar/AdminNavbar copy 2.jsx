import React, { useEffect, useState } from 'react';
import './AdminNavbar.css';
import tuplogo from '../../assets/tuplogo.png';
import clalogo from '../../assets/clalogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faChartSimple, faFileLines, faCartShopping, faUser, faList, faFileExcel, faUsersGear, faUserPlus, faBookOpenReader, faLayerGroup, faBook, faArrowDown, faChevronDown, faBarcode, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import axios from 'axios';

const AdminNavbar = () => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCatalogingOpen, setIsCatalogingOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPathname = location.pathname;
    const basePath = '/' + location.pathname.split('/')[1];

    useEffect(() => {
        // Check if the current path is under cataloging to set dropdown state
        if (currentPathname.startsWith('/catalog')) {
            setIsCatalogingOpen(true);
        }
        
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/user/check-session', { withCredentials: true });
                if (response.data.loggedIn) {
                    setRole(response.data.userRole);
                } else {
                    setRole(null);
                    // Redirect to login if not logged in
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error verifying session:', error);
                setRole(null);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUserRole();
    }, [navigate, currentPathname]);

    const toggleCataloging = () => {
        setIsCatalogingOpen(!isCatalogingOpen);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className='admin-navbar-container shadow'>
            {/* Logo and Heading */}
            <div className="navbar-logo-heading">
                <div className="navbar-logos">
                    <img src={tuplogo} alt="tup-logo" className="logo-image" />
                    <img src={clalogo} alt="cla-logo" className="logo-image" />
                </div>
                <div className="navbar-heading">
                    <p className='navbar-heading-text navbar-heading-cla'>College of Liberal Arts</p>
                    <p className='navbar-heading-text navbar-heading-lrc'>Learning Resource Center</p>
                </div>
            </div>

            {/* Menu */}
            <div className="navbar-menu">
                <ul className="menu-list">
                    {/* Dashboard */}
                    <li className={`menu-item ${basePath === '/dashboard' ? 'selected' : ''}`}>
                        <Link to='/dashboard' className='menu'>
                            <div className="menu-icon-container">
                                <FontAwesomeIcon icon={faChartSimple} className='menu-icon'/>
                            </div>
                            <div className="menu-text">
                                <p>Dashboard</p>
                            </div>
                        </Link>
                    </li>

                    {/* Logbook */}
                    <li className={`menu-item ${basePath === '/logbook' ? 'selected' : ''}`}>
                        <Link to='/logbook' className="menu">
                            <div className="menu-icon-container">
                                <FontAwesomeIcon icon={faFileLines} className='menu-icon'/>
                            </div>
                            <div className="menu-text">
                                <p>Logbook</p>
                            </div>
                        </Link>
                    </li>

                    {/* Circulation */}
                    <li className={`menu-item ${basePath === '/circulation' ? 'selected' : ''}`}>
                        <Link to='/circulation' className="menu">
                            <div className="menu-icon-container">
                                <FontAwesomeIcon icon={faCartShopping} className='menu-icon'/>
                            </div>
                            <div className="menu-text">
                                <p>Book Circulation</p>
                            </div>
                        </Link>
                    </li>

                    {/* Patrons */}
                    <li className={`menu-item ${basePath === '/patron' ? 'selected' : ''}`}>
                        <Link to='/patron' className="menu">
                            <div className="menu-icon-container">
                                <FontAwesomeIcon icon={faUser} className='menu-icon' />
                            </div>
                            <div className="menu-text">
                                <p>Patrons</p>
                            </div>
                        </Link>
                    </li>

                    {/* Cataloging - Parent Menu */}
                    <li className={`menu-item ${basePath === '/catalog' ? 'selected' : ''}`}>
                        <Link to='/catalog' className='text-decoration-none'>
                            <div className='menu' onClick={toggleCataloging} style={{ cursor: 'pointer' }}>
                                <div className="menu-icon-container">
                                    <FontAwesomeIcon icon={faBook} className='menu-icon'/>
                                </div>
                                <div className="menu-text">
                                    <p>Cataloging</p>
                                </div>
                            </div> 
                        </Link>
                        
                        {/* Cataloging Submenu */}
                        {isCatalogingOpen && (
                            <ul className="submenu">
                                <li className="submenu-list-item">
                                    <Link to='/catalog/generate-barcode' className="submenu-item">
                                        <div className="menu-icon-container">
                                            <FontAwesomeIcon icon={faBarcode} className='menu-icon'/>
                                        </div>
                                        <div className="menu-text">
                                            <p>Generate Barcode</p>
                                        </div>
                                    </Link>
                                </li>
                                <li className="submenu-list-item">
                                    <Link to='/catalog/manage-catalog' className="submenu-item">
                                        <div className="menu-icon-container">
                                            <FontAwesomeIcon icon={faPenToSquare} className='menu-icon'/>
                                        </div>
                                        <div className="menu-text">
                                            <p>Manage Catalog</p>
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    <li className={`menu-item ${basePath === '/reports' ? 'selected' : ''}`}>
                        <Link to='/reports' className="menu">
                            <div className="menu-icon-container">
                                <FontAwesomeIcon icon={faFileExcel} className='menu-icon'/>
                            </div>
                            <div className="menu-text">
                                <p>Reports</p>
                            </div>
                        </Link>
                    </li>

                    {/* Conditionally Render Menu Items Based on Role */}
                    {role !== 'staff' && (
                        <>
                            {/* <li className={`menu-item ${basePath === '/reports' ? 'selected' : ''}`}>
                                <Link to='/reports' className="menu">
                                    <div className="menu-icon-container">
                                        <FontAwesomeIcon icon={faFileExcel} className='menu-icon'/>
                                    </div>
                                    <div className="menu-text">
                                        <p>Reports</p>
                                    </div>
                                </Link>
                            </li> */}

                            <li className={`menu-item ${basePath === '/audit' ? 'selected' : ''}`}>
                                <Link to='/audit' className="menu">
                                    <div className="menu-icon-container">
                                        <FontAwesomeIcon icon={faFile} className='menu-icon'/>
                                    </div>
                                    <div className="menu-text">
                                        <p>Audit Logs</p>
                                    </div>
                                </Link>
                            </li>

                            <li className={`menu-item ${basePath === '/accounts' ? 'selected' : ''}`}>
                                <Link to='/accounts' className="menu">
                                    <div className="menu-icon-container">
                                        <FontAwesomeIcon icon={faUsersGear} className='menu-icon'/>
                                    </div>
                                    <div className="menu-text">
                                        <p>Accounts</p>
                                    </div>
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