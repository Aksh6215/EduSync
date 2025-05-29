import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Card, Container, Row, Col, Spinner, Alert, Button, Form, Modal } from 'react-bootstrap';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInstructor, setIsInstructor] = useState(false);

  const [showAddAssessmentForm, setShowAddAssessmentForm] = useState(false);
  const [newAssessmentData, setNewAssessmentData] = useState({
    Title: '',
    MaxScore: '',
    questions: []
  });
  const [addAssessmentError, setAddAssessmentError] = useState('');
  const [addAssessmentSuccess, setAddAssessmentSuccess] = useState('');

  const [courseAssessments, setCourseAssessments] = useState([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const [assessmentsError, setAssessmentsError] = useState('');

  const [studentResults, setStudentResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editAssessmentData, setEditAssessmentData] = useState(null);
  const [editAssessmentError, setEditAssessmentError] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setIsInstructor(userRole?.toLowerCase() === 'instructor');

    const fetchCourseDetails = async () => {
      try {
        const response = await api.get(`/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCourse(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch course details.');
        setLoading(false);
        console.error('Error fetching course details:', err);
      }
    };

    const fetchAssessments = async () => {
      setAssessmentsLoading(true);
      try {
        const response = await api.get('/Assessments', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const filtered = response.data.filter(a => {
          const aCourseId = a.CourseId || a.courseId;
          return aCourseId && aCourseId.toString() === courseId.toString();
        });
        setCourseAssessments(filtered);
        setAssessmentsLoading(false);
      } catch (err) {
        setAssessmentsError('Failed to load assessments for this course.');
        setAssessmentsLoading(false);
        console.error('Error fetching assessments for course:', err);
      }
    };

    const fetchStudentResults = async () => {
      if (isInstructor) {
        setResultsLoading(true);
        try {
          const response = await api.get('/Results', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          const courseAssessmentIds = courseAssessments.map(a => a.AssessmentId || a.assessmentId);
          const filteredResults = response.data.filter(result => 
            courseAssessmentIds.includes(result.AssessmentId || result.assessmentId)
          );
          setStudentResults(filteredResults);
          setResultsLoading(false);
        } catch (err) {
          setResultsError('Failed to load student results.');
          setResultsLoading(false);
          console.error('Error fetching student results:', err);
        }
      }
    };

    fetchCourseDetails();
    fetchAssessments();
    fetchStudentResults();
  }, [courseId, isInstructor]);

  const handleAddAssessmentInputChange = (e) => {
    const { name, value } = e.target;
    // Store MaxScore as string, parse on submit
    setNewAssessmentData({ ...newAssessmentData, [name]: value });
  };

  const handleAddQuestion = () => {
    setNewAssessmentData({
      ...newAssessmentData,
      questions: [...newAssessmentData.questions, { text: '', type: 'Multiple Choice', options: ['', '', '', ''], correctAnswer: '', points: '' }] // Store points as string
    });
  };

  const handleQuestionInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedQuestions = newAssessmentData.questions.map((question, i) => {
      if (i === index) {
        // Store points as string, parse on submit
        return { ...question, [name]: value };
      }
      return question;
    });
    setNewAssessmentData({ ...newAssessmentData, questions: updatedQuestions });
  };

  const handleOptionInputChange = (questionIndex, optionIndex, e) => {
    const { value } = e.target;
    const updatedQuestions = newAssessmentData.questions.map((question, i) => {
      if (i === questionIndex) {
        const updatedOptions = question.options.map((option, j) => {
          if (j === optionIndex) {
            return value;
          }
          return option;
        });
        return { ...question, options: updatedOptions };
      }
      return question;
    });
    setNewAssessmentData({ ...newAssessmentData, questions: updatedQuestions });
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = newAssessmentData.questions.map((question, i) => {
      if (i === questionIndex && question.options.length < 4) {
        return { ...question, options: [...question.options, ''] };
      }
      return question;
    });
    setNewAssessmentData({ ...newAssessmentData, questions: updatedQuestions });
  };

  const handleCorrectAnswerChange = (questionIndex, optionValue) => {
    const updatedQuestions = newAssessmentData.questions.map((question, i) => {
      if (i === questionIndex) {
        return { ...question, correctAnswer: optionValue };
      }
      return question;
    });
    setNewAssessmentData({ ...newAssessmentData, questions: updatedQuestions });
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = newAssessmentData.questions.filter((_, i) => i !== index);
    setNewAssessmentData({ ...newAssessmentData, questions: updatedQuestions });
  };

  const handleAddAssessmentSubmit = async (e) => {
    e.preventDefault();
    setAddAssessmentError('');
    setAddAssessmentSuccess('');

    if (!courseId || courseId.length < 10) {
      setAddAssessmentError('Invalid Course ID.');
      return;
    }

    const parsedMaxScore = parseInt(newAssessmentData.MaxScore, 10);
    if (isNaN(parsedMaxScore) || parsedMaxScore <= 0) {
      setAddAssessmentError('Max Score must be a positive number.');
      return;
    }

    if (!newAssessmentData.Title.trim()) {
        setAddAssessmentError('Please provide a title for the assessment.');
        return;
    }
    
    let processedQuestions;
    try {
        processedQuestions = newAssessmentData.questions.map((q, index) => {
            const parsedPoints = parseInt(q.points, 10);
            if (isNaN(parsedPoints) || parsedPoints <= 0) {
                throw new Error(`Question ${index + 1} ("${q.text || 'Untitled'}") has invalid points. Points must be a positive number.`);
            }
            if (q.text.trim() === '' || q.correctAnswer.trim() === '' || q.options.length !== 4 || q.options.some(opt => opt.trim() === '')) {
                throw new Error(`Question ${index + 1} ("${q.text || 'Untitled'}") is incomplete. Ensure it has text, a selected correct answer, and exactly four options with text.`);
            }
            return { ...q, points: parsedPoints };
        });

        if (processedQuestions.length === 0) {
             setAddAssessmentError('Please add at least one complete question.');
             return; // Exit if no questions after processing attempt
        }
    } catch (validationError) {
        setAddAssessmentError(validationError.message);
        return; // Exit if question validation fails
    }

    try {
      const dataToSend = {
        Title: newAssessmentData.Title.trim(),
        MaxScore: parsedMaxScore,
        CourseId: courseId,
        Questions: JSON.stringify(processedQuestions)
      };
      const response = await api.post(`/Assessments`, dataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setAddAssessmentSuccess('Assessment added successfully!');
      setNewAssessmentData({ Title: '', MaxScore: '', questions: [] });
      setShowAddAssessmentForm(false);
    } catch (err) {
      console.error('Error adding assessment:', err.response || err);
      let errorMessage = 'Failed to add assessment.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
        } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
        } else if (err.response.data.title && typeof err.response.data.title === 'string') { // ASP.NET Core validation problem details
            errorMessage = err.response.data.title;
             if (err.response.data.errors) {
                const errors = err.response.data.errors;
                const fieldErrors = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('; ');
                if (fieldErrors) errorMessage += ` (${fieldErrors})`;
            }
        } else if (err.response.data.errors) { // ASP.NET Core validation errors
            const errorKeys = Object.keys(err.response.data.errors);
            if (errorKeys.length > 0) {
                errorMessage = err.response.data.errors[errorKeys[0]][0];
            }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setAddAssessmentError(errorMessage);
    }
  };

  const handleEditAssessment = (assessment) => {
    // Robustly parse questions as array for editing
    let questions = [];
    try {
      if (typeof assessment.Questions === 'string') {
        questions = JSON.parse(assessment.Questions);
      } else if (Array.isArray(assessment.Questions)) {
        questions = assessment.Questions;
      } else if (Array.isArray(assessment.questions)) {
        questions = assessment.questions;
      } else if (typeof assessment.questions === 'string') {
        questions = JSON.parse(assessment.questions);
      } else {
        questions = [];
      }
    } catch (e) {
      questions = [];
    }
    setEditAssessmentData({
      ...assessment,
      Questions: questions,
      Title: assessment.Title || assessment.title || '',
      MaxScore: assessment.MaxScore || assessment.maxScore || '',
    });
    setShowEditModal(true);
    setEditAssessmentError('');
  };

  const handleEditAssessmentInputChange = (e) => {
    const { name, value } = e.target;
    setEditAssessmentData({ ...editAssessmentData, [name]: value });
  };

  const handleEditAssessmentSubmit = async (e) => {
    e.preventDefault();
    setEditAssessmentError('');
    try {
      await api.put(`/Assessments/${editAssessmentData.AssessmentId || editAssessmentData.assessmentId}`, {
        AssessmentId: editAssessmentData.AssessmentId || editAssessmentData.assessmentId,
        CourseId: editAssessmentData.CourseId || editAssessmentData.courseId || courseId,
        Title: editAssessmentData.Title,
        MaxScore: editAssessmentData.MaxScore,
        Questions: JSON.stringify(editAssessmentData.Questions)
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setShowEditModal(false);
      // Refresh assessments
      const response = await api.get('/Assessments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const filtered = response.data.filter(a => a.courseId === courseId || a.CourseId === courseId);
      setCourseAssessments(filtered);
    } catch (err) {
      setEditAssessmentError('Failed to update assessment.');
    }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      // 1. Delete all results for this assessment
      await api.delete(`/Results/ByAssessment/${assessmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // 2. Delete the assessment itself
      await api.delete(`/Assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Refresh assessments
      const response = await api.get('/Assessments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const filtered = response.data.filter(a => a.courseId === courseId || a.CourseId === courseId);
      setCourseAssessments(filtered);
    } catch (err) {
      alert('Failed to delete assessment and/or its results.');
    }
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="mt-5">
        <Alert variant="info">Course not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card className="mb-4">
        <Card.Body>
          <Card.Title>{course.title || course.Title}</Card.Title>
          <Card.Text>
            {course.description || course.Description || 'No description available.'}
          </Card.Text>
              {(() => {
                const backendBaseUrl = "http://localhost:5036";
                const urlRaw = course.MediaUrl || course.mediaUrl || "";
                const fileUrl = urlRaw.startsWith("http") 
                  ? urlRaw 
                  : `${backendBaseUrl}/api/uploads/${urlRaw.split('/').pop()}`;
                return urlRaw ? (
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      onClick={async () => {
                        try {
                          const response = await fetch(fileUrl, {
                            method: 'GET',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to download file');
                          }

                          const blob = await response.blob();
                          
                          const url = window.URL.createObjectURL(blob);
                          
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = course.title || 'course-material';
                          document.body.appendChild(link);
                          link.click();
                          
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Error downloading file:', error);
                          alert('Failed to download file. Please try again.');
                        }
                      }}
                      style={{ display: 'block' }}
                    >
                      Download Course Material
                    </Button>
                  </div>
                ) : null;
              })()}
            </Card.Body>
          </Card>

          {/* Student Results Section for Instructors */}
          {isInstructor && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Student Assessment Results</Card.Title>
                {resultsLoading ? (
                  <div>Loading results...</div>
                ) : resultsError ? (
                  <Alert variant="danger">{resultsError}</Alert>
                ) : studentResults.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Assessment</th>
                          <th>Score</th>
                          <th>Max Score</th>
                          <th>Percentage</th>
                          <th>Attempt Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentResults.map(result => {
                          const assessment = courseAssessments.find(
                            a => (a.AssessmentId || a.assessmentId) === (result.AssessmentId || result.assessmentId)
                          );
                          const maxScore = assessment?.MaxScore || assessment?.maxScore || 100;
                          const percentage = ((result.Score / maxScore) * 100).toFixed(1);
                          
                          return (
                            <tr key={result.ResultId || result.id}>
                              <td>{result.StudentName || 'Unknown Student'}</td>
                              <td>{assessment?.Title || assessment?.title || 'Unknown Assessment'}</td>
                              <td>{result.Score}</td>
                              <td>{maxScore}</td>
                              <td>{percentage}%</td>
                              <td>{new Date(result.AttemptDate).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div>No student results available yet.</div>
          )}
        </Card.Body>
      </Card>
          )}

          {/* Assessment List */}
          <Card>
        <Card.Body>
          <Card.Title>Assessments for this Course</Card.Title>
          {assessmentsLoading ? (
            <div>Loading assessments...</div>
          ) : assessmentsError ? (
            <Alert variant="danger">{assessmentsError}</Alert>
          ) : courseAssessments.length > 0 ? (
                <div className="list-group">
              {courseAssessments.map(assessment => (
                    <div key={assessment.assessmentId || assessment.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                  <div>
                          <h5 className="mb-1">{assessment.title || assessment.Title}</h5>
                          <p className="mb-1">Max Score: {assessment.maxScore || assessment.MaxScore}</p>
                  </div>
                        <div>
                          {!isInstructor && (
                  <Button
                    variant="primary"
                    size="sm"
                              className="me-2"
                    onClick={() => navigate(`/assessments/${assessment.assessmentId || assessment.id}/attempt`)}
                  >
                    Take Assessment
                  </Button>
                          )}
                          {isInstructor && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteAssessment(assessment.assessmentId || assessment.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          ) : (
            <div>No assessments for this course yet.</div>
          )}
        </Card.Body>
      </Card>

          {/* Add Assessment Form for Instructors */}
      {isInstructor && (
        <Card className="mt-4">
          <Card.Body>
            <Card.Title>Add New Assessment</Card.Title>
            {addAssessmentError && <Alert variant="danger">{addAssessmentError}</Alert>}
            {addAssessmentSuccess && <Alert variant="success">{addAssessmentSuccess}</Alert>}

            {!showAddAssessmentForm ? (
                  <Button variant="primary" onClick={() => setShowAddAssessmentForm(true)}>
                    Add Assessment
                  </Button>
            ) : (
              <Form onSubmit={handleAddAssessmentSubmit}>
                    <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter assessment title"
                    name="Title"
                    value={newAssessmentData.Title}
                    onChange={handleAddAssessmentInputChange}
                    required
                  />
                </Form.Group>

                    <Form.Group className="mb-3">
                  <Form.Label>Maximum Score</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter max score"
                    name="MaxScore"
                    value={newAssessmentData.MaxScore}
                    onChange={handleAddAssessmentInputChange}
                    required
                    min="1"
                  />
                </Form.Group>

                <h5>Questions</h5>
                {newAssessmentData.questions.map((question, index) => (
                  <div key={index} className="mb-3 p-3 border rounded">
                        <Form.Group className="mb-3">
                      <Form.Label>Question {index + 1}</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter question text"
                        name="text"
                        value={question.text}
                            onChange={e => handleQuestionInputChange(index, e)}
                        required
                      />
                    </Form.Group>
                    <h6>Options</h6>
                    {question.options.map((option, optionIndex) => (
                      <Form.Group key={optionIndex} className="mb-2 d-flex align-items-center">
                        <Form.Check
                          type="radio"
                          name={`correctAnswer-${index}`}
                          id={`option-${index}-${optionIndex}`}
                          className="me-2"
                          checked={question.correctAnswer === option}
                          onChange={() => handleCorrectAnswerChange(index, option)}
                        />
                        <Form.Control
                          type="text"
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                              onChange={e => handleOptionInputChange(index, optionIndex, e)}
                          required
                        />
                      </Form.Group>
                    ))}
                        <Form.Group className="mb-2 mt-2">
                      <Form.Label>Points</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter points"
                        value={question.points}
                            min="1"
                            onChange={e => handleQuestionInputChange(index, { target: { name: 'points', value: e.target.value } })}
                        required
                      />
                    </Form.Group>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteQuestion(index)}>
                          Remove Question
                        </Button>
                      </div>
                    ))}
                    <div className="d-flex gap-2 mb-3">
                      <Button variant="outline-secondary" size="sm" onClick={handleAddQuestion}>
                        Add Question
                      </Button>
                      <Button variant="primary" type="submit">
                        Add Assessment
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setShowAddAssessmentForm(false);
                          setNewAssessmentData({ Title: '', MaxScore: '', questions: [] });
                        }}
                      >
                        Cancel
                      </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      )}
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetailPage; 