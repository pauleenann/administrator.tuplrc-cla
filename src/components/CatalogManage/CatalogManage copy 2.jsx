import React, { useState, useEffect } from 'react';
import './CatalogManage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpenReader, faPlus, faPen, faTrash, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const CatalogManage = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isEdit,setIsEdit] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [shelfNo, setShelfNo] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicRowNo, setTopicRowNo] = useState("");
  const [editDeptId, setEditDeptId] = useState(null);
  const [editTopicId, setEditTopicId] = useState(null);


  useEffect(() => {
    getDepartments();

  }, []);

  const getDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/data/departments');
      setDepartments(response.data);
    } catch (err) {
      console.log("Couldn't retrieve department data. Error:", err.message);
    }
  };


  const handleSelectedDepartment = async (id) => {
    setSelectedDepartmentId(id);
    try{
      const response = await axios.get(`http://localhost:3001/api/data/topic/${id}`).then(res=>res.data)
      setTopics(response)
      
      console.log(response)
    }catch(err){
        console.log("Couldn't retrieve topics online. An error occurred: ", err.message)
    }
  };

  useEffect(() => {
    setSelectedDepartment(departments.find(dept => dept.dept_id === selectedDepartmentId) || null);
    // setSelectedTopics(topics.filter(topic=>topic.topic_id ===))
  }, [selectedDepartmentId, departments]);

  console.log(selectedDepartmentId); 

  const handleSaveDept = async () => {
        if (!deptName.trim() || !shelfNo.trim()) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/api/data/dept", {
                dept_name: deptName,
                dept_shelf_no: shelfNo,
                dept_id: editDeptId,
            });

            if (response.data.success) {
              // alert("Department added/edited successfully!");
                getDepartments();
                /* setDeptName("");
                setShelfNo("");
                setEditDeptId(null); */
                document.querySelector('#AddDept .btn-close').click();
                
            } else {
                alert("Error adding department: " + response);
            }
        } catch (error) {
            console.error("Error saving department:", error);
            alert("Failed to save department.");
        }
    };

    const handleSaveTopic = async () => {
      if (!topicName.trim() || !topicRowNo.trim() || !selectedDepartmentId) {
          alert("Please fill in all fields.");
          return;
      }

      try {
          const response = await axios.post("http://localhost:3001/api/data/topic", {
              topic_name: topicName,
              topic_row_no: topicRowNo,
              dept_id: selectedDepartmentId,
              topic_id: editTopicId,
          });

          if (response.data.success) {
              // alert("Topic added/edited successfully!");
              setTopicName("");
              setTopicRowNo("");
              document.querySelector('#AddTopic .btn-close').click();
              handleSelectedDepartment(selectedDepartmentId);
          } else {
              alert("Error adding topic: " + response);
          }
      } catch (error) {
          console.error("Error saving topic:", error);
          alert("Failed to save topic.");
      }
  };

  return (
    <div className="manage-catalog bg-light">
      <h1>Cataloging</h1>

      {/* Path and back */}
      <div className="back-path">
        <p>Cataloging / <span>Manage Catalog</span></p>
      </div>

      {/* Columns */}
      <div className="row">
        {/* Department List */}
        <div className="col d-flex flex-column align-items-start gap-3">
          {/* Department Dropdown */}
          <div className='d-flex flex-column align-items-start'>
            <div>
            <span className='fw-semibold fs-4'>Departments</span>
            </div>
            <span className='instructions mt-3'>* Choose the department you want to manage</span>
          </div>
          

          {/* Department Buttons */}
          {departments.map(item => (
            <div className='row justify-content-between w-100 me-5 pe-5 ps-5 '>
              <div className='text-capitalize col flex-column align-items-start d-flex justify-content-center '>
                <button 
                  key={item.dept_id} // ✅ Added key to avoid React warnings
                  className="d-flex gap-4 align-items-center px-4 dept-btn border-0 bg-transparent text-capitalize"
                  onClick={() => {handleSelectedDepartment(item.dept_id); setDeptName(item.dept_name); setShelfNo(item.dept_shelf_no); setEditDeptId(item.dept_id)}}
                >
                  <FontAwesomeIcon icon={faBookOpenReader}/>
                  {item.dept_name}
                </button>
              </div>

              {/* <div className='text-capitalize col-1 flex-column align-items-center d-flex justify-content-center pe-5 me-5'>
                <button className="btn trash-btn " data-bs-toggle="modal" data-bs-target="#AddDept" onClick={()=>{setEditDeptId(item.dept_id); setDeptName(item.dept_name); setShelfNo(item.dept_shelf_no)}}>
                  <FontAwesomeIcon icon={faPen} className="icon" />
                </button>
              </div> */}
                  
              

            </div>
            
          ))}

          {/* Add Department */}
          <button className="btn d-flex gap-3 align-items-center add-dept-btn mt-5" data-bs-toggle="modal" data-bs-target="#AddDept" onClick={()=>{setEditDeptId(null); setDeptName(""); setShelfNo("")}}> 
            <FontAwesomeIcon icon={faPlus}/>
            Add new department
          </button>
        </div>

        {/* Selected Department Section */}
        {selectedDepartment?
        <div className="col d-flex flex-column justify-content-between selected rounded p-4 shadow-sm ">
        
          <div className='d-flex flex-column gap-3'>
            

            {/* Department Name Input */}
            <div className='row d-flex'>
              <div className="col d-flex flex-column fw-semibold ">
                <label>Department Name</label>
                <input 
                  type="text" 
                  className="rounded p-2 text-capitalize" 
                  value={selectedDepartment ? selectedDepartment.dept_name : ""} 
                  readOnly
                />
              </div>

              {/* shelf no */}
              <div className="col-2 d-flex flex-column fw-semibold ">
                <label>Shelf No.</label>
                <input 
                  type="number" 
                  className="rounded p-2 text-capitalize" 
                  value={selectedDepartment ? selectedDepartment.dept_shelf_no : ""} 
                  readOnly
                />
              </div>

              {/* Edit Button */}
              <div className="col-2 d-flex flex-column fw-semibold  align-self-end align-items-center d-flex justify-content-center">
                <label>Edit</label>
                <button 
                  className="btn  edit-btn p-2 "
                  onClick={()=>setIsEdit(!isEdit) }
                  data-bs-toggle="modal" data-bs-target="#AddDept"
                >
                  <FontAwesomeIcon icon={faPen}/>
                </button>
                
              </div>
              
            </div> 

            {/* topics under chosen department */}
            <div className='gap-2 container'>
              {/* dropdown */}
              <div className='row justify-content-between'> 

                <div className="col  fw-semibold mt-4 align-self-start">
                  <span>Topics under {selectedDepartment.dept_name} &nbsp; <FontAwesomeIcon icon={faChevronDown} /></span>
                </div>
                <div className="col-2 fw-semibold mt-4 align-self-end align-items-center d-flex justify-content-center">
                  <span>Row</span>
                </div>
                <div className="col-1 fw-semibold mt-4 align-self-end align-items-center d-flex justify-content-center">
                  <span>Edit</span>
                </div>

              </div>
              
              {/* topics */}
              <div className=''>
                {topics.map(topic=>(
                  <div key={topic.topic_id} className='row justify-content-between'> 
                    <div  className='p-2 border-bottom border-top text-capitalize col flex-column' >
                      
                      <input placeholder={topic.topic_name} value={topic.topic_name}  type="text" className="rounded p-2 ps-3 text-capitalize w-100" />
                    
                    </div>
                    <div  className='p-2 border-bottom border-top text-capitalize col-2 flex-column align-items-center d-flex justify-content-center' >
                      <input placeholder={topic.topic_row_no} value={topic.topic_row_no} type="number" className="rounded p-2  text-capitalize w-50" />
                    </div>
                    <div className='p-2 border-bottom border-top text-capitalize col-1 flex-column align-items-center d-flex justify-content-center'>
                      

                      <button 
                        className="btn d-flex align-items-center gap-2 text-end edit-btn"
                        onClick={()=>{setIsEdit(!isEdit); setTopicName(topic.topic_name); setTopicRowNo(topic.topic_row_no); setEditTopicId(topic.topic_id)}}
                        data-bs-toggle="modal" data-bs-target="#AddTopic"
                      >
                        <FontAwesomeIcon icon={faPen}/>
                        
                      </button>

                    </div>
                  </div>
                ))}
                
              </div>
              
              {/* add new topic */}
              <button className="btn add-topic d-flex align-items-center gap-3 mt-3" data-bs-toggle="modal" data-bs-target="#AddTopic" onClick={()=>{setEditTopicId(null); setTopicName(""); setTopicRowNo("")}}>
                <FontAwesomeIcon icon={faPlus}/>
                Add new topic
              </button>
            </div>
          </div>
        </div>
        :''}
        
      </div>


      {/*Add Department Modal */}
      <div class="modal fade " id="AddDept" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Add/Edit Department</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <div className='row d-flex'>
              <div className="col d-flex flex-column">
                <label className='fw-bold'>Department Name</label>
                <input 
                  type="text" 
                  className="rounded p-2 text-capitalize" 
                  value={deptName} 
                  onChange={(e) => setDeptName(e.target.value)}
                />
              </div>

              {/* shelf no */}
              <div className="col-2 d-flex flex-column">
                <label className='fw-bold'>Shelf No.</label>
                <input 
                  type="number" 
                  className="rounded p-2 text-capitalize" 
                  value={shelfNo} 
                  onChange={(e) => setShelfNo(e.target.value)}
                />
              </div>
              
            </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" style={{ backgroundColor: "#94152b", borderColor: "#94152b", color: "fff" }}  onClick={handleSaveDept}>Save changes</button>
            </div> 
          </div>
        </div>
      </div>

      {/*Add Topic Modal */}
      <div class="modal fade " id="AddTopic" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Add/Edit Topic</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <div className='row d-flex'>
              <div className="col d-flex flex-column">
                <label className='fw-bold'>Topic Name</label>
                <input 
                  type="text" 
                  className="rounded p-2 text-capitalize" 
                  value={topicName} 
                  onChange={(e) => setTopicName(e.target.value)}
                />
              </div>

              {/* shelf no */}
              <div className="col-2 d-flex flex-column">
                <label className='fw-bold'>Row No.</label>
                <input 
                  type="number" 
                  className="rounded p-2 text-capitalize" 
                  value={topicRowNo} 
                  onChange={(e) => setTopicRowNo(e.target.value)}
                />
              </div>
              {/* style={{ backgroundColor: "#97170E", borderColor: "#97170E", color: "fff"}} */}
            </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" 
                      class="btn"     
                      style={{backgroundColor: "#94152b", color:"#fff", borderColor:"#97170E"}}
                      onClick={handleSaveTopic}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CatalogManage;