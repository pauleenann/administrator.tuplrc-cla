import React, { useEffect } from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'

import './CatalogPage.css'
import Catalog from '../../components/Catalog/Catalog'

const CatalogPage = () => {
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
        <Catalog/>
      </div>
    </div>
  )
}

export default CatalogPage
