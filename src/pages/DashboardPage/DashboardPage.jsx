import React, { useEffect, useState } from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import Dashboard from '../../components/Dashboard/Dashboard'
import './DashboardPage.css'


const DashboardPage = () => {
  
  return (
    <div className='dashpage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <Dashboard/>
      </div>
    </div>
  )
}

export default DashboardPage
