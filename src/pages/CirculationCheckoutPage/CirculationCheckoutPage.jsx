import React from 'react'
import './CirculationCheckoutPage.css'
import CirculationCheckout from '../../components/CirculationCheckout/CirculationCheckout'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'

const CirculationCheckoutPage = () => {
  return (
    <div className='circcheckoutpage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <CirculationCheckout/>
      </div>
    </div>
  )
}

export default CirculationCheckoutPage
