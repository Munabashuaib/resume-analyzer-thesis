import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
});

// ✅ Global 401 handler
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const logoutUser = async () => {
  return await api.post("/auth/logout");
};

export default api;  // ✅ Fixed typo (was API)


// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true // Required for sessions
// });

// export const logoutUser = async () => {
//   return await api.post("/auth/logout");
// };


// export default api;






// import axios from 'axios';
// import API_BASE_URL from './config';

// // Create an axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true, // Important if your backend needs session cookies
// });

// // API functions using axios

// export async function uploadResume(file) {
//   const formData = new FormData();
//   formData.append('resume', file);

//   const response = await api.post('/upload_resume', formData);
//   return response.data;
// }

// export async function registerUser(formData) {
//   const response = await api.post('/register', formData);
//   return response.data;
// }

// export async function loginUser(formData) {
//   const response = await api.post('/login', formData);
//   return response.data;
// }

// export async function addJob(jobData) {
//   const response = await api.post('/add_job', jobData);
//   return response.data;
// }

// export async function fetchJobs() {
//   const response = await api.get('/jobs');
//   return response.data;
// }

// export async function fetchMatches() {
//   const response = await fetch(`${API_BASE_URL}/matches`, {
//     credentials: 'include',
//   });
//   return await response.json();
// }


// // Default export for raw use (e.g., in MatchResults.js)
// export default api;
















// import API_BASE_URL from './config';

// export async function uploadResume(file) {
//   const formData = new FormData();
//   formData.append('resume', file);

//   const response = await fetch(`${API_BASE_URL}/upload_resume`, {
//     method: 'POST',
//     body: formData,
//     credentials: 'include',
//   });
//   return await response.json();
// }

// export async function registerUser(formData) {
//   const response = await fetch(`${API_BASE_URL}/register`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(formData),
//     credentials: 'include',
//   });
//   return await response.json();
// }

// export async function loginUser(formData) {
//   const response = await fetch(`${API_BASE_URL}/login`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(formData),
//     credentials: 'include',
//   });
//   return await response.json();
// }

// export async function addJob(jobData) {
//   const response = await fetch(`${API_BASE_URL}/add_job`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(jobData),
//     credentials: 'include',
//   });
//   return await response.json();
// }

// export async function fetchJobs() {
//   const response = await fetch(`${API_BASE_URL}/jobs`, {
//     credentials: 'include',
//   });
//   return await response.json();
// }
