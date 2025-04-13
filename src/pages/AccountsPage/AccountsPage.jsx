import React from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import './AccountsPage.css'
import Accounts from '../../components/Accounts/Accounts'


const AccountsPage = () => {
  return (
    <div className='accountspage'>
      <div>
        <AdminNavbar/>
        </div> 
        <div>
            <AdminTopNavbar/>
            <Accounts/>
        </div>
    </div>
  )
}

export default AccountsPage

