import React from 'react'
import { useNavigate } from 'react-router-dom';
import './DashBox.css'

const DashBox = ({icon, title,total, loading}) => {
  const navigate = useNavigate();


  const handleClick = ()=>{
    switch(title){
      case 'Total Visits': 
        navigate('/logbook');
        break;
      case 'Returned Resources':
        navigate('/circulation?filter=returned');
        break;
      case 'Overdue Resources':
        navigate('/circulation?filter=overdue');
        break;
      case 'Borrowed Resources':
        navigate('/circulation?filter=borrowed');
        break;
      default: 
        console.log('Invalid. Please try again later')
    }
  }

  return (
    <>
    {loading
    ?<div className="dash-box2 col shadow-sm">
        <div className="total-box">
            <span className='total'></span>
            <span className='label'></span>
        </div>
        <div className="icon"></div>
    </div>
    :<div className="dash-box col shadow-sm" onClick={handleClick}>
        <div className="total-box">
            <span className='total'>{total}</span>
            <span className='label'>{title}</span>
        </div>
        {icon}
    </div>}
    </>
    
    
  )
}

export default DashBox
