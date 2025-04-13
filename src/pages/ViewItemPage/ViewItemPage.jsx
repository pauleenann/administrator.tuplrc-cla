import React from 'react'
import './ViewItemPage.css'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import ViewItem from '../../components/ViewItem/ViewItem'

const ViewItemPage = () => {
  return (
    <div className='viewitempage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <ViewItem/>
      </div>
    </div>
  )
}

export default ViewItemPage
