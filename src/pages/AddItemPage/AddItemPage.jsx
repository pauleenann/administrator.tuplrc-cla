import React from 'react'
import './AddItemPage.css'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import AddItem from '../../components/AddItem/AddItem'

const AddItemPage = () => {
  console.log('AddItemPage mounted');
  return (
    <div className='additempage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <AddItem/>
      </div>
    </div>
  )
}

export default AddItemPage
