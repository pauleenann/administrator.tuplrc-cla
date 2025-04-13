import React, { useState, useEffect, useRef } from 'react';
import './CirculationSelectItem.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faTrashCan, faX, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';


const CirculationSelectItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const patronId = id;
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItems, setSelectedItems] = useState(JSON.parse(localStorage.getItem('selectedItems')) || []);
  const actionSelected = localStorage.getItem('clickedAction') || 'Check Out'; // Default to 'Check Out'
  const actionLabel = actionSelected === 'Check In' ? 'Check In' : 'Check Out'; // Dynamic label based on action
  const isDisabled = selectedItems.length === 0 || selectedItems.length > 1;
  const searchInputRef = useRef(null); // Create a ref for the input

  useEffect(() => {
    searchInputRef.current?.focus(); // Automatically focus on mount
  }, []);

  // Fetch suggestions from the database
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]); // Clear suggestions if the query is empty
      return;
    }
  const endpoint =
      actionSelected === 'Check In' ? '/checkin/search' : '/checkout/search'; // Determine the API endpoint

    try {
      const response = await axios.get(`http://localhost:3001/api/circulation${endpoint}`, {
        params: {
          query,
          ...(actionSelected === 'Check In' && { patron_id: id }), // Include patronId only for Check In
        },
      });
      setSuggestions(response.data); // Update the suggestions state
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Handle typing in the input fields
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
  };

  // Add item to the selected list
  const handleAddItem = (item) => {
    const exists = selectedItems.find((i) => i.resource_id === item.resource_id);
    if (!exists) {
      setSelectedItems([...selectedItems, item]);
    }
    setSearchQuery(''); // Clear input field
    setSuggestions([]); // Clear suggestions
  };

  // Remove item from the selected list
  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.resource_id !== id));
  };

  // Clear all selected items
  const handleClearItems = () => {
    setSelectedItems([]);
  };

  return (
    <div className='circ-select-item-container'>
      <h1>Circulation</h1>

      {/* Path and back */}
      <div className="back-path">
        <button onClick={() => navigate(-1)} className="btn">Back</button>
        <p>Circulation / Select patron / <span>Select item</span></p>
      </div>

      <div className="row add-items">
        {/* Scan or manual */}
        <div className="col scan-manual">
          <div className="barcode">
            <FontAwesomeIcon icon={faBarcode} className='icon' />
            <p>Scan items in the scanner <br />to be {actionLabel.toLowerCase()}.</p>
          </div>
          <p>No barcode available? Input manually instead</p>

          <div className='circ-info'>
            <label htmlFor="">ISBN / Title</label>
            <input
              ref={searchInputRef}  // Attach ref to input
              type="text"
              placeholder={`Enter ISBN or Title for ${actionLabel}`}
              value={searchQuery}
              onChange={handleInputChange}
            />
          </div>

          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((item) => (
                <div
                  key={item.resource_id}
                  className="suggestion-item"
                  onClick={() => handleAddItem(item)}
                >
                  <span>{item.resource_title} (ISBN: {item.book_isbn})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items added */}
        <div className="col summary">
          <div className=''>
            <div className="header">
              <h5>Items added (<span>{selectedItems.length}</span>)</h5>
              <button className="btn" onClick={handleClearItems}>
                <FontAwesomeIcon icon={faTrashCan} />
                Clear items
              </button>
            </div>

            <div className=''>
              {selectedItems.map((item) => (
                <div className="item row mt-2" key={item.resource_id}>
                  <div className="col-3 cover">
                    <img src={`data:image/jpeg;base64,${item.cover}` || 'https://via.placeholder.com/100'} alt={item.title} />
                  </div>
                  <div className="col-8 info">
                    <p className='ttle'>{item.resource_title}</p>
                    <p className='qnty'>Quantity: <span>1</span></p>
                  </div>
                  <div className="col-1 remove" onClick={() => handleRemoveItem(item.resource_id)}>
                    <FontAwesomeIcon icon={faX} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='checkout'>
            {/* <Link to='/circulation/patron/item/checkout'> */}
              <button disabled={isDisabled}
                className="btn checkout-btn"
                onClick={() => {
                  localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
                  localStorage.setItem('id', id);
                  
                  const clickedAction = localStorage.getItem('clickedAction');
    
                  // Navigate based on the clickedAction value
                  if (clickedAction === 'Check In') {
                    navigate('/circulation/patron/item/checkin');
                  } else {
                    navigate('/circulation/patron/item/checkout');
                  }

                }}
              >
                Proceed to {actionLabel.toLowerCase()}
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            {/* </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CirculationSelectItem;
