import React, { useEffect, useState } from 'react';
import './ResourceStatusModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faTriangleExclamation,faFaceSadTear } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const ResourceStatusModal = ({ open, content, close, path }) => {
    const navigate = useNavigate();
    const [icon, setIcon] = useState(null);

    useEffect(() => {
        console.log("Content status:", content.status);
        switch (content.status) {
            case 'success':
            case 'edited':
                setIcon(<FontAwesomeIcon icon={faCircleCheck} className="icon" />);
                break;
            case 'error':
                setIcon(<FontAwesomeIcon icon={faTriangleExclamation} className="icon" />);
                break;
            case 'duplicated':
                setIcon(<FontAwesomeIcon icon={faFaceSadTear} className="icon"/>)
                break;
            default:
                setIcon(null);
                break;
        }
    }, [content.status]);

    if (!open) {
        return null;
    }


    return (
        <div className="res-status-container">
            {/* Overlay */}
            <div className="res-status-overlay"></div>

            {/* Box */}
            <div className="res-status-box">
                {icon}
                <span>{content.message}</span>
                <button
                    className="btn"
                    onClick={() => {
                        close();
                        !path?navigate('/catalog'):navigate(path)
                    }}
                >
                    Okay
                </button>
            </div>
        </div>
    );
};

export default ResourceStatusModal;
