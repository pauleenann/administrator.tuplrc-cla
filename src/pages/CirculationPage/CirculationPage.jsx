import React from 'react'
import './CirculationPage.css'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import Circulation from '../../components/Circulation/Circulation'

const CirculationPage = () => {
  return (
    <div className='circpage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <Circulation/>
      </div>
    </div>
  )
}

export default CirculationPage
