import React from 'react'
import './CirculationSelectItem.css'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode,faPlus,faTrashCan,faX,faArrowRight } from '@fortawesome/free-solid-svg-icons';


const CirculationSelectItem = () => {
  const navigate = useNavigate();
  return (
    <div className='circ-select-item-container'>
      <h1>Circulation</h1>

      {/* path and back */}
      <div className="back-path">
        <button onClick={() => navigate(-1)}className="btn">Back</button>
        <p>Circulation / Select patron / <span>Select item</span></p>
      </div>

      {/*  */}
      <div className="row add-items">
        {/* scan or manual */}
        <div className="col scan-manual">
          {/* scan barcode */}
          <div className="barcode">
            <FontAwesomeIcon icon={faBarcode} className='icon'/>
            <p>Scan items in the scanner <br/>to be checked out</p>
          </div>
          <p>No barcode available? Input manually instead</p>
          {/* isbn */}
          <div className='circ-info'>
            <label htmlFor="">ISBN</label>
            <input type="text" name="" id="" placeholder='Enter ISBN'/>
          </div>
          {/* title */}
          <div className='circ-info'>
            <label htmlFor="">Title</label>
            <input type="text" name="" id="" placeholder='Enter Title'/>
          </div>
          {/* button */}
          <button className="btn add-btn">
            <FontAwesomeIcon icon={faPlus} />
            Add item
          </button>
        </div>

        {/* items added */}
        <div className="col summary">
          <div>
            {/* header */}
            <div className="header">
              <h5>Items added (<span>0</span>)</h5>
              {/* clear items */}
              <button className="btn">
                <FontAwesomeIcon icon={faTrashCan} />
                Clear items
              </button>
            </div>

            {/* items */}
            <div className="item row">
              {/* cover */}
              <div className="col-3 cover">
                <img src="https://i.pinimg.com/originals/a1/f8/87/a1f88733921c820db477d054fe96afbb.jpg" alt="" />
              </div>
              {/* item info */}
              <div className="col-8 info">
                <p className='title'>Book Title</p>
                <p className='qnty'>Quantity: <span>1</span></p>
              </div>
              {/* remove item button */}
              <div className="col remove">
                <FontAwesomeIcon icon={faX} />
              </div>
            </div>
          </div>
          
          {/* proceed to checkout */}
          <div className='checkout'>
            <Link to='/circulation/patron/item/checkout'>
              <button className="btn checkout-btn">
                Proceed to checkout
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}

export default CirculationSelectItem