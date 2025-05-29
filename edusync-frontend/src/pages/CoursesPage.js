import React, { useEffect, useState } from 'react';
import CourseList from '../components/CourseList';
import api from '../api/api';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(err => alert('Failed to fetch courses'));
  }, []);

  return <CourseList courses={courses} />;
};

export default CoursesPage; 