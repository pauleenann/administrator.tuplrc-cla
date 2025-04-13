import React from 'react'
import './CirculationSelectPatronPage.css'
import CirculationSelectPatron from '../../components/CirculationSelectPatron/CirculationSelectPatron'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'

const CirculationSelectPatronPage = () => {
  return (
    <div className='circselectpatpage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <CirculationSelectPatron/>
      </div>
    </div>
  )
}

export default CirculationSelectPatronPage
