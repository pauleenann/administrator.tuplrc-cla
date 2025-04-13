import React, { useEffect, useState } from 'react';
import './Accounts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faPen, faUserSlash, faArrowLeft, faArrowRight, faSearch, faSort, faSortUp, faSortDown, faArrowUp, faArrowDown, faArrowUpWideShort, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import CreateUserModal from '../CreateUserModal/CreateUserModal';
import EditUserModal from '../EditUserModal/EditUserModal';
import DeactivateModal from '../DeactivateModal/DeactivateModal';
import ActivateModal from '../ActivateModal/ActivateModal';
import axios from 'axios';
import Loading from '../Loading/Loading';
import ResourceStatusModal from '../ResourceStatusModal/ResourceStatusModal';
import Swal from 'sweetalert2'

const Accounts = () => {
  const [staffUname, setStaffUname] = useState(null);
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [openEditUser, setEditUser] = useState(false);
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [openActivate, setOpenActivate] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState({
    fname: '',
    lname: '',
    uname: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  const [originalAccount, setOriginalAccount] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [statusModal, setStatusModal] = useState(false);
  const [statusModalContent, setStatusModalContent] = useState({ status: '', message: '' });
  const [selectedUname, setSelectedUname] = useState('');
  const [pagination, setPagination] = useState(5); // Items per page
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [keyword, setKeyword] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({ fname:0, lname:0, uname: 0, role: 0, status:''});
  
  // New state to track sort directions
  const [sortStates, setSortStates] = useState({
    fname: 0, // 0 = unsorted, 1 = ascending (A-Z), 2 = descending (Z-A)
    lname: 0,
    uname: 0
  });
  
  useEffect(() => {
    userAccounts();
    getUsername(); 
  }, [currentPage, selectedFilters]);

  const appendToAccount = (key, value) => {
      setAccount((prevAccount) => ({
          ...prevAccount,
          [key]: value, // Dynamically add or update the key-value pair
      }));
      console.log(account)
  };

  useEffect(()=>{
    if(keyword==''){
      userAccounts(true)
    }
  },[keyword])

  const getUsername = async()=>{
    try {
      // Request server to verify the JWT token
      const response = await axios.get(`http://localhost:3001/api/user/check-session`, { withCredentials: true });
      console.log(response.data)
      // If session is valid, set the role
      if (response.data.loggedIn) {
        setStaffUname(response.data.username);
      } else {
        setStaffUname(null); // If not logged in, clear the role
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      setStaffUname(null); // Set null if there's an error
    }
  }

  // Fetch user accounts
  const userAccounts = async (resetPage = false) => {
    if (resetPage) {
      setCurrentPage(1);
      setSelectedFilters({ fname:0, lname:0, uname: 0, role: 0, status:''})
    }

    setLoading(true);

    const offset = (currentPage - 1) * pagination;


    try {
      const response = await axios.get('http://localhost:3001/api/account', {
        params: {
          limit: pagination,
          offset,
          keyword,
          fname: selectedFilters.fname,
          lname: selectedFilters.lname,
          uname: selectedFilters.uname,
          role: selectedFilters.role,
          status: selectedFilters.status,
        }
      });

      if (response.data) {
        setAccounts(response.data.results);
        setTotalPages(Math.ceil(response.data.totalUsers / pagination)); // Calculate total pages
      }

      console.log(response);
    } catch (err) {
      console.log('Cannot get accounts. An error occurred: ', err.message);
    } finally {
      setLoading(false);
    }
  };

    // Get account to be edited
    const getToEdit = async (id) => {
      try {
        const response = await axios.get(`http://localhost:3001/api/account/${id}`);
        const result = {
          id: response.data[0].staff_id,
          fname: response.data[0].staff_fname,
          lname: response.data[0].staff_lname,
          uname: response.data[0].staff_uname,
          role: response.data[0].role_id,
          password: '',
          confirmPassword: '',
          username: staffUname,
        };
        setAccount(result);
        setOriginalAccount(result)
      } catch (err) {
        console.log('Cannot get account to be edited. An error occurred: ', err.message);
      }
    };

  // Create user account
  const createUserAccount = async (isChangePassword) => {
    await appendToAccount('username', staffUname);
    const isValid = await formValidation();  // No need for await
    const isPasswordValid = await passwordValidation(); // No need for await

    if (!isValid || !isPasswordValid) { // Stop if errors exist
        return;
    }
    const result = await Swal.fire({
      title: "Are you sure",
      text: "You want to create this user?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#54CB58",
      cancelButtonColor: "#94152b",
      confirmButtonText: "Yes, create!"
    });
    
    if (!result.isConfirmed) return; // Exit if user cancels

  setLoading(true);
  try {
      const response = await axios.post('http://localhost:3001/api/account', account);
      console.log(account);
      setLoading(false);

      if (response.data.status === 409) {
        Swal.fire({
          title: "User already exists!",
          text: "User with the same username already exists. Please try again.",
          icon: "warning",
          confirmButtonColor: "#54CB58",
        });
      } else if (response.data.status === 201) {
        const result2 = await Swal.fire({
          title: "User created!",
          text: "You successfully created an account.",
          icon: "success",
          confirmButtonColor: "#54CB58",
        });

        // Reset form after success
        setAccount({
          fname: '',
          lname: '',
          uname: '',
          role: '',
          password: '',
          confirmPassword: ''
        });

        if (result2.isConfirmed) {
          window.location.reload();
        }
      }
    } catch (err) {
        console.log('Cannot create account. An error occurred:', err.message);
    } finally {
        setLoading(false); // Ensure loading is reset even on error
    }
  };


  const editUserAccount = async(isChangePassword)=>{
    await appendToAccount('username', staffUname);
    const isValid = await formValidation();
    let isPasswordValid = true;

    if(isChangePassword){
      isPasswordValid = await passwordValidation();
    }

    if (!isValid || !isPasswordValid) { // Correct check
      return;
    }


    const hasChanges = 
      account.fname !== originalAccount.fname ||
      account.lname !== originalAccount.lname ||
      account.uname !== originalAccount.uname ||
      account.role !== originalAccount.role ||
      account.password !== '' || originalAccount.confirmPassword !== '';

    // If no changes, show a message and return
    if (!hasChanges) {
      await Swal.fire({
        title: "No Changes",
        text: "No changes were made to the user account.",
        icon: "info"
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure",
      text: `You want to edit this user?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#54CB58",
      cancelButtonColor: "#94152b",
      confirmButtonText: "Yes, edit!"
    });

    if (!result.isConfirmed) return; // Exit if user cancels

    if (Object.keys(error).length === 0) {
          setLoading(true);
          try {
            console.log('Editing account with id: ', account.id);
            const response = await axios.put(`http://localhost:3001/api/account/${account.id}`, account);
            const result2 = await Swal.fire({
              title: "Edited!",
              text: `You edited the user successfully.`,
              icon: "success",
              confirmButtonColor: "#54CB58",
            });
    
            if(result2.isConfirmed){
              window.location.reload()
            }
          } catch (err) {
            console.log('Cannot edit account. An error occurred: ', err.message);
          } finally {
            setLoading(false);
          }
        }
    }

    // Form validation for creating user account
    const formValidation = () => {
      const err = {}; // Fresh object to collect errors
  
      if (!account.fname) err.fname = 'Enter first name';
      if (!account.lname) err.lname = 'Enter last name';
      if (!account.uname) err.uname = 'Enter username';
      if (!account.role) err.role = 'Choose a role';
  
      setError(err); // Update error state
  
      return Object.keys(err).length === 0; // Return true if no errors exist
  };
  
  // Password validation function
  const passwordValidation = () => {
    const err = {}; // Fresh object to collect errors
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

    if (!account.password) err.password = 'Enter a password';
    else if (!passwordRegex.test(account.password))
        err.password = 'Password must have one uppercase, one lowercase, one digit, and one special character';
    
    if (!account.confirmPassword) err.confirmPassword = 'Confirm your password';
    else if (account.password !== account.confirmPassword)
        err.confirmPassword = 'Passwords do not match';

    setError((prev) => ({ ...prev, ...err })); // Preserve existing errors

    return Object.keys(err).length === 0; // Return true if no errors exist
};



  // Deactivate user
  const deactivateUser = async (uname, id) => {

    const result = await Swal.fire({
          title: "Are you sure",
          text: `You want to deactivate '${uname}'?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#54CB58",
          cancelButtonColor: "#94152b",
          confirmButtonText: "Yes, deactivate!"
    });

    if (!result.isConfirmed) return; // Exit if user cancels

    setLoading(true);
    try {
      console.log('account: ', staffUname)
      const response = await axios.put(`http://localhost:3001/api/account/deactivate/${id}`, {staffUname});
      const result2 = await Swal.fire({
        title: "Deactivated!",
        text: `${uname} deactivated successfully.`,
        icon: "success"
      });

      if(result2.isConfirmed){
        window.location.reload()
      }
      
    } catch (err) {
      console.log('Cannot deactivate user. An error occurred: ', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Activate user
  const activateUser = async (uname, id) => {
    const result = await Swal.fire({
      title: "Are you sure",
      text: `You want to activate '${uname}'?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#54CB58",
      cancelButtonColor: "#94152b",
      confirmButtonText: "Yes, activate!"
    });

    if (!result.isConfirmed) return; // Exit if user cancels

    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:3001/api/account/activate/${id}`, {staffUname});
      const result2 = await Swal.fire({
        title: "Activated!",
        text: `${uname} activated successfully.`,
        icon: "success"
      });

      if(result2.isConfirmed){
        window.location.reload()
      }

    } catch (err) {
      console.log('Cannot activate user. An error occurred: ', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for account creation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEdit = (id) => {
    setEditUser(true);
    getToEdit(id);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      userAccounts();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      userAccounts();
    }
  };

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };
  
  // New function to handle sort icon clicks
  const handleSortClick = (column) => {
    // Update sort state for the clicked column
    const currentState = sortStates[column];
    const newState = currentState === 2 ? 0 : currentState + 1;
    
    // Reset all other column states
    const newSortStates = { 
      fname: 0, 
      lname: 0, 
      uname: 0 
    };
    
    // Set the new state for the clicked column
    newSortStates[column] = newState;
    setSortStates(newSortStates);
    
    // Map the state to the sort value (0 = no sort, 1 = A-Z, 2 = Z-A)
    // Update the selectedFilters state
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      fname: newSortStates.fname,
      lname: newSortStates.lname,
      uname: newSortStates.uname
    }));
  };
  
  // Helper to get the right icon based on sort state
  const getSortIcon = (column) => {
    switch (sortStates[column]) {
      case 1:
        return <FontAwesomeIcon icon={faArrowUp} className='ms-2'/>;
      case 2:
        return <FontAwesomeIcon icon={faArrowDown} className='ms-2'/>;
      default:
        return <FontAwesomeIcon icon={faArrowUpWideShort} className='ms-2'/>;
    }
  };

  const handleSelectedFilter = (filterCategory, value)=>{
    setSelectedFilters((prevFilters)=>({
      ...prevFilters,
      [filterCategory]:value
    }))

    if(filterCategory=='fname'){
      setSelectedFilters((prevFilters)=>({
        ...prevFilters,
          lname:0,
          uname:0
      }))
    }else if(filterCategory=='lname'){
      setSelectedFilters((prevFilters)=>({
        ...prevFilters,
          fname:0,
          uname:0
      }))
    }else if(filterCategory=='uname'){
      setSelectedFilters((prevFilters)=>({
        ...prevFilters,
          lname:0,
          fname:0
      }))
    }
  }

  const clearFilter = ()=>{
    setSelectedFilters({ fname: 0, lname: 0, uname: 0, role: 0, status: '' });
    setSortStates({ fname: 0, lname: 0, uname: 0 });
    setKeyword('')
  }

  

  console.log('account',account)
  console.log('account',account)

  return (
    <div className="accounts-container bg-light">
      <h1>User accounts</h1>

      {/* Search and add */}
      <div className="search-add">
        {/* Search */}
      <div className="input-group w-50 z-0">
        <input 
          type="text"
          className='form-control shadow-sm' 
          value={keyword}
          placeholder='Search'
          onChange={handleSearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              userAccounts(true);
            }
          }}
        />
        <button className="btn search-btn px-3 shadow-sm" onClick={() => userAccounts(true)}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
        <button
          className="btn btn-warning clear-btn ms-2 shadow-sm"
          onClick={clearFilter}
        >
          Clear filter
        </button>
      </div>
      {/* Add */}
      <button 
        className="btn create-btn shadow-sm" 
        onClick={() =>{ 
          setAccount({
            fname: '',
            lname: '',
            uname: '',
            role: '',
            password: '',
            confirmPassword: ''
          });
          setOpenCreateUser(true);
      }}>
        <FontAwesomeIcon icon={faPlus} />
        Create account
      </button>
    </div>

      {/* Accounts Table */}
      <table>
        <thead>
          <tr>
            <td>
              First Name
              <span className="sort-icon" onClick={() => handleSortClick('fname')}>
                {getSortIcon('fname')}
              </span>
            </td>
            <td>
              Last Name
              <span className="sort-icon" onClick={() => handleSortClick('lname')}>
                {getSortIcon('lname')}
              </span>
            </td>
            <td>
              Username
              <span className="sort-icon" onClick={() => handleSortClick('uname')}>
                {getSortIcon('uname')}
              </span>
            </td>
            <td>
              Role
              <select name="role" id="" className='sort' onChange={(e)=>handleSelectedFilter('role', e.target.value)}>
                  <option value="" disabled selected></option>
                  <option value="1">Admin</option>
                  <option value="2">Staff</option>
              </select>
            </td>
            <td>
              Status
              <select name="" id="" className='sort' onChange={(e)=>handleSelectedFilter('status', e.target.value)}>
                  <option value="" disabled selected></option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
              </select>
            </td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
        {accounts.length > 0 ? (
          accounts.map((item) => (
            <tr key={item.staff_id}>
              <td>{item.staff_fname}</td>
              <td>{item.staff_lname}</td>
              <td>{item.staff_uname}</td>
              <td>{item.role_name}</td>
              <td>
                <span className={item.staff_status=='active'?'bg-success text-light p-2 rounded fw-semibold':'bg-danger text-light p-2 rounded fw-semibold'}>{item.staff_status}</span>
              </td>
              <td className="action">
                {/* Edit user */}
                <button className="btn edit-btn" onClick={() => handleEdit(item.staff_id)} title='Edit user'>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                {/* Deactivate / Activate */}
                {item.staff_status === 'active' ? (
                  <button className="btn deac-acc-btn" onClick={() => deactivateUser(item.staff_uname, item.staff_id)} title='Deactivate user'>
                    <FontAwesomeIcon icon={faUserSlash} />
                  </button>
                ) : (
                  <button className="btn deac-acc-btn" onClick={() => activateUser(item.staff_uname, item.staff_id)} title='Activate user'>
                    <FontAwesomeIcon icon={faUser} />
                  </button>
                )}
              </td>
            </tr>
          ))
        ) : !loading && accounts.length === 0 ? (
          <tr>
            <td colSpan="6" className='no-data-box text-center'>
              <div className='d-flex flex-column align-items-center gap-2 my-5'>
                <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
                <span>No accounts available.<br/>Please try a different filter.</span>
                <button className='btn btn-warning' onClick={clearFilter}>Clear Filter</button>
              </div>
            </td>
          </tr>
        ) : (
          <tr>
            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
              <div className="spinner-box">
                <div className="spinner-grow text-danger" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            </td>
          </tr>
        )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        {/* Pages */}
        <div className="pages">
          <p className="m-0">
            Page {currentPage} of {totalPages}
          </p>
        </div>
        {/* Buttons */}
        <div className="buttons">
          <button className="btn prev-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
            <FontAwesomeIcon icon={faArrowLeft}/>
          </button>
          <button className="btn next-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
            <FontAwesomeIcon icon={faArrowRight}/>
          </button>
        </div>
      </div>

      <EditUserModal
        open={openCreateUser}
        close={() => {
          setOpenCreateUser(false);
          setAccount({
            fname: '',
            lname: '',
            uname: '',
            role: '',
            password: '',
            confirmPassword: '',
            username: staffUname
          });
          setError({});
        }}
        title={'Create User Account'}
        account={account}
        handleChange={handleChange}
        error={error}
        save={(isChangePassword)=>createUserAccount(isChangePassword)}
      />
      <EditUserModal
        open={openEditUser}
        close={() => setEditUser(false)}
        title={'Edit User Account'}
        account={account}
        handleChange={handleChange}
        error={error}
        save={(isChangePassword)=>editUserAccount(isChangePassword)}
      />
      <DeactivateModal open={openDeactivate} close={() => setOpenDeactivate(false)} uname={selectedUname} deactivateUser={deactivateUser} />
      <ActivateModal open={openActivate} close={() => setOpenActivate(false)} uname={selectedUname} activateUser={activateUser} />
      {/* <Loading loading={loading} /> */}
      <ResourceStatusModal open={statusModal} close={() => setStatusModal(false)} content={statusModalContent} path={'/accounts'} />
    </div>
  );
};

export default Accounts;