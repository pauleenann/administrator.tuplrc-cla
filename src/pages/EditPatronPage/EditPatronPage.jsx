import React from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import EditPatron from '../../components/EditPatron/EditPatron'
import './EditPatronPage.css'

function EditPatronPage() {
    return (
        <div className='editpatronpage'>
        <div>
         <AdminNavbar/>
        </div> 
        <div>
          <AdminTopNavbar/>
          <EditPatron/>
        </div>
      </div>
    )
}

export default EditPatronPage