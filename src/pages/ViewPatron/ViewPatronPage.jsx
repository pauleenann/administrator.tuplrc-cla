import React from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import './ViewPatronPage.css'
import ViewPatron from '../../components/ViewPatron/ViewPatron'

const ViewPatronPage = () => {
  return (
    <div className='viewpatronpage'>
      <div>
        <AdminNavbar/>
        </div> 
        <div>
            <AdminTopNavbar/>
            <ViewPatron/>
        </div>
    </div>
  )
}

export default ViewPatronPage
