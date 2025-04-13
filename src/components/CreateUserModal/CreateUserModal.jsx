import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './CreateUserModal.css'
import Loading from '../Loading/Loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faX} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

const CreateUserModal = ({open, close,handleChange, createUserAccount, error, formValidation}) => {
    const [roles, setRoles] = useState([])

    useEffect(()=>{
        getRole()
    },[])

    const getRole = async()=>{
        try{
            const response = await axios.get('http://localhost:3001/api/data/roles')
            console.log(response)
            setRoles(response.data)
        }catch(err){
            console.log('Cannot retrieve roles. An error occurred: ', err.message)
        }
    }

    console.log(roles)

    if(!open){
        return null
    }

  return ReactDom.createPortal(
    <div className='create-u-modal-container'>
        {/* overlay */}
        <div className="create-u-modal-overlay overlay"></div>

        {/* modal box */}
        <div className="create-u-modal-box">
           {/* header */}
           <div className="header">
            <h4>Create user account</h4>
            <FontAwesomeIcon icon={faX} onClick={close}/>
           </div>

            <div className="content">
                <div className="col input-box">
                    <label htmlFor="fname">First Name <span>*</span></label>
                    <input type="text" className={`form-control ${error.fname ? 'is-invalid' : ''}`} id='fname' placeholder='Enter first name' name='fname' onChange={handleChange}/>
                    <p className="invalid-feedback m-0">{error.fname}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor="lname">Last Name <span>*</span></label>
                    <input type="text" className={`form-control ${error.lname ? 'is-invalid' : ''}`} id='lname' placeholder='Enter last name' name='lname' onChange={handleChange}/>
                    <p className="invalid-feedback m-0">{error.lname}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor="uname">Username <span>*</span></label>
                    <input type="text" className={`form-control ${error.uname ? 'is-invalid' : ''}`} id='uname' placeholder='Enter username' name='uname' onChange={handleChange} />
                    <p className="invalid-feedback m-0">{error.uname}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor="">Role <span>*</span></label>
                    <select name="role" className={`form-control ${error.role ? 'is-invalid' : ''}`} id="role" onChange={handleChange}>
                        <option value="" disabled selected>Select role</option>
                        {roles.length>0?roles.map(item=>{
                            return <option value={item.role_id} >{item.role_name}</option>
                        }):''}
                        
                    </select>
                    <p className="invalid-feedback m-0">{error.role}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor="" id='pass'>Password <span>*</span></label>
                    <input type="password" className={`form-control ${error.password ? 'is-invalid' : ''}`} id='pass' placeholder='Enter password' name='password' onChange={handleChange}/>
                    <p className="invalid-feedback m-0" >{error.password}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor=""  id='confirm-pass'>Confirm Password <span>*</span></label>
                    <input type="password"  className={`form-control ${error.confirmPassword ? 'is-invalid' : ''}`} id='confirm-pass' placeholder='Confirm password' name='confirmPassword' onChange={handleChange}/>
                    <p className="invalid-feedback m-0" >{error.confirmPassword}</p>
                </div>
            </div>
            <div className="d-flex justify-content-center gap-1 mt-2">
                <button className="btn cancel-btn shadow-sm" onClick={close}>
                    Cancel
                </button>
                <button className="btn create-btn  shadow-sm" onClick={createUserAccount}>
                    Create User
                </button>
            </div>
            
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default CreateUserModal
