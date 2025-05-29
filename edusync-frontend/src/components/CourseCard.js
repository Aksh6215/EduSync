import React from 'react';
import { Card, Button } from 'react-bootstrap';

const CourseCard = ({ course, onEdit, onDelete, onViewDetail }) => {
  return (
    <Card className="h-100 shadow rounded" style={{ border: 'none', minHeight: 180, maxWidth: 350, margin: '0 auto' }}>
      <Card.Body className="d-flex flex-column justify-content-between p-3">
        <div className="mb-2">
          <Card.Title
            style={{ fontWeight: 700, fontSize: '1.3rem', cursor: 'pointer', textDecoration: 'none', marginBottom: 0 }}
            onClick={() => onViewDetail(course)}
            tabIndex={0}
            role="button"
            onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') onViewDetail(course); }}
          >
            {course.Title || course.title || 'No Title'}
          </Card.Title>
          <div style={{ color: '#888', fontSize: '1rem', marginBottom: 8 }}>
            {course.Description || course.description || 'No description available.'}
          </div>
        </div>
        <div className="mt-auto d-flex gap-2 justify-content-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onEdit(course)}
            style={{ minWidth: 70 }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(course.courseId || course.id)}
            style={{ minWidth: 70 }}
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CourseCard; 