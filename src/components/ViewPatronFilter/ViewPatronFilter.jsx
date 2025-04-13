import React from 'react'

const ViewPatronFilter = ({handleChange,start_name,end_name,type,search}) => {
  return (
    <li className='p-2'>
        <p className='m-0'>Sort by Range:</p>
        <div className='d-flex gap-1 align-items-center'>
            <input type={type} name={start_name} id="" className='p-1' onChange={handleChange}/>
            <span className='m-0'>to</span>
            <input type={type} name={end_name} id="" className='p-1' onChange={handleChange}/>
            <button className="btn search" onClick={search}>Search</button>
        </div>
    </li>
  )
}

export default ViewPatronFilter
