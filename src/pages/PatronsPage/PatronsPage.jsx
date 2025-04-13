import React from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import './PatronsPage.css'
import Patrons from '../../components/Patrons/Patrons'

const PatronsPage = () => {
  return (
    <div className='patronspage'>
      <div>
        <AdminNavbar/>
        </div> 
        <div>
            <AdminTopNavbar/>
            <Patrons/>
        </div>
    </div>
  )
}

export default PatronsPage

