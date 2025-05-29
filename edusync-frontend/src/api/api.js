import axios from 'axios';

const API_BASE_URL = 'http://localhost:5036/api'; // Updated to match backend port

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // if you use cookies for auth
});

export default api; 