import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../api/api';
import { FaUserPlus } from 'react-icons/fa';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await api.post('/auth/register', formData);
      console.log('Registration response:', response);

      if (response.status === 201 || response.status === 200) {
        console.log('Registration successful. Redirecting to login.');
        navigate('/login');
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }

    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        setError(err.response.data.message || `Registration failed: ${err.response.status}`);
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('No response from server. Please try again later.');
      } else {
        console.error('Error message:', err.message);
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      transition: 'background 0.3s',
    }}>
      <Card style={{ width: 400, borderRadius: 18, boxShadow: '0 8px 32px rgba(99,102,241,0.13)', border: 'none', animation: 'fadeIn 0.7s' }}>
        <Card.Body>
          <div className="text-center mb-2">
            <FaUserPlus style={{ fontSize: 38, color: '#2563eb', marginBottom: 6 }} />
          </div>
          <h2 className="text-center mb-4" style={{ fontWeight: 700, color: '#222', letterSpacing: '-1px' }}>Register</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="name" className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required style={{ borderRadius: 10, fontSize: 16, boxShadow: 'none', border: '1.5px solid #e0e7ff', transition: 'border 0.2s' }} />
            </Form.Group>
            <Form.Group id="email" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required style={{ borderRadius: 10, fontSize: 16, boxShadow: 'none', border: '1.5px solid #e0e7ff', transition: 'border 0.2s' }} />
            </Form.Group>
            <Form.Group id="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required style={{ borderRadius: 10, fontSize: 16, boxShadow: 'none', border: '1.5px solid #e0e7ff', transition: 'border 0.2s' }} />
            </Form.Group>
            <Form.Group id="role" className="mb-3">
              <Form.Label>Register as</Form.Label>
              <Form.Control as="select" name="role" value={formData.role} onChange={handleChange} style={{ borderRadius: 10, fontSize: 16, boxShadow: 'none', border: '1.5px solid #e0e7ff', transition: 'border 0.2s' }}>
                <option value="Student">Student</option>
                <option value="instructor">Instructor</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mt-3" style={{ borderRadius: 10, fontWeight: 700, fontSize: 18, background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)', border: 'none', boxShadow: '0 2px 8px #6366f133', transition: 'background 0.2s, box-shadow 0.2s' }}>Register</Button>
          </Form>
          <div className="text-center mt-3" style={{ fontSize: 16 }}>
            Already have an account? <a href="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>Login</a>
          </div>
        </Card.Body>
      </Card>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
        .form-control:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 2px #a5b4fc55 !important; }
        .btn-primary:hover, .btn-primary:focus { background: linear-gradient(90deg, #6366f1 60%, #2563eb 100%) !important; box-shadow: 0 4px 16px #6366f122 !important; }
      `}</style>
    </div>
  );
}

export default Register; 