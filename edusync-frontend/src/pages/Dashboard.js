import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, ListGroup, ProgressBar, Nav, Tab, Form, Alert, Modal } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import CourseCard from '../components/CourseCard';
import EditCourseModal from '../components/EditCourseModal';

// Helper function to decode JWT token (simple base64 decoding of payload)
// This function is in Login.js, keeping it here for completeness if needed elsewhere, but typically it belongs in a utility file.
/*
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
*/

function Dashboard() {
  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole');
  const isInstructor = userRole?.toLowerCase() === 'instructor';
  
  // Add state for username
  const [username, setUsername] = useState('');

  // Removed state and effect for profile data since the API is not available
  // const [profileData, setProfileData] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState('');

  // useEffect(() => {
  //   fetchProfileData();
  // }, []);

  // const fetchProfileData = async () => {
  //   try {
  //     const response = await api.get('/users/profile', {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('token')}`
  //       }
  //     });
  //     setProfileData(response.data);
  //     setLoading(false);
  //   } catch (err) {
  //     setError('Failed to load profile data');
  //     setLoading(false);
  //     console.error('Error fetching profile:', err);
  //   }
  // };

  // Profile Tab Content (Removed as API is not available)
  // const ProfileContent = () => {
  //   if (loading) {
  //     return <div>Loading profile data...</div>;
  //   }

  //   if (error) {
  //     return <div className="alert alert-danger">{error}</div>;
  //   }

  //   if (!profileData) {
  //     return <div>No profile data available</div>;
  //   }

  //   return (
  //     <Card>
  //       <Card.Body>
  //         <Card.Title>Profile Information</Card.Title>
  //         <Row>
  //           <Col md={6}>
  //             <div className="mb-3">
  //               <label className="form-label">User ID</label>
  //               <input 
  //                 type="text" 
  //                 className="form-control" 
  //                 value={profileData.userId || ''} 
  //                 readOnly 
  //               />
  //             </div>
  //             <div className="mb-3">
  //               <label className="form-label">Name</label>
  //               <input 
  //                 type="text" 
  //                 className="form-control" 
  //                 value={profileData.name || ''} 
  //                 readOnly 
  //               />
  //             </div>
  //             <div className="mb-3">
  //               <label className="form-label">Email</label>
  //               <input 
  //                 type="email" 
  //                 className="form-control" 
  //                 value={profileData.email || ''} 
  //                 readOnly 
  //               />
  //             </div>
  //           </Col>
  //           <Col md={6}>
  //             <div className="mb-3">
  //               <label className="form-label">Role</label>
  //               <input 
  //                 type="text" 
  //                 className="form-control" 
  //                 value={userRole} 
  //                 readOnly 
  //               />
  //             </div>
  //           </Col>
  //         </Row>
  //         <div className="mt-3">
  //           <Button variant="primary" className="me-2">Edit Profile</Button>
  //           <Button variant="outline-primary">Change Password</Button>
  //         </div>
  //       </Card.Body>
  //     </Card>
  //   );
  // };

  // Decode JWT token and extract username
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        // Assuming the username is in a 'username' or 'name' field in the token payload
        setUsername(payload.username || payload.name || '');
      } catch (e) {
        console.error('Failed to decode JWT or extract username:', e);
      }
    }
  }, []);

  // State for student courses and assessments
  const [studentCourses, setStudentCourses] = useState([]);
  const [studentAssessments, setStudentAssessments] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [assessmentsError, setAssessmentsError] = useState('');

  // State for instructor course management
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    Title: '',
    Description: '',
    // InstructorId will likely come from the logged-in user's ID
    // Removed MediaUrl, will handle file separately
    file: null // Add state for the selected file
  });
  const [addCourseError, setAddCourseError] = useState('');
  const [addCourseSuccess, setAddCourseSuccess] = useState('');

  // New state for all courses for instructor management view
  const [allCourses, setAllCourses] = useState([]);
  const [allCoursesLoading, setAllCoursesLoading] = useState(true);
  const [allCoursesError, setAllCoursesError] = useState('');

  // State for instructor assessment management
  const [showAddAssessmentForm, setShowAddAssessmentForm] = useState(false);
  const [newAssessmentData, setNewAssessmentData] = useState({
    Title: '',
    CourseId: '', // Will be selected from a dropdown
    MaxScore: 100, // Default or make it an input
  });
  const [addAssessmentError, setAddAssessmentError] = useState('');
  const [addAssessmentSuccess, setAddAssessmentSuccess] = useState('');
  const [instructorAssessments, setInstructorAssessments] = useState([]);
  const [instructorAssessmentsLoading, setInstructorAssessmentsLoading] = useState(true);
  const [instructorAssessmentsError, setInstructorAssessmentsError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAssessmentData, setEditAssessmentData] = useState(null);

  // Add state for questions in the assessment form
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);

  // Add state for edit modal
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editCourseData, setEditCourseData] = useState({ courseId: '', Title: '', Description: '', file: null });
  const [editCourseError, setEditCourseError] = useState('');

  // 1. Add state for student results
  const [studentResults, setStudentResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState('');

  // Add state for all assessments
  const [allAssessments, setAllAssessments] = useState([]);

  // Add state for user names cache
  const [userNames, setUserNames] = useState({});

  const navigate = useNavigate();

  // Add at the top, after useState imports
  const [activeTab, setActiveTab] = useState('overview');

  // Add state for question viewing modal
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [viewQuestions, setViewQuestions] = useState([]);
  const [viewAssessmentTitle, setViewAssessmentTitle] = useState('');

  // Add new state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  // Add state for student search
  const [studentSearch, setStudentSearch] = useState('');

  // Fetch courses and assessments for students
  useEffect(() => {
    if (!isInstructor) {
      fetchStudentCourses();
      fetchStudentAssessments();
    }
  }, [isInstructor]); // Depend on isInstructor

  // Fetch courses for instructors (assuming a different endpoint or data needed)
  useEffect(() => {
    if (isInstructor) {
      fetchInstructorCourses();
      fetchAllCoursesForInstructorManagement();
      fetchInstructorAssessments(); // Fetch assessments for instructor
    }
  }, [isInstructor]);

  // 2. Fetch results for students
  useEffect(() => {
    if (!isInstructor) {
      fetchStudentResults();
    }
  }, [isInstructor]);

  // Fetch users and assessments for instructor results
  useEffect(() => {
    if (isInstructor && activeTab === 'students') {
      setResultsLoading(true);
      Promise.all([
        api.get('/Results', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        api.get('/Assessments', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        api.get('/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]).then(([resultsRes, assessmentsRes, coursesRes]) => {
        const userId = localStorage.getItem('userId');
        const instructorCourseIds = coursesRes.data.filter(c => c.instructorId === userId).map(c => c.courseId || c.CourseId);
        const ownAssessments = assessmentsRes.data.filter(a => instructorCourseIds.includes(a.CourseId || a.courseId));
        const ownAssessmentIds = ownAssessments.map(a => a.AssessmentId || a.assessmentId);
        // Only show results for instructor's own assessments
        const ownResults = resultsRes.data.filter(r => ownAssessmentIds.includes(r.AssessmentId || r.assessmentId));
        setStudentResults(ownResults);
        setAllAssessments(ownAssessments);
        setResultsLoading(false);
      }).catch(err => {
        setResultsError('Failed to load student results.');
        setResultsLoading(false);
      });
    }
  }, [isInstructor, activeTab]);

  // Helper to fetch user name by ID and cache it
  const fetchUserName = async (userId) => {
    if (!userId || userNames[userId]) return;
    try {
      const response = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const name = response.data.name || response.data.username || response.data.fullName || response.data.email || userId;
      setUserNames(prev => ({ ...prev, [userId]: name }));
    } catch (err) {
      setUserNames(prev => ({ ...prev, [userId]: userId }));
    }
  };

  // Fetch user names for all results when results are loaded
  useEffect(() => {
    if (isInstructor && activeTab === 'students' && studentResults.length > 0) {
      const uniqueUserIds = [...new Set(studentResults.map(r => r.UserId || r.userId))];
      uniqueUserIds.forEach(uid => {
        if (uid && !userNames[uid]) fetchUserName(uid);
      });
    }
    // eslint-disable-next-line
  }, [studentResults, isInstructor, activeTab]);

  const fetchStudentCourses = async () => {
    try {
      const response = await api.get('/courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStudentCourses(response.data);
      setCoursesLoading(false);
    } catch (err) {
      setCoursesError('Failed to load courses');
      setCoursesLoading(false);
      console.error('Error fetching student courses:', err);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setCoursesError('User ID not found. Please log in again.');
        setCoursesLoading(false);
        return;
      }

      const response = await api.get('/courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Filter courses for the current instructor for the overview tab
      const instructorCourses = response.data.filter(course => 
        course.instructorId === userId
      );
      setStudentCourses(instructorCourses); // Use studentCourses state for instructor's courses on overview
      setCoursesLoading(false);
    } catch (err) {
      setCoursesError('Failed to load instructor courses');
      setCoursesLoading(false);
      console.error('Error fetching instructor courses:', err);
    }
  };

  // New function to fetch all courses for instructor management tab
  const fetchAllCoursesForInstructorManagement = async () => {
    try {
        setAllCoursesLoading(true);
        const response = await api.get('/courses', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setAllCourses(response.data);
        setAllCoursesLoading(false);
    } catch (err) {
        setAllCoursesError('Failed to load all courses for management');
        setAllCoursesLoading(false);
        console.error('Error fetching all courses for instructor management:', err);
    }
  };

  const fetchStudentAssessments = async () => {
    try {
      // Assuming an endpoint exists to get assessments available to a student, 
      // or fetching all and filtering if necessary. Using a placeholder for now.
      const response = await api.get('/assessments', {
         headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStudentAssessments(response.data);
      setAssessmentsLoading(false);
    } catch (err) {
      setAssessmentsError('Failed to load assessments');
      setAssessmentsLoading(false);
      console.error('Error fetching student assessments:', err);
    }
  };

  const handleNewCourseInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setNewCourseData({ ...newCourseData, [name]: files[0] });
    } else {
      setNewCourseData({ ...newCourseData, [name]: value });
    }
  };

  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();
    setAddCourseError('');
    setAddCourseSuccess('');

    // Basic validation
    if (!newCourseData.Title || !newCourseData.Description || !newCourseData.file) {
      setAddCourseError('Please fill in all required fields, including uploading a media file.');
      return;
    }

    const formData = new FormData();
    formData.append('Title', newCourseData.Title);
    formData.append('Description', newCourseData.Description);
    // Add InstructorId from localStorage (required by backend)
    formData.append('InstructorId', localStorage.getItem('userId'));
    formData.append('file', newCourseData.file);

    try {
      // Assuming a backend endpoint for creating courses
      const response = await api.post('/courses', formData, {
         headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Course added successfully:', response.data);
      setAddCourseSuccess('Course added successfully!');
      // Optionally refresh the instructor's course list here
      fetchAllCoursesForInstructorManagement(); // Refresh all courses list
      // fetchInstructorCourses(); // Refresh instructor's specific courses list
      setNewCourseData({ Title: '', Description: '', file: null }); // Clear form
      setShowAddCourseForm(false); // Hide form
    } catch (err) {
      console.error('Error adding course:', err);
      setAddCourseError(err.response?.data?.message || 'Failed to add course.');
    }
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log('Logging out');
    // Clear localStorage and navigate to login page
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      // 1. Get all assessments for this course
      const assessmentsRes = await api.get('/Assessments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const courseAssessments = assessmentsRes.data.filter(a => 
        (a.CourseId || a.courseId) === courseId
      );

      // 2. For each assessment, delete all results, then the assessment
      for (const assessment of courseAssessments) {
        await api.delete(`/Results/ByAssessment/${assessment.AssessmentId || assessment.assessmentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await api.delete(`/Assessments/${assessment.AssessmentId || assessment.assessmentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }

      // 3. Delete the course itself
      await api.delete(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      fetchAllCoursesForInstructorManagement();
    } catch (err) {
      setCoursesError(err.response?.data?.message || 'Failed to delete course and its dependencies.');
      console.error('Error deleting course and dependencies:', err);
    }
  };

  const fetchInstructorAssessments = async () => {
    try {
      setInstructorAssessmentsLoading(true);
      const userId = localStorage.getItem('userId');
      const coursesRes = await api.get('/courses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const instructorCourseIds = coursesRes.data.filter(c => c.instructorId === userId).map(c => c.courseId || c.CourseId);
      const response = await api.get('/Assessments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Only include assessments for instructor's courses
      const ownAssessments = response.data.filter(a => instructorCourseIds.includes(a.CourseId || a.courseId));
      setInstructorAssessments(ownAssessments);
      setInstructorAssessmentsLoading(false);
    } catch (err) {
      setInstructorAssessmentsError('Failed to load instructor assessments. Please check the API endpoint and network connectivity.');
      setInstructorAssessmentsLoading(false);
      console.error('Error fetching instructor assessments:', err);
    }
  };

  const handleNewAssessmentInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssessmentData({ ...newAssessmentData, [name]: value });
  };

  const handleAddAssessmentQuestion = () => {
    setAssessmentQuestions([
      ...assessmentQuestions,
      { text: '', options: ['', '', '', ''], correctAnswer: '', points: '' }
    ]);
  };

  const handleAssessmentQuestionChange = (qIdx, field, value) => {
    setAssessmentQuestions(assessmentQuestions.map((q, idx) =>
      idx === qIdx ? { ...q, [field]: value } : q
    ));
  };

  const handleAssessmentOptionChange = (qIdx, optIdx, value) => {
    setAssessmentQuestions(assessmentQuestions.map((q, idx) =>
      idx === qIdx ? { ...q, options: q.options.map((opt, oIdx) => oIdx === optIdx ? value : opt) } : q
    ));
  };

  const handleAssessmentCorrectAnswerChange = (qIdx, value) => {
    setAssessmentQuestions(assessmentQuestions.map((q, idx) =>
      idx === qIdx ? { ...q, correctAnswer: value } : q
    ));
  };

  const handleAssessmentPointsChange = (qIdx, value) => {
    setAssessmentQuestions(assessmentQuestions.map((q, idx) =>
      idx === qIdx ? { ...q, points: value } : q
    ));
  };

  const handleRemoveAssessmentQuestion = (qIdx) => {
    setAssessmentQuestions(assessmentQuestions.filter((_, idx) => idx !== qIdx));
  };

  const handleAddAssessmentSubmit = async (e) => {
    e.preventDefault();
    setAddAssessmentError('');
    setAddAssessmentSuccess('');

    if (!newAssessmentData.Title || !newAssessmentData.CourseId || !newAssessmentData.MaxScore) {
      setAddAssessmentError('Please fill in all required fields (Title, Course, Max Score).');
      return;
    }
    if (assessmentQuestions.length === 0) {
      setAddAssessmentError('Please add at least one question.');
      return;
    }
    // Validate questions
    for (let i = 0; i < assessmentQuestions.length; i++) {
      const q = assessmentQuestions[i];
      if (!q.text.trim() || q.options.some(opt => !opt.trim()) || !q.correctAnswer || !q.points) {
        setAddAssessmentError(`Please complete all fields for question ${i + 1}.`);
        return;
      }
    }
    const courseIdStr = newAssessmentData.CourseId;
    const maxScoreNum = parseInt(newAssessmentData.MaxScore, 10);
    if (!courseIdStr || courseIdStr.length < 10) {
      setAddAssessmentError('Invalid Course selected.');
      return;
    }
    if (isNaN(maxScoreNum) || maxScoreNum <= 0) {
      setAddAssessmentError('Max Score must be a positive number.');
      return;
    }
    // New validation: sum of question points must not exceed maxScore
    const totalPoints = assessmentQuestions.reduce((sum, q) => sum + parseInt(q.points, 10), 0);
    if (totalPoints > maxScoreNum) {
      setAddAssessmentError(`The sum of all question points (${totalPoints}) cannot exceed the Max Score (${maxScoreNum}).`);
      return;
    }
    const payload = {
      Title: newAssessmentData.Title,
      CourseId: courseIdStr,
      MaxScore: maxScoreNum,
      Questions: JSON.stringify(assessmentQuestions)
    };
    console.log('Submitting assessment payload:', payload);
    try {
      const response = await api.post('/Assessments', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAddAssessmentSuccess('Assessment added successfully!');
      fetchInstructorAssessments();
      setNewAssessmentData({ Title: '', CourseId: '', MaxScore: 100 });
      setAssessmentQuestions([]);
      setShowAddAssessmentForm(false);
    } catch (err) {
      console.error('Error adding assessment:', err.response || err);
      let errorMessage = 'Failed to add assessment.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
        } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
        } else if (err.response.data.title && typeof err.response.data.title === 'string') {
            errorMessage = err.response.data.title;
             if (err.response.data.errors) {
                const errors = err.response.data.errors;
                const fieldErrors = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('; ');
                if (fieldErrors) errorMessage += ` (${fieldErrors})`;
            }
        } else if (err.response.data.errors) {
            const errors = err.response.data.errors;
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey && errors[firstErrorKey] && errors[firstErrorKey].length > 0) {
                errorMessage = `${firstErrorKey}: ${errors[firstErrorKey][0]}`;
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
      Questions: questions
    });
    setShowEditModal(true);
  };

  const handleGradeAssessment = (assessmentId) => {
    navigate(`/assessments/${assessmentId}/grade`);
  };

  const handleDeleteAssessment = async (assessmentId) => {
    try {
      // Try to delete all results for this assessment
      try {
        await api.delete(`/Results/ByAssessment/${assessmentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        // If 404, ignore and continue
        if (!(err.response && err.response.status === 404)) throw err;
      }
      // Then delete the assessment itself
      await api.delete(`/Assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Refresh the assessments list
      fetchInstructorAssessments();
      setShowDeleteModal(false);
      setAssessmentToDelete(null);
    } catch (err) {
      console.error('Error deleting assessment:', err);
      alert('Failed to delete assessment. Please try again.');
    }
  };

  const handleEditCourse = (course) => {
    setEditCourseData({
      courseId: course.courseId,
      Title: course.Title || course.title,
      Description: course.Description || course.description || '',
      file: null
    });
    setShowEditCourseModal(true);
    setEditCourseError('');
  };

  const handleEditCourseInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setEditCourseData({ ...editCourseData, file: files[0] });
    } else {
      setEditCourseData({ ...editCourseData, [name]: value });
    }
  };

  const handleEditCourseSubmit = async (e) => {
    e.preventDefault();
    setEditCourseError('');
    if (!editCourseData.Title) {
      setEditCourseError('Please fill in all required fields.');
      return;
    }
    const formData = new FormData();
    formData.append('CourseId', editCourseData.courseId);
    formData.append('Title', editCourseData.Title);
    formData.append('Description', editCourseData.Description || '');
    formData.append('InstructorId', localStorage.getItem('userId'));
    if (editCourseData.file) {
      formData.append('file', editCourseData.file);
    }
    try {
      await api.put(`/courses/${editCourseData.courseId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowEditCourseModal(false);
      fetchAllCoursesForInstructorManagement();
    } catch (err) {
      setEditCourseError(err.response?.data?.message || 'Failed to update course.');
    }
  };

  // 3. In the Overview and Courses tab, display MediaUrl for courses
  // (Update the course card rendering to include MediaUrl, already handled in CourseCard)

  // 4. In the Assessments tab, when displaying assessments, show the course title using CourseId
  // (Update the assessment rendering to use allCourses.find(c => c.CourseId === assessment.CourseId)?.Title)

  // 5. In the Grades & Progress tab, display real results
  const fetchStudentResults = async () => {
    try {
      setResultsLoading(true);
      const response = await api.get('/Results', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      let results = response.data;
      // Only show own results if not instructor
      if (!isInstructor) {
        const userId = localStorage.getItem('userId');
        results = results.filter(r => (r.UserId || r.userId) === userId);
      }
      setStudentResults(results);
      // Fetch all assessments if not already loaded
      if (allAssessments.length === 0) {
        try {
          const assessmentsRes = await api.get('/Assessments', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setAllAssessments(assessmentsRes.data);
        } catch (e) { /* ignore */ }
      }
      setResultsLoading(false);
    } catch (err) {
      setResultsError('Failed to load results');
      setResultsLoading(false);
      console.error('Error fetching student results:', err);
    }
  };

  // Debug log for student assessments
  console.log('studentAssessments:', studentAssessments, 'assessmentsLoading:', assessmentsLoading, 'assessmentsError:', assessmentsError);

  return (
    <div className="container mt-4">
      {/* Dashboard Header */}
      <h2 className="mb-4">{username ? `Welcome, ${username}!` : (isInstructor ? 'Instructor Dashboard' : 'Student Dashboard')}</h2>
      
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col md={3}>
            <div style={{
              background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
              borderRadius: 22,
              boxShadow: '0 4px 32px rgba(99,102,241,0.07)',
              padding: '32px 18px 24px 18px',
              marginBottom: 32,
              minWidth: 220
            }}>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#3730a3', marginBottom: 24, letterSpacing: '-1px', textShadow: '0 2px 8px #a5b4fc33', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span role="img" aria-label="menu" style={{ fontSize: 28 }}>🧭</span> Menu
              </div>
              <Nav variant="pills" className="flex-column sidebar-nav-custom">
                  <Nav.Item key="overview">
                    <Nav.Link eventKey="overview">Overview</Nav.Link>
                  </Nav.Item>
                  <Nav.Item key="courses">
                    <Nav.Link eventKey="courses">{isInstructor ? 'Manage Courses' : 'Courses'}</Nav.Link>
                  </Nav.Item>
                  <Nav.Item key="assessments">
                    <Nav.Link eventKey="assessments">{isInstructor ? 'Manage Assessments' : 'Assessments'}</Nav.Link>
                  </Nav.Item>
                  {isInstructor && (
                      <Nav.Item key="students">
                        <Nav.Link eventKey="students">Student Results</Nav.Link>
                      </Nav.Item>
                  )}
                  {!isInstructor && (
                      <Nav.Item key="grades">
                        <Nav.Link eventKey="grades">Grades & Progress</Nav.Link>
                      </Nav.Item>
                  )}
                </Nav>
              <div style={{ marginTop: 32 }}>
                <Button variant="outline-danger" className="w-100 sidebar-logout-btn" onClick={handleLogout} style={{ fontWeight: 700, fontSize: 18, borderRadius: 10, padding: '10px 0' }}>Logout</Button>
              </div>
            </div>
            <style>{`
              .sidebar-nav-custom .nav-link {
                color: #3730a3 !important;
                font-weight: 600;
                font-size: 1.08rem;
                margin-bottom: 0.5rem;
                border-radius: 10px;
                transition: color 0.18s, background 0.18s, box-shadow 0.18s;
                padding: 0.7rem 1.2rem;
              }
              .sidebar-nav-custom .nav-link.active, .sidebar-nav-custom .nav-link:hover {
                color: #fff !important;
                background: linear-gradient(90deg, #6366f1 60%, #a5b4fc 100%);
                box-shadow: 0 2px 8px rgba(99,102,241,0.08);
                text-decoration: none;
              }
              .sidebar-logout-btn {
                border-width: 2px;
                transition: background 0.18s, color 0.18s, box-shadow 0.18s;
              }
              .sidebar-logout-btn:hover {
                background: linear-gradient(90deg, #dc2626 60%, #fca5a5 100%);
                color: #fff !important;
                box-shadow: 0 2px 8px rgba(220,38,38,0.08);
              }
            `}</style>
          </Col>

          <Col md={9}>
            <Tab.Content>
              {/* Overview Tab */}
              <Tab.Pane eventKey="overview">
                {/* My Courses Section */}
                <Row className="mb-4">
                  <Col md={12}>
                    <div style={{
                      background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
                      borderRadius: 22,
                      padding: '32px 32px 40px 32px',
                      boxShadow: '0 4px 32px rgba(99,102,241,0.07)',
                      marginBottom: 32
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <Card.Title style={{ fontWeight: 500, fontSize: '1.4rem', color: '#3730a3', margin: 0, letterSpacing: '-1px', textShadow: '0 2px 8px #a5b4fc33' }}>
                          <span role="img" aria-label="courses" style={{ fontSize: 28, marginRight: 10 }}>📚</span> Courses
                        </Card.Title>
                        {/* <Button variant="primary" style={{ fontWeight: 700, borderRadius: 10, fontSize: 18, padding: '8px 28px' }} onClick={() => setActiveTab('courses')}>Manage Courses</Button> */}
                      </div>
                        {coursesLoading ? (
                          <div>Loading courses...</div>
                        ) : coursesError ? (
                          <div className="alert alert-danger">{coursesError}</div>
                        ) : studentCourses.length > 0 ? (
                        <Row className="g-4" style={{ justifyContent: 'flex-start' }}>
                            {studentCourses.slice(0, 3).map(course => (
                            <Col key={course.courseId || course.id} xs={12} sm={6} md={4} lg={3} style={{ display: 'flex' }}>
                              <Card className="h-100 shadow-sm border-0 course-card-hover" style={{ borderRadius: 22, minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
                                <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '28px 22px 18px 22px' }}>
                                  <div>
                                    <Card.Title style={{ fontWeight: 800, fontSize: '1.35rem', marginBottom: 6, color: '#222' }}>{course.Title || course.title || 'No Title'}</Card.Title>
                                    <div style={{ color: '#888', fontSize: 15, marginBottom: 0 }}>{course.Description || course.description || 'No description available.'}</div>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                                    <Button variant="outline-primary" style={{ borderRadius: 10, fontWeight: 700, fontSize: 16, width: '100%' }} onClick={() => navigate(`/courses/${course.courseId || course.id}`)}>View Course</Button>
                                  </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        ) : (
                          <div>No available courses found.</div>
                        )}
                      <div style={{
                        width: '100%',
                        minHeight: 80,
                        background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                        borderRadius: 18,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        fontWeight: 600,
                        marginTop: 32
                      }}>
                        🚀 Keep learning! Explore more courses and boost your skills!
                      </div>
                    </div>
                  </Col>
                </Row>
                {/* My Assessments Section */}
                <Row>
                  <Col md={12}>
                    <div style={{
                      background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
                      borderRadius: 22,
                      padding: '32px 32px 40px 32px',
                      boxShadow: '0 4px 32px rgba(99,102,241,0.07)',
                      marginBottom: 32
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <Card.Title style={{ fontWeight: 500, fontSize: '1.4rem', color: '#3730a3', margin: 0, letterSpacing: '-1px', textShadow: '0 2px 8px #a5b4fc33' }}>
                          <span role="img" aria-label="assessments" style={{ fontSize: 28, marginRight: 10 }}>📝</span> Assessments
                        </Card.Title>
                        {/* <Button variant="primary" style={{ fontWeight: 700, borderRadius: 10, fontSize: 18, padding: '8px 28px' }} onClick={() => setActiveTab('assessments')}>Manage Assessments</Button> */}
                      </div>
                      {instructorAssessmentsLoading ? (
                            <div>Loading assessments...</div>
                      ) : instructorAssessmentsError ? (
                        <div className="alert alert-danger">{instructorAssessmentsError}</div>
                      ) : instructorAssessments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                          {instructorAssessments.map(assessment => {
                            const courseId = assessment.CourseId || assessment.courseId;
                            const course = allCourses.find(c => (c.CourseId || c.courseId) === courseId);
                                return (
                              <div key={assessment.assessmentId || assessment.id} className="assessment-list-card-hover" style={{
                                background: '#f7f8fa',
                                borderRadius: 16,
                                boxShadow: '0 2px 8px #a5b4fc22',
                                padding: '24px 28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: '1.5px solid #e0e7ff',
                                marginBottom: 0
                              }}>
                                      <div>
                                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#222', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span role="img" aria-label="quiz" style={{ fontSize: 22 }}>🧩</span> {assessment.Title || assessment.title || 'No Title'}
                                        </div>
                                  <div style={{ color: '#888', fontSize: 16, fontWeight: 500 }}>
                                    Course: <span style={{ color: '#4f46e5', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate(`/courses/${course?.CourseId || course?.courseId}`)}>{course ? (course.Title || course.title) : 'Course'}</span>
                                          </div>
                                      </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                  <Button variant="outline-primary" className="assessment-edit-btn" style={{ borderRadius: 8, fontWeight: 700, fontSize: 16, minWidth: 70 }} onClick={() => handleEditAssessment(assessment)}>Edit</Button>
                                  <Button variant="outline-danger" className="assessment-delete-btn" style={{ borderRadius: 8, fontWeight: 700, fontSize: 16, minWidth: 70 }} onClick={() => {
                                    setAssessmentToDelete(assessment.assessmentId || assessment.id);
                                    setShowDeleteModal(true);
                                  }}>Delete</Button>
                                    </div>
                                    </div>
                                );
                              })}
                        </div>
                          ) : (
                        <div style={{ color: '#444', fontSize: 18, marginBottom: 18 }}>No assessments found. Click 'Manage Assessments' to add one!</div>
                        )}
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Profile Tab (Removed as API is not available) */}
              {/* <Tab.Pane eventKey="profile">
                <ProfileContent />
              </Tab.Pane> */}

              {/* Courses Tab */}
              <Tab.Pane eventKey="courses">
                <Card>
                  <Card.Body>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <Card.Title style={{ marginBottom: 0 }}>{isInstructor ? 'Manage Courses' : 'Courses'}</Card.Title>
                      {isInstructor && !showAddCourseForm && (
                        <Button variant="primary" onClick={() => setShowAddCourseForm(true)}>
                          Add New Course
                        </Button>
                      )}
                    </div>
                    {isInstructor && (
                      <>
                        {showAddCourseForm && (
                          <Card className="mt-4">
                            <Card.Body>
                              <Card.Title>Add New Course</Card.Title>
                              {addCourseError && <Alert variant="danger">{addCourseError}</Alert>}
                              {addCourseSuccess && <Alert variant="success">{addCourseSuccess}</Alert>}
                              <Form onSubmit={handleAddCourseSubmit}>
                                <Form.Group className="mb-3" controlId="courseTitle">
                                  <Form.Label>Course Title</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="Enter course title"
                                    name="Title"
                                    value={newCourseData.Title}
                                    onChange={handleNewCourseInputChange}
                                    required
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="courseDescription">
                                  <Form.Label>Course Description</Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter course description"
                                    name="Description"
                                    value={newCourseData.Description}
                                    onChange={handleNewCourseInputChange}
                                    required
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="courseFile">
                                  <Form.Label>Course Media (Required)</Form.Label>
                                  <Form.Control
                                    type="file"
                                    name="file"
                                    onChange={handleNewCourseInputChange}
                                    required
                                  />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                  Add Course
                                </Button>{' '}
                                <Button variant="secondary" onClick={() => { setShowAddCourseForm(false); setAddCourseError(''); setAddCourseSuccess(''); setNewCourseData({ Title: '', Description: '', file: null }); }}>
                                  Cancel
                                </Button>
                              </Form>
                            </Card.Body>
                          </Card>
                        )}
                      </>
                    )}
                    {/* Display fetched courses */}
                    {isInstructor ? (
                      // Display all courses for instructors in this tab
                      allCoursesLoading ? (
                        <div>Loading all courses...</div>
                      ) : allCoursesError ? (
                        <div className="alert alert-danger">{allCoursesError}</div>
                      ) : allCourses.length > 0 ? (
                        <Row>
                          {allCourses.map(course => (
                            <Col key={course.courseId || course.id} md={6} sm={12} className="mb-3">
                              <CourseCard
                                course={course}
                                onEdit={handleEditCourse}
                                onDelete={handleDeleteCourse}
                                onViewDetail={c => navigate(`/courses/${c.courseId || c.id}`)}
                              />
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <div>No courses found.</div>
                      )
                    ) : (
                      // Student's available courses as cards
                      coursesLoading ? (
                        <div>Loading courses...</div>
                      ) : coursesError ? (
                        <div className="alert alert-danger">{coursesError}</div>
                      ) : studentCourses.length > 0 ? (
                        <div
                          className="course-grid"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2rem',
                            alignItems: 'stretch',
                            marginBottom: '2rem'
                          }}
                        >
                          {studentCourses.map(course => (
                            <Card
                              key={course.courseId || course.id}
                              className="h-100 shadow course-card-attractive"
                              style={{
                                borderRadius: 18,
                                minHeight: 180,
                                background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
                                boxShadow: '0 4px 24px rgba(80,80,200,0.10)',
                                transition: 'transform 0.18s, box-shadow 0.18s'
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(80,80,200,0.18)';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 24px rgba(80,80,200,0.10)';
                              }}
                            >
                              <div style={{
                                width: '100%',
                                height: 8,
                                borderTopLeftRadius: 18,
                                borderTopRightRadius: 18,
                                background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                                marginBottom: 12
                              }} />
                              <Card.Body style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 18px 12px 18px' }}>
                                <div style={{ flexGrow: 1 }}>
                                  <div className="d-flex align-items-center mb-2">
                                    <div>
                                      <Card.Title style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 0, color: '#222' }}>
                                        {course.title || course.Title}
                                      </Card.Title>
                                      <div style={{ color: '#6366f1', fontSize: 13, fontWeight: 500, marginTop: 2 }}>
                                        {/* Optionally, instructor or category */}
                                      </div>
                                      <div style={{ color: '#888', fontSize: 14, marginTop: 2 }}>
                                        {course.description || course.Description || 'No description.'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="primary"
                                  size="md"
                                  style={{
                                    marginTop: 'auto',
                                    width: '100%',
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    boxShadow: '0 2px 8px #6366f133',
                                    background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)',
                                    border: 'none'
                                  }}
                                  onClick={() => navigate(`/courses/${course.courseId || course.id}`)}
                                >
                                  View Course
                                </Button>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div>No available courses found.</div>
                      )
                    )}
                    {/* Motivational Banner */}
                    {!isInstructor && studentCourses.length > 0 && (
                      <div style={{
                        width: '100%',
                        minHeight: 120,
                        background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                        borderRadius: 18,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        fontWeight: 600,
                        marginTop: 32
                      }}>
                        🚀 Keep learning! Explore more courses and boost your skills!
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Profile Tab (Removed as API is not available) */}
              {/* <Tab.Pane eventKey="profile">
                <ProfileContent />
              </Tab.Pane> */}

              {/* Assessments Tab */}
              <Tab.Pane eventKey="assessments">
                <Card>
                  <Card.Body>
                    <Card.Title>{isInstructor ? 'Manage Assessments' : 'Assessments'}</Card.Title>
                    {isInstructor ? (
                      <>
                        {/* {!showAddAssessmentForm && (
                          <Button variant="primary" className="mb-3" onClick={() => { setShowAddAssessmentForm(true); setAddAssessmentSuccess(''); }}>
                            Create New Assessment
                          </Button>
                        )} */}

                        {showAddAssessmentForm && (
                          <Card className="mt-4">
                            <Card.Body>
                              <Card.Title>Add New Assessment</Card.Title>
                              {addAssessmentError && <Alert variant="danger">{addAssessmentError}</Alert>}
                              {addAssessmentSuccess && <Alert variant="success">{addAssessmentSuccess}</Alert>}
                              <Form onSubmit={handleAddAssessmentSubmit}>
                                <Form.Group className="mb-3" controlId="assessmentTitle">
                                  <Form.Label>Assessment Title</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="Enter assessment title"
                                    name="Title"
                                    value={newAssessmentData.Title}
                                    onChange={handleNewAssessmentInputChange}
                                    required
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="assessmentCourse">
                                  <Form.Label>Course</Form.Label>
                                  <Form.Select
                                    name="CourseId"
                                    value={newAssessmentData.CourseId}
                                    onChange={handleNewAssessmentInputChange}
                                    required
                                  >
                                    <option value="">Select a Course</option>
                                    {allCourses.map(course => (
                                      <option key={course.courseId} value={course.courseId}>
                                        {course.title}
                                      </option>
                                    ))}
                                  </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="assessmentMaxScore">
                                  <Form.Label>Max Score</Form.Label>
                                  <Form.Control
                                    type="number"
                                    placeholder="Enter max score"
                                    name="MaxScore"
                                    value={newAssessmentData.MaxScore}
                                    onChange={handleNewAssessmentInputChange}
                                    required
                                    min="1"
                                  />
                                </Form.Group>
                                {/* Questions Section */}
                                <div className="mb-3">
                                  <h5>Questions</h5>
                                  {assessmentQuestions.map((q, qIdx) => (
                                    <Card key={qIdx} className="mb-3 p-2">
                                      <Form.Group className="mb-2">
                                        <Form.Label>Question {qIdx + 1}</Form.Label>
                                        <Form.Control
                                          type="text"
                                          placeholder="Enter question text"
                                          value={q.text}
                                          onChange={e => handleAssessmentQuestionChange(qIdx, 'text', e.target.value)}
                                          required
                                        />
                                      </Form.Group>
                                      <Form.Label>Options</Form.Label>
                                      {q.options.map((opt, optIdx) => (
                                        <Form.Group key={optIdx} className="mb-1 d-flex align-items-center">
                                          <Form.Check
                                            type="radio"
                                            name={`correctAnswer-${qIdx}`}
                                            id={`option-${qIdx}-${optIdx}`}
                                            className="me-2"
                                            checked={q.correctAnswer === opt}
                                            onChange={() => handleAssessmentCorrectAnswerChange(qIdx, opt)}
                                          />
                                          <Form.Control
                                            type="text"
                                            placeholder={`Option ${optIdx + 1}`}
                                            value={opt}
                                            onChange={e => handleAssessmentOptionChange(qIdx, optIdx, e.target.value)}
                                            required
                                          />
                                        </Form.Group>
                                      ))}
                                      <Form.Group className="mb-2 mt-2">
                                        <Form.Label>Points</Form.Label>
                                        <Form.Control
                                          type="number"
                                          value={q.points}
                                          min="1"
                                          onChange={e => handleAssessmentPointsChange(qIdx, e.target.value)}
                                          required
                                        />
                                      </Form.Group>
                                      <Button variant="outline-danger" size="sm" onClick={() => handleRemoveAssessmentQuestion(qIdx)}>
                                        Remove Question
                                      </Button>
                                    </Card>
                                  ))}
                                  <Button variant="outline-secondary" size="sm" onClick={handleAddAssessmentQuestion}>
                                    Add Question
                                  </Button>
                                </div>
                                <Button variant="primary" type="submit">
                                  Add Assessment
                                </Button>{' '}
                                <Button variant="secondary" onClick={() => { setShowAddAssessmentForm(false); setAddAssessmentError(''); setAddAssessmentSuccess(''); setAssessmentQuestions([]); }}>Cancel</Button>
                              </Form>
                            </Card.Body>
                          </Card>
                        )}

                        <Card style={{
                          background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
                          borderRadius: 22,
                          boxShadow: '0 4px 32px rgba(99,102,241,0.07)',
                          padding: '32px 32px 40px 32px',
                          marginBottom: 32,
                          border: 'none'
                        }}>
                          <Card.Body style={{ padding: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                              <span style={{ fontWeight: 600, fontSize: '1.35rem', color: '#3730a3', letterSpacing: '-0.5px', textShadow: '0 1px 4px #a5b4fc22', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span role="img" aria-label="assessment" style={{ fontSize: 26 }}>📝</span> Manage Assessments
                              </span>
                              {!showAddAssessmentForm && (
                                <Button variant="primary" style={{ fontWeight: 700, borderRadius: 12, fontSize: 18, padding: '10px 28px', boxShadow: '0 2px 8px #6366f133' }} onClick={() => { setShowAddAssessmentForm(true); setAddAssessmentSuccess(''); }}>
                                  Create New Assessment
                                </Button>
                              )}
                            </div>
                            <h4 style={{ fontWeight: 500, color: '#222', marginBottom: 16, marginTop: 16, letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem' }}>
                              <span role="img" aria-label="list" style={{ fontSize: 20 }}>📋</span> Existing Assessments
                            </h4>
                        {instructorAssessmentsLoading ? (
                          <div>Loading assessments...</div>
                        ) : instructorAssessmentsError ? (
                              <div className="alert alert-danger">{instructorAssessmentsError}</div>
                        ) : instructorAssessments.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {instructorAssessments.map(assessment => {
                              const courseId = assessment.CourseId || assessment.courseId;
                              const course = allCourses.find(c => (c.CourseId || c.courseId) === courseId);
                              return (
                                    <div key={assessment.assessmentId || assessment.id} className="assessment-list-card-hover" style={{
                                      background: '#f7f8fa',
                                      borderRadius: 16,
                                      boxShadow: '0 2px 8px #a5b4fc22',
                                      padding: '24px 28px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      border: '1.5px solid #e0e7ff',
                                      marginBottom: 0
                                    }}>
                                  <div>
                                        <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                          <span role="img" aria-label="quiz" style={{ fontSize: 18 }}>🧩</span> {assessment.Title || assessment.title || 'No Title'}
                                      </div>
                                        <div style={{ color: '#888', fontSize: 15, fontWeight: 400 }}>
                                          Course: <span style={{ color: '#4f46e5', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate(`/courses/${course?.CourseId || course?.courseId}`)}>{course ? (course.Title || course.title) : 'Course'}</span>
                                  </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: 12 }}>
                                        <Button variant="outline-primary" className="assessment-edit-btn" style={{ borderRadius: 8, fontWeight: 700, fontSize: 16, minWidth: 70 }} onClick={() => handleEditAssessment(assessment)}>Edit</Button>
                                        <Button variant="outline-danger" className="assessment-delete-btn" style={{ borderRadius: 8, fontWeight: 700, fontSize: 16, minWidth: 70 }} onClick={() => {
                                      setAssessmentToDelete(assessment.assessmentId || assessment.id);
                                      setShowDeleteModal(true);
                                        }}>Delete</Button>
                                  </div>
                                    </div>
                              );
                            })}
                              </div>
                        ) : (
                              <div style={{ color: '#444', fontSize: 18, marginBottom: 18 }}>No assessments found. Click 'Create New Assessment' to add one!</div>
                            )}
                            <style>{`
                              .assessment-list-card-hover {
                                transition: box-shadow 0.18s, transform 0.18s, border 0.18s;
                              }
                              .assessment-list-card-hover:hover {
                                box-shadow: 0 8px 32px rgba(99,102,241,0.13), 0 1.5px 8px rgba(99,102,241,0.08);
                                border: 1.5px solid #6366f1;
                                transform: translateY(-3px) scale(1.012);
                              }
                              .assessment-edit-btn, .assessment-delete-btn {
                                transition: background 0.18s, color 0.18s, box-shadow 0.18s;
                              }
                              .assessment-edit-btn:hover {
                                background: linear-gradient(90deg, #6366f1 60%, #a5b4fc 100%);
                                color: #fff !important;
                                box-shadow: 0 2px 8px #6366f133;
                              }
                              .assessment-delete-btn:hover {
                                background: linear-gradient(90deg, #dc2626 60%, #fca5a5 100%);
                                color: #fff !important;
                                box-shadow: 0 2px 8px #dc262633;
                              }
                            `}</style>
                          </Card.Body>
                        </Card>
                      </>
                    ) : (
                       // Student Assessments List
                       assessmentsLoading ? (
                         <div>Loading assessments...</div>
                       ) : assessmentsError ? (
                         <div className="alert alert-danger">{assessmentsError}</div>
                       ) : studentAssessments.length > 0 ? (
                         <ListGroup>
                           {studentAssessments.map(assessment => {
                             const description = assessment.description || assessment.Description || '';
                             const hasDescription = description && description.trim().length > 0;
                             return (
                               <ListGroup.Item
                                 key={assessment.assessmentId}
                                 className="mb-3 p-3 border-0 shadow-sm rounded d-flex flex-column flex-md-row align-items-md-center justify-content-between"
                                 style={{ background: '#f9fafb' }}
                               >
                                 <div className="d-flex align-items-center">
                                   <i className="bi bi-clipboard-check-fill text-primary fs-2 me-3"></i>
                                   <div>
                                     <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#222' }}>
                                       {assessment.title || 'No Title'}
                                     </div>
                                     {hasDescription && (
                                       <div style={{ color: '#888', fontSize: 14 }}>
                                         {description}
                                       </div>
                                     )}
                                   </div>
                                 </div>
                                 <div className="mt-3 mt-md-0">
                                   <Button
                                     variant="primary"
                                     size="sm"
                                     onClick={() => navigate(`/assessments/${assessment.assessmentId}/attempt`)}
                                   >
                                     Take Assessment
                                   </Button>
                                 </div>
                               </ListGroup.Item>
                             );
                           })}
                         </ListGroup>
                       ) : (
                         <ListGroup.Item>No available assessments found.</ListGroup.Item>
                       )
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Student Management Tab (Instructor Only) */}
              {isInstructor && (
                <Tab.Pane eventKey="students">
                  <Card>
                    <Card.Body>
                      <Card.Title>Student Results</Card.Title>
                      <div className="mb-3">
                        <input type="text" className="form-control" placeholder="Search students..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                      </div>
                      {resultsLoading ? (
                        <div>Loading results...</div>
                      ) : resultsError ? (
                        <Alert variant="danger">{resultsError}</Alert>
                      ) : studentResults.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>User ID</th>
                                <th>Assessment</th>
                                <th>Score</th>
                                <th>Attempt Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentResults
                                .filter(result => {
                                  const userId = result.UserId || result.userId;
                                  const name = userNames[userId] || '';
                                  return (
                                    name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                    userId?.toLowerCase().includes(studentSearch.toLowerCase())
                                  );
                                })
                                .map(result => {
                                const course = allCourses.find(c => (c.CourseId || c.courseId) === (result.CourseId || result.courseId));
                                const courseTitle = course?.Title || course?.title || 'Course';
                                let assessmentTitle = '';
                                const assessmentId = result.AssessmentId || result.assessmentId;
                                const assessment = allAssessments.find(a => (a.AssessmentId || a.assessmentId) === assessmentId);
                                if (assessment) {
                                  assessmentTitle = assessment.Title || assessment.title || 'Assessment';
                                } else {
                                  assessmentTitle = 'Assessment';
                                }
                                const userId = result.UserId || result.userId;
                                const name = userNames[userId];
                                const hasAttempt =
                                  (typeof result.Score === 'number' && !isNaN(result.Score)) ||
                                  (typeof result.score === 'number' && !isNaN(result.score));
                                const scoreValue =
                                  typeof result.Score === 'number' && !isNaN(result.Score)
                                    ? result.Score
                                    : (typeof result.score === 'number' && !isNaN(result.score) ? result.score : 'N/A');
                                const maxScoreValue =
                                  typeof result.MaxScore === 'number' && !isNaN(result.MaxScore)
                                    ? result.MaxScore
                                    : (typeof result.maxScore === 'number' && !isNaN(result.maxScore) ? result.maxScore : 100);
                                const percentage =
                                  hasAttempt && maxScoreValue > 0 && scoreValue !== 'N/A'
                                    ? ((scoreValue / maxScoreValue) * 100).toFixed(1)
                                    : null;
                                const attemptDateRaw = result.AttemptDate || result.attemptDate;
                                  const attemptDateLocal = attemptDateRaw ? new Date(attemptDateRaw).toLocaleString() : 'N/A';
                                return (
                                  <tr key={result.ResultId || result.id}>
                                    <td>{name ? name : 'Loading...'}</td>
                                    <td>{assessmentTitle}</td>
                                    <td>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <strong style={{ color: (hasAttempt && percentage !== null) ? (percentage <= 60 ? '#dc2626' : '#16a34a') : '#222' }}>
                                          {scoreValue}
                                        </strong>
                                        {hasAttempt && percentage !== null && (
                                          <span style={{ color: '#888', fontSize: 14 }}>
                                            ({percentage}%)
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                      <td>{attemptDateLocal}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          </div>
                      ) : (
                        <div>No student results found.</div>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              )}

              {/* Grades Tab (Student Only) */}
              {!isInstructor && (
                <Tab.Pane eventKey="grades">
                  <Card>
                    <Card.Body>
                      <Card.Title>Grades & Progress</Card.Title>
                      {resultsLoading ? (
                        <div>Loading results...</div>
                      ) : resultsError ? (
                        <div className="alert alert-danger">{resultsError}</div>
                      ) : studentResults.length > 0 ? (
                      <ListGroup>
                          {studentResults.map(result => {
                            const course = allCourses.find(c => (c.CourseId || c.courseId) === (result.CourseId || result.courseId));
                            const courseTitle = course?.Title || course?.title || 'Course';
                            let assessmentTitle = '';
                            const assessmentId = result.AssessmentId || result.assessmentId;
                            const assessment = allAssessments.find(a => (a.AssessmentId || a.assessmentId) === assessmentId);
                            if (assessment) {
                              assessmentTitle = assessment.Title || assessment.title || 'Assessment';
                            } else {
                              assessmentTitle = 'Assessment';
                            }
                            const hasAttempt =
                              (typeof result.Score === 'number' && !isNaN(result.Score)) ||
                              (typeof result.score === 'number' && !isNaN(result.score));
                            const scoreValue =
                              typeof result.Score === 'number' && !isNaN(result.Score)
                                ? result.Score
                                : (typeof result.score === 'number' && !isNaN(result.score) ? result.score : null);
                            const maxScoreValue =
                              typeof result.MaxScore === 'number' && !isNaN(result.MaxScore)
                                ? result.MaxScore
                                : (typeof result.maxScore === 'number' && !isNaN(result.maxScore) ? result.maxScore : 100);
                            const attemptDateRaw = result.AttemptDate || result.attemptDate;
                            const attemptDateLocal = attemptDateRaw ? new Date(attemptDateRaw).toLocaleString() : 'N/A';
                            const percentage =
                              hasAttempt && maxScoreValue > 0 && scoreValue !== null
                                ? ((scoreValue / maxScoreValue) * 100).toFixed(1)
                                : null;
                            return (
                              <ListGroup.Item key={result.ResultId || result.id} className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div>
                                    <h5 className="mb-0">{assessmentTitle}</h5>
                                  </div>
                                  <span style={{ fontSize: 14, color: '#888' }}>
                                    Attempted: {attemptDateLocal}
                                  </span>
                                </div>
                                <div className="mb-1">
                                  Score: <strong style={{ color: (hasAttempt && percentage !== null) ? (percentage <= 60 ? '#dc2626' : '#16a34a') : '#222' }}>
                                    {hasAttempt && scoreValue !== null ? scoreValue : 'N/A'}
                                  </strong> / {maxScoreValue} {hasAttempt && percentage !== null ? `(${percentage}%)` : ''}
                                </div>
                                {hasAttempt && percentage !== null ? (
                                  <ProgressBar now={scoreValue} max={maxScoreValue} label={`${percentage}%`} className="mb-2" />
                                ) : (
                                  <ProgressBar now={0} max={100} label={"Not Attempted"} className="mb-2" />
                                )}
                              </ListGroup.Item>
                            );
                          })}
                      </ListGroup>
                      ) : (
                        <div className="alert alert-info">No results found. Complete an assessment to see your progress!</div>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              )}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Edit Assessment Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Assessment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editAssessmentData ? (
            <Form>
              <Form.Group className="mb-3" controlId="editAssessmentTitle">
                <Form.Label>Assessment Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editAssessmentData.title || editAssessmentData.Title || ''}
                  onChange={e => setEditAssessmentData({ ...editAssessmentData, Title: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editAssessmentMaxScore">
                <Form.Label>Max Score</Form.Label>
                <Form.Control
                  type="number"
                  value={editAssessmentData.maxScore || editAssessmentData.MaxScore || 100}
                  onChange={e => setEditAssessmentData({ ...editAssessmentData, MaxScore: parseInt(e.target.value) })}
                />
              </Form.Group>
              {/* Show all questions for editing */}
              <h5>Questions</h5>
              {editAssessmentData.Questions && editAssessmentData.Questions.length > 0 ? editAssessmentData.Questions.map((q, idx) => (
                <Card key={idx} className="mb-3 p-2">
                  <Form.Group className="mb-2">
                    <Form.Label>Question {idx + 1}</Form.Label>
                    <Form.Control
                      type="text"
                      value={q.text}
                      onChange={e => {
                        const updated = [...editAssessmentData.Questions];
                        updated[idx].text = e.target.value;
                        setEditAssessmentData({ ...editAssessmentData, Questions: updated });
                      }}
                      required
                    />
                  </Form.Group>
                  <Form.Label>Options</Form.Label>
                  {q.options.map((opt, optIdx) => (
                    <Form.Group key={optIdx} className="mb-1 d-flex align-items-center">
                      <Form.Check
                        type="radio"
                        name={`editCorrectAnswer-${idx}`}
                        id={`edit-option-${idx}-${optIdx}`}
                        className="me-2"
                        checked={q.correctAnswer === opt}
                        onChange={() => {
                          const updated = [...editAssessmentData.Questions];
                          updated[idx].correctAnswer = opt;
                          setEditAssessmentData({ ...editAssessmentData, Questions: updated });
                        }}
                      />
                      <Form.Control
                        type="text"
                        value={opt}
                        onChange={e => {
                          const updated = [...editAssessmentData.Questions];
                          updated[idx].options[optIdx] = e.target.value;
                          setEditAssessmentData({ ...editAssessmentData, Questions: updated });
                        }}
                        required
                      />
                    </Form.Group>
                  ))}
                  <Form.Group className="mb-2 mt-2">
                    <Form.Label>Points</Form.Label>
                    <Form.Control
                      type="number"
                      value={q.points}
                      min="1"
                      onChange={e => {
                        const updated = [...editAssessmentData.Questions];
                        updated[idx].points = e.target.value;
                        setEditAssessmentData({ ...editAssessmentData, Questions: updated });
                      }}
                      required
                    />
                  </Form.Group>
                  <Button variant="outline-danger" size="sm" onClick={() => {
                    const updated = [...editAssessmentData.Questions];
                    updated.splice(idx, 1);
                    setEditAssessmentData({ ...editAssessmentData, Questions: updated });
                  }}>
                    Remove Question
                  </Button>
                </Card>
              )) : <div>No questions found.</div>}
              <Button variant="outline-secondary" size="sm" onClick={() => {
                const updated = [...(editAssessmentData.Questions || [])];
                updated.push({ text: '', options: ['', '', '', ''], correctAnswer: '', points: '' });
                setEditAssessmentData({ ...editAssessmentData, Questions: updated });
              }}>
                Add Question
              </Button>
            </Form>
          ) : <div>Loading...</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={async () => {
            try {
              const payload = {
                ...editAssessmentData,
                Questions: JSON.stringify(editAssessmentData.Questions)
              };
              await api.put(`/Assessments/${editAssessmentData.assessmentId || editAssessmentData.AssessmentId}`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              setShowEditModal(false);
              fetchInstructorAssessments();
            } catch (err) {
              console.error('Error updating assessment:', err);
              alert('Failed to update assessment. Please try again.');
            }
          }}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Course Modal */}
      <EditCourseModal
        show={showEditCourseModal}
        onHide={() => setShowEditCourseModal(false)}
        courseData={editCourseData}
        onChange={handleEditCourseInputChange}
        onSubmit={handleEditCourseSubmit}
        error={editCourseError}
      />

      {/* Add a modal for viewing questions when clicking the assessment title */}
      <Modal show={showQuestionsModal} onHide={() => setShowQuestionsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Questions for {viewAssessmentTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewQuestions.length > 0 ? viewQuestions.map((q, idx) => (
            <Card key={idx} className="mb-3 p-2">
              <div><strong>Q{idx + 1}:</strong> {q.text}</div>
              <div>Options: {q.options && q.options.join(', ')}</div>
              <div>Correct Answer: <strong>{q.correctAnswer}</strong></div>
              <div>Points: {q.points}</div>
              {/* Optionally, add edit/delete buttons here if you want inline editing */}
            </Card>
          )) : <div>No questions found.</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuestionsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => {
        setShowDeleteModal(false);
        setAssessmentToDelete(null);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this assessment? This action cannot be undone and will also delete all associated results.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowDeleteModal(false);
            setAssessmentToDelete(null);
          }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDeleteAssessment(assessmentToDelete)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// Footer for Dashboard page
const DashboardFooter = () => (
  <footer style={{
    width: '100%',
    background: '#f3f4f6',
    color: '#6366f1',
    textAlign: 'center',
    fontWeight: 600,
    borderTop: '1px solid #e0e7ff',
    borderRadius: '0 0 18px 18px',
    letterSpacing: 0.5,
    marginTop: 'auto',
    padding: '24px 0'
  }}>
    EduSync &copy; {new Date().getFullYear()} &mdash; Empowering Learning
  </footer>
);

export default function DashboardWithFooter(props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Dashboard {...props} />
    <DashboardFooter />
    </div>
  );
}

<style>{`
  .course-card-hover {
    transition: box-shadow 0.18s, transform 0.18s;
  }
  .course-card-hover:hover {
    box-shadow: 0 8px 32px rgba(99,102,241,0.13), 0 1.5px 8px rgba(99,102,241,0.08);
    transform: translateY(-6px) scale(1.035);
  }
  .assessment-card-hover {
    transition: box-shadow 0.18s, transform 0.18s;
  }
  .assessment-card-hover:hover {
    box-shadow: 0 8px 32px rgba(99,102,241,0.13), 0 1.5px 8px rgba(99,102,241,0.08);
    transform: translateY(-6px) scale(1.035);
  }
`}</style> 