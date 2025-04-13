// this is a component for cataloging (active item etc)
import React, { useEffect, useState } from 'react'
import './Cataloging.css'
import axios from 'axios'
import { getAllFromStore } from '../../indexedDb/getDataOffline'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDepartmentOffline, fetchDepartmentOnline, setDepartmentArr } from '../../features/departmentSlice'
import { fetchTopicOffline, fetchTopicOnline, setTopicArr } from '../../features/topicSlice'

const Cataloging = ({disabled,handleChange,bookData,handleToggle,formValidation, error,editMode}) => {
    const dispatch = useDispatch();
    const {department} = useSelector(state=>state.department)
    const {topic} = useSelector(state=>state.topic)
    const [filteredTopic, setFilteredTopic] = useState([])
    const isOnline = useSelector(state=>state.isOnline.isOnline)
    
    useEffect(() => {
        if (isOnline !== null) { 
            if (isOnline) {
                console.log('getting cataloging info online');
                dispatch(fetchDepartmentOnline());
                dispatch(fetchTopicOnline());
            } else {
                dispatch(fetchDepartmentOffline());
                dispatch(fetchTopicOffline());
            }
        }
    }, [isOnline, dispatch]); 
    

    useEffect(()=>{
        const filtered = topic.filter(item=>item.dept_id==bookData.department)
        setFilteredTopic(filtered)
    },[bookData.department])


    console.log(filteredTopic)
    console.log(topic)

  return (
    <div className='cataloging-box shadow-sm'>
        <div className="row">
            {/* header */}
            <div className="col-12 cataloging-info-header">Cataloging</div>

            <div className="row cataloging-inputs">
                {/* cataloging*/}
                <div className="col-12 ">
                    <div className="row">
                        {/* department */}
                        <div className="col-6 info-input-box">
                            <label htmlFor="">Department *</label>
                            <select 
                                className="form-select"
                                name='department'
                                disabled={disabled} 
                                onChange={handleChange} 
                                // onBlur={formValidation}
                                >
                                <option selected disabled className=''>Select department</option>
                                {department.length>0?department.map((item,key)=>(
                                    <option value={item.dept_id} className='dept_name' selected={disabled||editMode?item.dept_id==bookData.department:''}>{item.dept_name}</option>
                                )):''}
                                
                            </select>
                            <p className='resource-error'>{error.department}</p>
                        </div>
                        {/* topic */}
                        {bookData.mediaType=='4'?'':<div className="col-6 info-input-box">
                            <label htmlFor="">Topics *</label>
                            <select 
                                className="form-select" 
                                name='topic' 
                                disabled={disabled} 
                                onChange={handleChange} 
                                // onBlur={formValidation} 
                                value={bookData.topic}
                            >
                                <option value='' selected disabled>Select Topic</option>
                                {filteredTopic.length>0?filteredTopic.map((item,key)=>(
                                    <option value={item.topic_id} selected={disabled||editMode?item.topic_id==bookData.topic:''}>{item.topic_name}</option>
                                )):''}
                            </select>
                            <p className='resource-error'>{error.topic}</p>
                        </div>}
                        
                        {/* shelf no */}
                        {/* <div className="col-3 info-input-box">
                            <label htmlFor="">Shelf No.</label>
                            <input type="number" name='shelfNo' placeholder='Enter shelf number' disabled={disabled?true:false} onChange={handleChange}/>
                        </div> */}
                        {/* active item */}
                        {/* <div className="col-12 mt-5">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="active-item" disabled={disabled?true:false} onChange={handleToggle} name='isActive'/>
                                <div className="switch-label">
                                    <label class="form-check-label" for="active-item">Active Item</label>
                                    <span>Item is available for checking out and OPAC listing</span>
                                </div>
                            </div>
                        </div> */}
                        {/* published*/}
                        {/* <div className="col-12 mt-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="published" disabled={disabled?true:false} onChange={handleToggle} name='isPublished'/>
                                <div className="switch-label">
                                    <label class="form-check-label" for="published">Published</label>
                                    <span>Enable OPAC listing, uncheck if you don't want to put this item on OPAC.</span>
                                </div>
                            </div>
                        </div> */}
                        {/* circulation*/}
                        <div className="col-12 mt-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="circulation" disabled={disabled} onChange={handleToggle} name='isCirculation' checked={bookData.isCirculation}/>
                                <div className="switch-label">
                                    <label class="form-check-label" for="circulation">Circulation</label>
                                    <span>Enable circulation, uncheck if you want to disable circulation for this item.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                
            </div>
        </div>
    </div>
  )
}

export default Cataloging
