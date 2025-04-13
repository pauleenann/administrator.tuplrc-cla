import React, { useEffect } from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'

import './CatalogManagePage.css'
import CatalogManage from '../../components/CatalogManage/CatalogManage'

const CatalogManagePage = () => {
  useEffect(()=>{
    console.log("Main catalogpage mounted")
  },[])
  return (
    <div className='catalogpage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <CatalogManage/>
      </div>
    </div>
  )
}

export default CatalogManagePage
