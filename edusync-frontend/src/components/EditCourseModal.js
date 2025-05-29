import React from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

const EditCourseModal = ({ show, onHide, courseData, onChange, onSubmit, error }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Edit Course</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="editCourseTitle">
          <Form.Label>Course Title</Form.Label>
          <Form.Control
            type="text"
            name="Title"
            value={courseData.Title}
            onChange={onChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="editCourseDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="Description"
            value={courseData.Description}
            onChange={onChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="editCourseFile">
          <Form.Label>Upload New File</Form.Label>
          <Form.Control
            type="file"
            name="file"
            onChange={onChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">Save Changes</Button>
      </Form>
    </Modal.Body>
  </Modal>
);

export default EditCourseModal; 