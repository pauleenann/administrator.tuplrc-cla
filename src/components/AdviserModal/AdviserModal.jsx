import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './AdviserModal.css'
import Select from 'react-select'
import { useSelector } from 'react-redux'

const AdviserModal = ({open,close,bookData,addAdviser}) => {

    const adviserList = useSelector(state=>state.adviser.adviser)
    // usestates for manual input
    const [fname,setFname] = useState('')
    const [lname,setLname] = useState('')
    const [adviser,setAdviser] = useState('')
    
    // for seleted adviser dun sa dropdown
    const [selectedAdviser, setSelectedAdviser] = useState('')
    //console.log(`${fname} ${lname}`)

    // everytime na nagbabago ung fname and lname, mababago rin yung adviser usestate
    useEffect(()=>{
        setAdviser(`${fname} ${lname}`)
    },[fname,lname])

    useEffect(()=>{
        setFname('')
        setLname('')
        setAdviser('')
        setSelectedAdviser('')
    },[bookData])

   
    // kapag may pinili or tinanggal ka sa dropdown
    const handleAdviser = (item)=>{
        console.log(item)
        if(item){
           setSelectedAdviser(item.value) 
        }else{
            setSelectedAdviser('') //remove choice is 'x' is clicked
        }
    }

    if(!open){
        return null
    }else{
        console.log('adviser-modal')
    }

    console.log(fname.length)
  return ReactDom.createPortal(
    <div className='adviser-modal-container'>
        {/* overlay */}
        <div className="adviser-modal-overlay overlay"></div>

        {/* modal box */}
        <div className="adviser-modal-box">
            {/* header */}
            <div className="adviser-modal-header">
                <span>Add Adviser</span>
                <i class="fa-solid fa-xmark" onClick={close}></i>
            </div>
            {/* add adviser input */}
            <div className="row adviser-inputs">
                {/* search adviser */}
                <div className="col-12 adviser-search">
                    <label htmlFor="">Search adviser's name</label>
                    <Select 
                    options={adviserList}
                    placeholder="Search adviser's name"
                    classNamePrefix="select"
                    isClearable
                    onChange={handleAdviser}
                    isDisabled={fname.length>0||lname.length>0}/>
                </div>
                <div className="col-12 modal-reminder">
                    Can’t find adviser? Add manually below
                </div>
                {/* add manually */}
                <div className="col-12 adviser-name">
                    <label htmlFor="">Last name</label>
                    <input type="text" name="" id="" placeholder="Enter adviser's last name"
                    onChange={(e)=>setLname(e.target.value)} disabled={selectedAdviser!=''}
                    />
                </div>
                <div className="col-12 adviser-name">
                    <label htmlFor="">First name</label>
                    <input type="text" name="" id="" placeholder="Enter adviser's first name"
                    onChange={(e)=>setFname(e.target.value)} disabled={selectedAdviser!=''}/>
                </div>
                {/* button */}
                <div className="col-12 adviser-button">
                    <button className="adviser-cancel" onClick={close}>
                    Cancel
                    </button>
                    <button className="adviser-save" onClick={()=>{
                        // if manual ininput ung adviser
                        if(adviser){
                            addAdviser(adviser)
                        }
                        // if pinili sa dropdown
                        if(selectedAdviser){
                            addAdviser(selectedAdviser)
                        }
                        close()
                        
                        }} disabled={adviser.length==0&&selectedAdviser.length==0?true:false}>
                        Save
                    </button>
                </div>

            </div>
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default AdviserModal
