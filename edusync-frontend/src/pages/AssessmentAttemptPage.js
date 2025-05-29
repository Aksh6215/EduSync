import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Card, Button, Alert, Spinner, Form, ProgressBar } from 'react-bootstrap';

const AssessmentAttemptPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    const fetchAssessment = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/Assessments/${assessmentId}`);
        setAssessment(res.data);
        let parsedQuestions = [];
        // Robustly parse Questions field
        if (typeof res.data.Questions === 'string') {
          try {
            parsedQuestions = JSON.parse(res.data.Questions);
          } catch (e) {
            parsedQuestions = [];
          }
        } else if (Array.isArray(res.data.Questions)) {
          parsedQuestions = res.data.Questions;
        } else if (Array.isArray(res.data.questions)) {
          parsedQuestions = res.data.questions;
        } else if (typeof res.data.questions === 'string') {
          try {
            parsedQuestions = JSON.parse(res.data.questions);
          } catch (e) {
            parsedQuestions = [];
          }
        }
        setQuestions(parsedQuestions);
        setLoading(false);
      } catch (err) {
        setError('Failed to load assessment.');
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [assessmentId]);

  const handleChange = (qIdx, value) => {
    setAnswers({ ...answers, [qIdx]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] && answers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const percent = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setResult(percent);

    // Post result to backend
    try {
      const userId = localStorage.getItem('userId');
      const payload = {
        AssessmentId: assessmentId,
        UserId: userId,
        Score: percent,
        AttemptDate: new Date().toISOString()
      };
      await api.post('/Results', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setSubmitSuccess(true);
    } catch (err) {
      setError('Failed to submit result.');
    }
  };

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;
  if (!assessment) return <Alert variant="info" className="mt-5">Assessment not found.</Alert>;

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)', minHeight: 'unset', padding: '48px 0 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card className="shadow-lg" style={{ maxWidth: 600, width: '100%', borderRadius: 24, border: 'none', margin: '40px 0' }}>
          <Card.Body style={{ padding: 36 }}>
            <Card.Title style={{ cursor: 'pointer', fontWeight: 800, fontSize: 28, color: '#222', marginBottom: 8 }} onClick={() => navigate(`/assessments/${assessment.assessmentId || assessment.id}`)}>
              {assessment.title || assessment.Title}
            </Card.Title>
            {assessment.CourseId || assessment.courseId ? (
              <div style={{ fontSize: '1.1rem', marginBottom: '1.5rem', cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}
                   onClick={() => navigate(`/courses/${assessment.CourseId || assessment.courseId}`)}>
                <span style={{ color: '#888', fontWeight: 400 }}>Course: </span>
                <span>{assessment.courseTitle || assessment.CourseTitle || assessment.courseName || assessment.CourseName || 'View Course'}</span>
              </div>
            ) : null}
            {result === null ? (
              questions.length > 0 ? (
                <>
                  {/* Progress Bar */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>
                      Question {currentQuestion + 1} of {questions.length}
                    </div>
                    <ProgressBar now={((currentQuestion + 1) / questions.length) * 100} style={{ height: 8, borderRadius: 8, background: '#e0e7ff' }} variant="info" />
                  </div>
                  <Form onSubmit={handleSubmit}>
                    <div className="mb-4" style={{ animation: 'fadeIn 0.5s' }}>
                      <strong style={{ fontSize: 20, color: '#222' }}>Q{currentQuestion + 1}: {questions[currentQuestion].text}</strong>
                      <div style={{ marginTop: 16 }}>
                        {questions[currentQuestion].options.map((opt, oIdx) => {
                          const selected = answers[currentQuestion] === opt;
                          return (
                            <div
                              key={oIdx}
                              style={{
                                background: selected ? 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)' : '#f3f4f6',
                                color: selected ? '#fff' : '#222',
                                borderRadius: 12,
                                padding: '10px 18px',
                                marginBottom: 10,
                                fontWeight: 500,
                                fontSize: 16,
                                boxShadow: selected ? '0 2px 12px #6366f133' : 'none',
                                cursor: 'pointer',
                                border: selected ? '2px solid #6366f1' : '2px solid #e0e7ff',
                                transition: 'all 0.18s',
                                outline: selected ? '2px solid #6366f1' : 'none',
                              }}
                              onClick={() => handleChange(currentQuestion, opt)}
                              onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') handleChange(currentQuestion, opt); }}
                              tabIndex={0}
                              role="button"
                            >
                              <Form.Check
                                type="radio"
                                name={`q${currentQuestion}`}
                                label={opt}
                                value={opt}
                                checked={selected}
                                onChange={() => handleChange(currentQuestion, opt)}
                                style={{ display: 'inline-block', marginRight: 10 }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <Button
                        variant="outline-secondary"
                        disabled={currentQuestion === 0}
                        onClick={e => { e.preventDefault(); setCurrentQuestion(q => Math.max(0, q - 1)); }}
                        style={{ borderRadius: 8, fontWeight: 600, minWidth: 100 }}
                      >
                        Previous
                      </Button>
                      {currentQuestion < questions.length - 1 ? (
                        <Button
                          variant="primary"
                          onClick={e => { e.preventDefault(); setCurrentQuestion(q => Math.min(questions.length - 1, q + 1)); }}
                          style={{ borderRadius: 8, fontWeight: 600, minWidth: 100, background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)', border: 'none' }}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          variant="success"
                          style={{ borderRadius: 8, fontWeight: 700, minWidth: 120, fontSize: 18, background: 'linear-gradient(90deg, #16a34a 0%, #4ade80 100%)', border: 'none', boxShadow: '0 2px 12px #16a34a33' }}
                        >
                          Submit
                        </Button>
                      )}
                    </div>
                  </Form>
                </>
              ) : null
            ) : (
              <div className="mt-4 text-center" style={{ animation: 'popIn 0.7s' }}>
                <h4 className="mb-3" style={{ fontWeight: 800, color: '#16a34a' }}>Assessment Submitted!</h4>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#4f46e5', margin: '24px 0', letterSpacing: 1, transition: 'all 0.3s' }}>
                  Your Score: <span style={{ color: '#16a34a', fontSize: '2.5rem' }}>{result}%</span>
                </div>
                {submitSuccess && (
                  <Alert variant="info" className="mt-3">Your result has been submitted and will appear in your Grades & Progress tab.</Alert>
                )}
                <Button variant="outline-primary" className="mt-3" onClick={() => navigate('/dashboard', { state: { tab: 'grades' } })} style={{ borderRadius: 8, fontWeight: 700, fontSize: 18 }}>
                  Go to Grades & Progress
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
      {/* Footer */}
      <footer style={{ width: '100%', marginTop: 32, padding: '24px 0', background: '#f3f4f6', color: '#6366f1', textAlign: 'center', fontWeight: 600, borderTop: '1px solid #e0e7ff', borderRadius: '0 0 18px 18px', letterSpacing: 0.5 }}>
        EduSync &copy; {new Date().getFullYear()} &mdash; Empowering Learning
      </footer>
      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AssessmentAttemptPage; 