import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../api/api';
import { FaSignInAlt } from 'react-icons/fa';

// Helper function to decode JWT token (simple base64 decoding of payload)
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
};

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // Removed role from state as it's not selected on the form
    // role: 'Student',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (token && userRole) {
      console.log('User already logged in. Redirecting to dashboard.');
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Removed role check from validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      // Send only email and password. Backend determines the role.
      const response = await api.post('/auth/login', { 
        email: formData.email,
        password: formData.password,
       }); 
      console.log('Login response:', response);

      // Check if response has expected structure and includes the token
      const token = response.data.token || response.data.accessToken;

      if (token) {
        // Decode the token to get the user role and ID
        const decodedToken = decodeJwt(token);
        // Assuming the role claim is 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        // and the sub claim contains the user ID
        const userRole = decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const userId = decodedToken?.sub;

        if (userRole && userId) {
           localStorage.setItem('token', token);
           localStorage.setItem('userRole', userRole);
           localStorage.setItem('userId', userId);
           console.log('Login successful, token and role stored. Navigating to dashboard.');

           // Add a small delay to ensure localStorage is updated before navigating
           setTimeout(() => {
             navigate('/dashboard', { replace: true });
           }, 100);
        } else {
          console.error('JWT token is missing required claims:', decodedToken);
          setError('Invalid server response: Required claims missing in token.');
        }

      } else {
        console.error('Login response missing token:', response);
        setError(response.data.message || 'Invalid server response: Token missing.');
      }

    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        setError(err.response.data.message || `Login failed: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        setError('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
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
            <FaSignInAlt style={{ fontSize: 38, color: '#2563eb', marginBottom: 6 }} />
          </div>
          <h2 className="text-center mb-4" style={{ fontWeight: 700, color: '#222', letterSpacing: '-1px' }}>Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required style={{ borderRadius: 10, fontSize: 16, boxShadow: 'none', border: '1.5px solid #e0e7ff', transition: 'border 0.2s' }} />
            </Form.Group>
            <Form.Group id="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required style={{ borderRadius: 10, fontSize: 16, boxShadow: 'none', border: '1.5px solid #e0e7ff', transition: 'border 0.2s' }} />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mt-3" style={{ borderRadius: 10, fontWeight: 700, fontSize: 18, background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)', border: 'none', boxShadow: '0 2px 8px #6366f133', transition: 'background 0.2s, box-shadow 0.2s' }}>Login</Button>
          </Form>
          <div className="text-center mt-3" style={{ fontSize: 16 }}>
            Need an account? <a href="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>Sign Up</a>
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

export default Login; 