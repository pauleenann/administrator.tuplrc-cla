import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpenReader, faPlus, faPen, faTrash, faChevronDown, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Container, Row, Col, Button, Modal, Form, Card, Badge, Table, Alert } from 'react-bootstrap';
import './CatalogManage.css'

const CatalogManage = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [topics, setTopics] = useState([]);
  
  // Form state
  const [deptName, setDeptName] = useState("");
  const [shelfNo, setShelfNo] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicRowNo, setTopicRowNo] = useState("");
  
  // Edit state
  const [editDeptId, setEditDeptId] = useState(null);
  const [editTopicId, setEditTopicId] = useState(null);
  
  // Modal state
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDepartments();
  }, []);

  const getDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3001/api/data/departments');
      setDepartments(response.data);
      setError(null);
    } catch (err) {
      setError("Couldn't retrieve department data. Error: " + err.message);
      console.error("Error fetching departments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectedDepartment = async (id) => {
    setSelectedDepartmentId(id);
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3001/api/data/topic/${id}`);
      setTopics(response.data);
      setError(null);
    } catch (err) {
      setError("Couldn't retrieve topics. Error: " + err.message);
      console.error("Error fetching topics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSelectedDepartment(departments.find(dept => dept.dept_id === selectedDepartmentId) || null);
  }, [selectedDepartmentId, departments]);

  // Department modal handlers
  const openDeptModal = (dept = null) => {
    if (dept) {
      setDeptName(dept.dept_name);
      setShelfNo(dept.dept_shelf_no);
      setEditDeptId(dept.dept_id);
    } else {
      setDeptName("");
      setShelfNo("");
      setEditDeptId(null);
    }
    setShowDeptModal(true);
  };

  // Topic modal handlers
  const openTopicModal = (topic = null) => {
    if (topic) {
      setTopicName(topic.topic_name);
      setTopicRowNo(topic.topic_row_no);
      setEditTopicId(topic.topic_id);
    } else {
      setTopicName("");
      setTopicRowNo("");
      setEditTopicId(null);
    }
    setShowTopicModal(true);
  };

  const handleSaveDept = async () => {
    if (!deptName.trim() || !shelfNo.trim()) {
      setError("Please fill in all department fields.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:3001/api/data/dept", {
        dept_name: deptName,
        dept_shelf_no: shelfNo,
        dept_id: editDeptId,
      });

      if (response.data.success) {
        await getDepartments();
        setShowDeptModal(false);
        setError(null);
      } else {
        setError("Error saving department: " + response.data.message);
      }
    } catch (error) {
      setError("Failed to save department: " + error.message);
      console.error("Error saving department:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTopic = async () => {
    if (!topicName.trim() || !topicRowNo.trim() || !selectedDepartmentId) {
      setError("Please fill in all topic fields.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:3001/api/data/topic", {
        topic_name: topicName,
        topic_row_no: topicRowNo,
        dept_id: selectedDepartmentId,
        topic_id: editTopicId,
      });

      if (response.data.success) {
        await handleSelectedDepartment(selectedDepartmentId);
        setShowTopicModal(false);
        setTopicName("");
        setTopicRowNo("");
        setError(null);
      } else {
        setError("Error saving topic: " + response.data.message);
      }
    } catch (error) {
      setError("Failed to save topic: " + error.message);
      console.error("Error saving topic:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="manage-catalog bg-light min-vh-100">
      <Row className="">
        <Col>
          <h1 className="display-5 fw-bold">Cataloging</h1>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        {/* Department List */}
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Departments</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                <small>Select a department to manage its topics</small>
              </p>
              
              <div className="list-group mb-4">
                {isLoading && departments.length === 0 ? (
                  <div className="text-center py-3">
                    <div class="spinner-grow text-danger" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                  </div>
                ) : departments.length === 0 ? (
                  <p className="text-center text-muted py-3">No departments available</p>
                ) : (
                  departments.map((dept) => (
                    <button
                      key={dept.dept_id}
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                        selectedDepartmentId === dept.dept_id ? 'active' : ''
                      }`}
                      onClick={() => handleSelectedDepartment(dept.dept_id)}
                    >
                      <div>
                        <FontAwesomeIcon icon={faBookOpenReader} className="me-2" />
                        <span className="text-capitalize">{dept.dept_name}</span>
                      </div>
                      <Badge className='pill-bg' pill>
                        Shelf {dept.dept_shelf_no}
                      </Badge>
                    </button>
                  ))
                )}
              </div>
              
              <Button 
                className="w-100 d-flex align-items-center justify-content-center gap-2 add-btn border-0"
                onClick={() => openDeptModal()}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add New Department
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Department Details */}
        <Col md={8}>
          {selectedDepartment ? (
            <Card className="shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Department Details</h5>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => openDeptModal(selectedDepartment)}
                >
                  <FontAwesomeIcon icon={faPen} className="me-1" /> Edit
                </Button>
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Department Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedDepartment.dept_name}
                        className="text-capitalize"
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Shelf Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedDepartment.dept_shelf_no}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <h5 className="border-bottom pb-2 mb-3">
                  Topics under {selectedDepartment.dept_name}
                </h5>
                
                {isLoading && topics.length === 0 ? (
                  <div className="text-center py-3">
                    <div class="spinner-grow text-danger" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                  </div>
                ) : topics.length === 0 ? (
                  <p className="text-center text-muted py-3">No topics available for this department</p>
                ) : (
                  <Table responsive hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Topic Name</th>
                        <th className="text-center">Row Number</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topics.map((topic) => (
                        <tr key={topic.topic_id}>
                          <td className="text-capitalize">{topic.topic_name}</td>
                          <td className="text-center">{topic.topic_row_no}</td>
                          <td className="text-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => openTopicModal(topic)}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                
                <Button
                  className="mt-3 d-flex align-items-center gap-2 add-btn border-0"
                  onClick={() => openTopicModal()}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add New Topic
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm text-center p-5">
              <Card.Body>
                <FontAwesomeIcon icon={faBookOpenReader} size="3x" className="text-muted mb-3" />
                <h5>Select a Department</h5>
                <p className="text-muted">Choose a department from the list to view and manage its topics</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Department Modal */}
      <Modal show={showDeptModal} onHide={() => setShowDeptModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editDeptId ? 'Edit Department' : 'Add Department'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Department Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter department name"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="fw-bold">Shelf Number</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter shelf number"
                value={shelfNo}
                onChange={(e) => setShelfNo(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeptModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveDept}
            disabled={isLoading}
            style={{ backgroundColor: "#94152b", borderColor: "#94152b" }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Topic Modal */}
      <Modal show={showTopicModal} onHide={() => setShowTopicModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editTopicId ? 'Edit Topic' : 'Add Topic'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Topic Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter topic name"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="fw-bold">Row Number</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter row number"
                value={topicRowNo}
                onChange={(e) => setTopicRowNo(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTopicModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveTopic}
            disabled={isLoading}
            style={{ backgroundColor: "#94152b", borderColor: "#94152b" }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CatalogManage;