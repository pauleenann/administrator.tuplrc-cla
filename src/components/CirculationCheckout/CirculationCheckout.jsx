import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import './CirculationCheckout.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import CirculationSuccessful from '../CirculationSuccessful/CirculationSuccessful';
import Loading from '../Loading/Loading';
import Swal from 'sweetalert2'

const CirculationCheckout = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState(JSON.parse(localStorage.getItem('selectedItems')) || []);
  const id = localStorage.getItem('id');
  const clickedAction = localStorage.getItem('clickedAction'); // Get clicked action
  const [patron, setPatron] = useState([]);
  const length = selectedItems.length;
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const time = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Manila" });
  const currentDate = new Date(date); // Convert to Date object
  currentDate.setDate(currentDate.getDate() + 7); // Add 7 days
  const dueDate = currentDate.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  

  const getPatron = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/patron/checkout`, {
        params: { id },
      });
      setPatron(response.data); // Update patron state with response data
      console.log('Fetched Patron:', response.data); // Log for debugging
    } catch (error) {
      console.error('Error fetching patron:', error.message);
    }
  };

  const [uname, setUname] = useState(null);
  const getUsername = async()=>{
    try {
      // Request server to verify the JWT token
      const response = await axios.get(`http://localhost:3001/api/user/check-session`, { withCredentials: true });
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
    getPatron();
    getUsername();
    console.log(patron)
    console.log('selected item: ', selectedItems)
    console.log(clickedAction)
  }, []);

  const handleCheckin = async () => {
    if (selectedItems.length === 0) {
      window.toast.fire({ icon: "warning", title: "No items selected for check-in" });
      return;
    }
  
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#54CB58",
      cancelButtonColor: "#94152b",
      confirmButtonText: "Yes, check in!"
    });
  
    if (!result.isConfirmed) return; // Exit if user cancels
  
    setLoading(true);
  
    try {
      const checkinPromises = selectedItems.map(async (item) => {
        try {
          // Get checkout record
          const checkoutResponse = await axios.get(`http://localhost:3001/api/circulation/checkout-record`, {
            params: { resource_id: item.resource_id, patron_id: id },
          });
  
          if (!checkoutResponse.data.checkout_id) {
            throw new Error(`No checkout record found for resource_id: ${item.resource_id}`);
          }
  
          const checkoutId = checkoutResponse.data.checkout_id;
  
          // Post to checkin endpoint
          const response = await axios.post(`http://localhost:3001/api/circulation/checkin`, {
            checkout_id: checkoutId,
            returned_date: date,
            patron_id: id,
            resource_id: item.resource_id,
            username: uname,
          });
  
          if (response.status !== 201) {
            throw new Error(`Failed to check in item with checkout_id: ${checkoutId}`);
          }
  
          return { success: true, resource_id: item.resource_id };
        } catch (error) {
          console.error(`Error during check-in for item: ${item.resource_id}`, error.message);
          return { success: false, resource_id: item.resource_id, error: error.message };
        }
      });
  
      // Execute all check-in requests safely
      const results = await Promise.allSettled(checkinPromises);
  
      // Separate successes and failures
      const successfulCheckins = results.filter(r => r.status === "fulfilled" && r.value.success);
      const failedCheckins = results.filter(r => r.status === "fulfilled" && !r.value.success);
  
      setSelectedItems([]); // Clear selection
  
      if (successfulCheckins.length > 0) {
        Swal.fire({
          title: "Checked in!",
          text: `Resource checked in successfully.`,
          icon: "success"
        });
        navigate('/circulation')
      }
  
      if (failedCheckins.length > 0) {
        console.error("Failed check-ins:", failedCheckins);
        window.toast.fire({ icon: "error", title: `${failedCheckins.length} item(s) failed to check in.` });
      }
  
    } catch (error) {
      console.error("Error during check-in:", error.message);
      window.toast.fire({ icon: "error", title: "Failed to check in items" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      window.toast.fire({ icon: "warning", title: "No items selected for check-out" });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#54CB58",
      cancelButtonColor: "#94152b",
      confirmButtonText: "Yes, check out!"
    });

    if (!result.isConfirmed) return; // Exit if user cancels
    
    setLoading(true)
    try {
      // Create an array of promises to insert all items
      const checkoutPromises = selectedItems.map((item) => {
        return axios.post(`http://localhost:3001/api/circulation/checkout`, {
          checkout_date: date,
          checkout_due: dueDate,
          resource_id: item.resource_id,
          patron_id: id,
          username: uname,
        });
      });
      // Await all promises to complete
      await Promise.all(checkoutPromises);
      setSelectedItems([]); // Update state
      Swal.fire({
        title: "Checked out!",
        text: `Resource checked out successfully.`,
        icon: "success"
      });
      navigate('/circulation')
    } catch (error) {
      console.error('Error during checkout:', error.message);
      window.toast.fire({icon:"error", title:"Failed to check our items"})
    }finally{
      setLoading(false)
    }
  };

  // Handle cover image preview
    useEffect(() => {
      if (selectedItems.length === 0 || !selectedItems[0].cover) return;
      
      try {
        if (typeof selectedItems[0].cover === 'object') {
          setPreview(URL.createObjectURL(selectedItems[0].cover));
        } else {
          setPreview(`https://api.tuplrc-cla.com/${selectedItems[0].cover}`);
        }
      } catch (error) {
        console.error('Error creating preview URL:', error);
        setPreview(null);
      }
    }, [selectedItems]);

  const patronName = patron.length > 0 ? `${patron[0].patron_fname} ${patron[0].patron_lname}` : '';

  return (
    <div className='circ-checkout-container bg-light'>
      <h1>Circulation</h1>

      {/* path and back */}
      <div className="back-path">
        <button onClick={() => navigate(-1)} className="btn">Back</button>
        <p>Circulation / Select patron / Select items / <span>{clickedAction === 'Check In' ? 'Check in' : 'Check out'}</span></p>
      </div>

      {/* info */}
      <div className="checkout-details row shadow-sm">
        {/* items to be issued */}
        <div className="items col-5">
          <div>
            <h5>Items to be {clickedAction === 'Check In' ? 'returned' : 'issued'} (<span>{length}</span>)</h5>
            {/* Selected items */}
            <div className='inner overflow-y-auto overflow-x-hidden '>
              {selectedItems.map((item) => (
                <div className="rounded row mt-2 position-relative" key={item.resource_id}>
                  <div className="col-4">
                    <img 
                      src={preview} 
                      alt={`Cover of ${item.resource_title}`}
                      className="w-100 h-100 object-fit-cover rounded shadow"
                    />
                  </div>
                  <div className="col">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <p className="m-0 fs-5 fw-semibold">{item.resource_title}</p>
                    </div>
                    <p className="m-0 text-secondary">ISBN: {item.book_isbn || "Unknown"}</p>
                    <p className="m-0 text-secondary">Author/s: {item.authors || "Unknown"}</p>
                    <p className="m-0 text-secondary">Publisher: {item.publisher || "Unknown"}</p>
                    <p className="m-0 text-secondary">Quantity: <span>1</span></p>
                  </div>
              </div> 
              ))}
            </div>
          </div>

          {/* edit */}
          <div>
            <Link to={`/circulation/patron/item/${id}`} state={{ selectedItems }}>
              <button className="btn edit-btn">
                <FontAwesomeIcon icon={faPen} />
                Edit
              </button>
            </Link>
          </div>
        </div>

        {/* checkout summary */}
        <div className="checkout-sum col shadow-sm">
          {/* header */}
          <div className="header">
            {clickedAction === 'Check In' ? 'Return summary' : 'Check out summary'}
          </div>

          {/* info */}
          <div className="row patron-info-box">
            <div className="col-4">
              <p className="label">{clickedAction === 'Check In' ? 'Book returned by:' : 'Book issued for:'}</p>
            </div>
            {/* patron details */}
            <div className="col patron-info">
              <div>
                {patron.map((item, index) => (
                  <div key={index}>
                    <p className="patron-name">{item.patron_lname}, {item.patron_fname}</p>
                    <p className='id'>{item.tup_id}</p>
                    <p className="college">{item.college}</p>
                    <p className="course">{item.course}</p>
                    <p className='email'>{item.patron_email}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* break */}
            <hr />

            {/* book info */}
            <div className="book-info-box row">
              <div className="col labels">
                <p>No. of books {clickedAction === 'Check In' ? 'returned' : 'issued'}:</p>
                <p>Book {clickedAction === 'Check In' ? 'returned' : 'issued'} on:</p>
                <p>Book must be {clickedAction === 'Check In' ? 'returned' : 'returned'} on/before:</p>
              </div>
              <div className="col contents">
                <p>{length}</p>
                <p>{date} {time}</p>
                <p className='due'>{dueDate}</p>
              </div>
            </div>

            {/* checkout button  */}
            <div className="checkout-btn-box">
              <button className="btn" onClick={clickedAction === 'Check In' ? handleCheckin : handleCheckout}>
                {clickedAction === 'Check In' ? 'Return item' : 'Check out item'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CirculationSuccessful open={open} close={() => setOpen(false)} patronName={patronName} />
      <Loading loading={loading}/>
    </div>
  )
}

export default CirculationCheckout
