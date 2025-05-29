import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import UploadCoursePage from './pages/UploadCoursePage';
import CourseDetailPage from './pages/CourseDetailPage';
import AssessmentAttemptPage from './pages/AssessmentAttemptPage';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  console.log('Protected Route Check:', { isAuthenticated, userRole }); // Debug log

  if (!isAuthenticated) {
    console.log('No token found, redirecting to login'); // Debug log
    return <Navigate to="/login" replace />;
  }

  if (!userRole || !['student', 'instructor'].includes(userRole?.toLowerCase())) {
    console.log('Invalid role, redirecting to home'); // Debug log
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/assessments/:assessmentId/attempt" element={<AssessmentAttemptPage />} />
          <Route 
            path="/upload-course" 
            element={
              <ProtectedRoute>
                <UploadCoursePage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
