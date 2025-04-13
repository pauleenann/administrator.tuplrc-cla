import React from 'react'
import './CirculationSelectItemPage.css'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import CirculationSelectItem from '../../components/CirculationSelectItem/CirculationSelectItem'

const CirculationSelectItemPage = () => {
  return (
    <div className='circselectitempage'>
        <div>
            <AdminNavbar/>
        </div> 
        <div>
            <AdminTopNavbar/>
            <CirculationSelectItem/>
        </div>
    </div>
  )
}

export default CirculationSelectItemPage
