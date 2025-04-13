import React from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import './AuthorsPage.css'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import Authors from '../../components/Authors/Authors'

const AuthorsPage = () => {
  return (
    <div className='authorspage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <Authors/>
      </div>
    </div>
  )
}

export default AuthorsPage
