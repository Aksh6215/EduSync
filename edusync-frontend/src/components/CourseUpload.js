import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const CourseUpload = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    file: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is an instructor
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole.toLowerCase() !== 'instructor') {
      setError('Only instructors can upload courses');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError('');
  };

  const validateForm = () => {
    if (!form.Title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!form.Description.trim()) {
      setError('Description is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to upload a course');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('Title', form.Title);
      formData.append('Description', form.Description);
      if (form.file) {
        formData.append('file', form.file);
      }

      const apiUrl = 'http://localhost:5036/api/courses';
      const response = await api.post(apiUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      if (response.data) {
        setSuccess('Course uploaded successfully!');
        setForm({ Title: '', Description: '', file: null });
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      console.error('Course upload error:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You do not have permission to upload courses');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to upload course. Please try again.');
      }
    }
  };

  return (
    <div className="col-md-8 offset-md-2">
      <h2>Upload Course</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input 
            type="text" 
            className="form-control" 
            name="Title" 
            value={form.Title} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea 
            className="form-control" 
            name="Description" 
            value={form.Description} 
            onChange={handleChange} 
            required 
            rows={4}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Upload File (Any Type, Optional)</label>
          <input 
            type="file" 
            className="form-control" 
            name="file" 
            onChange={handleChange} 
            accept="*/*"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Upload Course</button>
      </form>
    </div>
  );
};

export default CourseUpload; 