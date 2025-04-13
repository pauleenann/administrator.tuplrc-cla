import React from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import './ReportsPage.css'
import Reports from '../../components/Reports/Reports'

const ReportsPage = () => {
  return (
    <div className='reportspage'>
      <div>
        <AdminNavbar/>
        </div> 
        <div>
            <AdminTopNavbar/>
            <Reports/>
        </div>
    </div>
  )
}

export default ReportsPage
