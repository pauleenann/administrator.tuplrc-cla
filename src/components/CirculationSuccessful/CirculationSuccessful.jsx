import React from 'react';
import './CirculationSuccessful.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const CirculationSuccessful = ({ open, close, patronName }) => {
  if (!open) {
    return null;
  }

  // Get the clicked action from localStorage
  const clickedAction = localStorage.getItem('clickedAction');

  // Conditionally set the success message based on the clickedAction value
  const actionMessage =
    clickedAction === 'Check In'
      ? 'Item/s have been successfully returned by:'
      : 'Item/s have been successfully issued to:';

  const confirmationMessage =
    clickedAction === 'Check In'
      ? 'Return confirmation has been sent to the borrower.'
      : 'Email confirmation has been sent to the borrower.';

  return (
    <div className="circ-success-container">
      {/* Overlay */}
      <div className="circ-success-overlay"></div>

      {/* Box */}
      <div className="circ-success-box">
        {/* Close button */}
        <div className="close">
          <button className="btn" onClick={close}>
            <FontAwesomeIcon icon={faX} className="icon" />
          </button>
        </div>
        {/* Patron info */}
        <div className="patron">
          <p>{actionMessage}</p>
          <p>{patronName}.</p>
        </div>
        {/* Email confirmation
        <p className="email mt-4">{confirmationMessage}</p> */}
        {/* Okay button */}
        <Link to={'/circulation'}>
          <button className="btn okay-btn" onClick={close}>
            Okay
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CirculationSuccessful;
