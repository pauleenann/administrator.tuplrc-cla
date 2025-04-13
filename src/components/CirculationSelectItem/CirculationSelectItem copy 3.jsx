import React, { useState, useEffect, useRef } from 'react';
import './CirculationSelectItem.css';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faTrashCan, faX, faArrowRight, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const CirculationSelectItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItems, setSelectedItems] = useState(() => {
    const savedItems = localStorage.getItem('selectedItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const actionSelected = localStorage.getItem('clickedAction') || 'Check Out';
  const actionLabel = actionSelected === 'Check In' ? 'Check In' : 'Check Out';
  const isDisabled = selectedItems.length === 0 || selectedItems.length > 1;
  const searchInputRef = useRef(null);

  const [preview, setPreview] = useState(null)

  // Save selected items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
  }, [selectedItems]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const endpoint = actionSelected === 'Check In' ? '/checkin/search' : '/checkout/search';

    try {
      const response = await axios.get(`http://localhost:3001/api/circulation${endpoint}`, {
        params: {
          query,
          ...(actionSelected === 'Check In' && { patron_id: id }),
        },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Failed to fetch suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Fetching moved to the debounced effect
  };

  const handleAddItem = (item) => {
    const exists = selectedItems.find((i) => i.resource_id === item.resource_id);
    if (!exists) {
      setSelectedItems([...selectedItems, item]);
    }
    setSearchQuery('');
    setSuggestions([]);
    searchInputRef.current?.focus();
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.resource_id !== id));
  };

  const handleClearItems = () => {
    setSelectedItems([]);
  };

  const handleProceed = () => {
    localStorage.setItem('id', id);
    
    // Navigate based on the action
    if (actionSelected === 'Check In') {
      navigate('/circulation/patron/item/checkin');
    } else {
      navigate('/circulation/patron/item/checkout');
    }
  };

  const handleKeyDown = (e) => {
    // Allow adding the first suggestion with Enter key
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleAddItem(suggestions[0]);
    }
  };

  useEffect(()=>{
    if(!selectedItems[0].cover) return;

    try {
        setPreview(URL.createObjectURL(selectedItems[0].cover))
    } catch (error) {
        setPreview(`https://api.tuplrc-cla.com/${selectedItems[0].cover}`);
    }
},[selectedItems[0].cover])

  return (
    <div className='circ-select-item-container bg-light'>
      <h1>Book Circulation</h1>

      {/* Path and back */}
      <div className="back-path">
        <button onClick={() => navigate(-1)} className="btn">Back</button>
        <p>Book Circulation / Select patron / <span>Select item</span></p>
      </div>

      <div className="row add-items">
        {/* Scan or manual */}
        <div className="col scan-manual shadow-sm">
          <div className="barcode">
            <FontAwesomeIcon icon={faBarcode} className='barcode-icon' />
            <p>Scan items in the scanner <br />to be {actionLabel.toLowerCase()}.</p>
          </div>
          <p>No barcode available? Input manually instead</p>

          <div className='circ-info'>
            <label htmlFor="item-search">ISBN / Title</label>
            <input
              id="item-search"
              ref={searchInputRef}
              type="text"
              placeholder={`Enter ISBN or Title for ${actionLabel}`}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-label="Search by ISBN or Title"
            />
          </div>

          {isLoading && <div className="loading">Loading suggestions...</div>}
          
          {error && <div className="error-message">{error}</div>}

          {suggestions.length > 0 && (
            <div className="suggestions" role="listbox">
              {suggestions.map((item) => (
                <div
                  key={item.resource_id}
                  className="suggestion-item"
                  onClick={() => handleAddItem(item)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem(item)}
                >
                  <span>{item.resource_title} (ISBN: {item.book_isbn})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items added */}
        <div className="col summary shadow-sm">
          <div className='selected-items'>
            <div className="header">
              <h5>Items added (<span>{selectedItems.length}</span>)</h5>
              <button 
                className="btn" 
                onClick={handleClearItems}
                disabled={selectedItems.length === 0}
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Clear items
              </button>
            </div>

            <div className='items-list'>
              {selectedItems.length === 0 ? (
                <div className="no-items d-flex flex-column align-items-center justify-content-center gap-2 mt-4">
                  <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
                  <span>No items selected.</span>
                </div>
              ) : (
                selectedItems.map((item) => (
                  <div className="item row mt-2" key={item.resource_id}>
                    <div className="col-3 cover">
                      <img 
                        src={preview} 
                        alt={`Cover of ${item.resource_title}`}
                      />
                    </div>
                    <div className="col-8 info">
                      <p className='mt-2 mb-0 fs-5'>{item.resource_title}</p>
                      <p className='qnty justify-content-start'>ISBN: {item.book_isbn || "Unknown"}</p>
                      <p className='qnty'>Author/s: {item.authors || "Unknown"}</p>
                      <p className='qnty'>Publisher: {item.publisher || "Unknown"}</p>
                      <p className='qnty'>Quantity: <span>1</span></p>
                    </div>
                    <div className="col-1 remove" onClick={() => handleRemoveItem(item.resource_id)}>
                      <FontAwesomeIcon icon={faX} aria-label={`Remove ${item.resource_title}`} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className='checkout'>
            <button 
              disabled={isDisabled}
              className="btn checkout-btn"
              onClick={handleProceed}
            >
              Proceed to {actionLabel.toLowerCase()}
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CirculationSelectItem;