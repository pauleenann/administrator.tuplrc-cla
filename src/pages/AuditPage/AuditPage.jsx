import React from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import './AuditPage.css'
import Audit from '../../components/Audit/Audit'

const AuditPage = () => {
  return (
    <div className='auditpage'>
      <div>
        <AdminNavbar/>
        </div> 
        <div>
            <AdminTopNavbar/>
            <Audit/>
        </div>
    </div>
  )
}

export default AuditPage

