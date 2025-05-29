import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Container } from 'react-bootstrap';

const CourseList = ({ courses }) => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
    padding: '32px 0 64px 0',
  }}>
    <Container>
      <h2 style={{
        fontWeight: 500,
        margin: '2rem 0 2.5rem 0',
        color: '#3730a3',
        letterSpacing: '-1px',
        fontSize: '1.7rem',
        textAlign: 'left',
        textShadow: '0 2px 8px #a5b4fc33',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <span role="img" aria-label="courses" style={{ fontSize: 36 }}>📚</span>
        Available Courses
      </h2>
      <Row className="g-4" style={{ justifyContent: 'flex-start' }}>
        {courses && courses.length > 0 ? (
          courses.map(course => (
            <Col key={course.courseId} xs={12} sm={6} md={4} lg={3} style={{ display: 'flex' }}>
              <Card className="h-100 shadow-sm border-0 course-card-hover" style={{ borderRadius: 22, minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
                <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '28px 22px 18px 22px' }}>
                  <div>
                    <Card.Title style={{ fontWeight: 800, fontSize: '1.35rem', marginBottom: 6, color: '#222' }}>{course.title || course.Title}</Card.Title>
                    <div style={{ color: '#888', fontSize: 15, marginBottom: 0 }}>{course.description || course.Description || 'No description.'}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                    <Link to={`/courses/${course.courseId}`} className="btn btn-primary px-4 py-2" style={{ borderRadius: 10, fontWeight: 700, fontSize: 18, width: '100%' }}>View Course</Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <div>No courses available.</div>
          </Col>
        )}
      </Row>
      <style>{`
        .course-card-hover {
          transition: box-shadow 0.18s, transform 0.18s;
        }
        .course-card-hover:hover {
          box-shadow: 0 8px 32px rgba(99,102,241,0.13), 0 1.5px 8px rgba(99,102,241,0.08);
          transform: translateY(-6px) scale(1.035);
        }
      `}</style>
    </Container>
  </div>
);

export default CourseList; 