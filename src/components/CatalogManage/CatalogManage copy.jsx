import React, { useState, useEffect, useRef } from 'react';
import './CatalogManage.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faTrashCan, faX, faArrowRight, faBookOpenReader } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Table, Button, Form, Card, Pagination } from "react-bootstrap";

const CatalogManage = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    getDepartments();
    getTopics();
  }, []);

  const getDepartments = async () => {
    try{
      const response = await axios.get('http://localhost:3001/api/data/departments').then(res=>res.data)
      setDepartments(response)
      console.log(response)
    }catch(err){
        console.log("Couldn't retrieve department online. An error occurred: ", err.message)
    }
  }

  const getTopics =async ()=>{
    try{
        const response = await axios.get('http://localhost:3001/api/data/topic').then(res=>res.data)
        setTopics(response)
        console.log(response)
    }catch(err){
        console.log("Couldn't retrieve topics online. An error occurred: ", err.message)
    }
  }

  return (
    <div> 
            <div className='circ-select-item-container'>
              <h1>Cataloging</h1>

              {/* Path and back */}
              <div className="back-path">
                <button onClick={() => navigate(-1)} className="btn">Back</button>
                <p>Cataloging / <span>Manage Catalog</span></p>
              </div>

              <div className="row add-items">
                {/* Scan or manual */}
                <div className="col scan-manual">
                 <span className='fw-bold fs-3'>Departments</span>

                  <div className='departments'>
                    {departments.map((dept, index) => (
                      <button className='btn border border-danger rounded-3 d-flex mb-2 w-100' 
                        key={dept.dept_id}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${dept.dept_id}`}
                        aria-expanded="false"
                        aria-controls={`collapse${dept.dept_id}`}>
                        <div key={index} className='dept '>
                            <FontAwesomeIcon icon={faBookOpenReader} className='ms-2 me-3'/>
                            <span className='col text-capitalize'>{dept.dept_name}</span> 
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Items added */}
                <div className="col summary">
                    {departments.map((item) => (
                      <div className="col accordion" id="accordionExample" key={item.dept_id}>
                        <div className="collapse multi-collapse" id={`collapse${item.dept_id}`}>
                          <Card className="row d-flex mb-2 w-100 h-100">
                            <div className="card card-body">{item.dept_name}</div>
                          </Card>
                        </div>
                      </div>
                    ))}
                  
                  
                  <div class="row">
                    
                    
                  </div>
                </div>
              </div>
            </div>

    </div>
  );
};

export default CatalogManage;
