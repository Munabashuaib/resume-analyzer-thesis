import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';

import Login from "./pages/Login";
import Register from "./pages/Register";
import ResumeUpload from "./components/ResumeUpload";
import JobList from "./components/JobList";
import Dashboard from "./pages/Dashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import AdminPanel from "./pages/AdminPanel";
import MatchResults from "./components/MatchResults";

import SessionChecker from "./components/SessionChecker";
import { logoutUser } from './api';
import PrivateRoute from "./PrivateRoute";

import SeekerDashboard from './pages/SeekerDashboard';
import Applicants from './pages/Applicants';
import Notifications from './pages/Notifications';
import ResumeEnhancerPage from './pages/ResumeEnhancer';
import { useLocation } from "react-router-dom";
import UserProfile from './pages/UserProfile'; //  add import


function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const isLoggedIn = localStorage.getItem("user_id");

  const hideOnRoutes = ["/login", "/register"];
  if (hideOnRoutes.includes(location.pathname)) return null;

  const handleLogout = async () => {
    await logoutUser();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          onClick={() => navigate("/")}
          sx={{ cursor: "pointer", fontWeight: 600, color: "primary.main" }}
        >
          Job Portal
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button onClick={() => navigate("/")} color="primary">Jobs</Button>

          {role === "seeker" && (
            <>
              <Button onClick={() => navigate("/upload")} color="primary">Upload Resume</Button>
              <Button onClick={() => navigate("/seeker/dashboard")} color="primary">Dashboard</Button>
              <Button onClick={() => navigate("/notifications")} color="primary">Notifications</Button>
              <Button onClick={() => navigate("/enhancer")} color="primary">Enhancer</Button>
            </>
          )}

          {role === "employer" && (
            <>
              <Button onClick={() => navigate("/employer-dashboard")} color="primary">Employer Dashboard</Button>
              <Button onClick={() => navigate("/notifications")} color="primary">Notifications</Button>
            </>
          )}

          {role === "admin" && (
            <>
              <Button onClick={() => navigate("/admin")} color="primary">Admin Panel</Button>
              <Button onClick={() => navigate("/notifications")} color="primary">Notifications</Button>
            </>
          )}

          {isLoggedIn && (
            <Button onClick={() => navigate("/profile")} color="primary">Profile</Button> // Profile button
          )}

          {!isLoggedIn ? (
            <>
              <Button variant="outlined" onClick={() => navigate("/login")}>Login</Button>
              <Button variant="contained" onClick={() => navigate("/register")}>Register</Button>
            </>
          ) : (
            <Button variant="contained" color="secondary" onClick={handleLogout}>Logout</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}


function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <NavBar />
        <SessionChecker>
          <div style={{ padding: "20px" }}>
            <Routes>
              <Route path="/" element={<JobList />} />
              <Route path="/upload" element={<PrivateRoute element={ResumeUpload} allowedRoles={["seeker"]} />} />
              <Route path="/dashboard" element={<PrivateRoute element={Dashboard} allowedRoles={["seeker"]} />} />
              <Route path="/employer-dashboard" element={<PrivateRoute element={EmployerDashboard} allowedRoles={["employer"]} />} />
              <Route path="/admin" element={<PrivateRoute element={AdminPanel} allowedRoles={["admin"]} />} />
              <Route path="/results" element={<PrivateRoute element={MatchResults} allowedRoles={["seeker"]} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/seeker/dashboard" element={<PrivateRoute element={SeekerDashboard} allowedRoles={["seeker"]} />} />
              <Route path="/employer/applicants/:jobId" element={<PrivateRoute element={Applicants} allowedRoles={["employer"]} />} />
              <Route path="/notifications" element={<PrivateRoute element={Notifications} allowedRoles={["seeker", "employer", "admin"]} />} />
              <Route path="/enhancer" element={<PrivateRoute element={ResumeEnhancerPage} allowedRoles={["seeker"]} />} />
              <Route path="/profile" element={<PrivateRoute element={UserProfile} allowedRoles={["seeker", "employer", "admin"]} />} /> {/* ✅ Profile route */}
            </Routes>
          </div>
        </SessionChecker>
      </Router>
    </ThemeProvider>
  );
}

export default App;




// code with basic html//
// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Link,
//   useNavigate,
// } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ResumeUpload from "./components/ResumeUpload";
// import JobList from "./components/JobList";
// import Dashboard from "./pages/Dashboard";
// import EmployerDashboard from "./pages/EmployerDashboard";
// import AdminPanel from "./pages/AdminPanel";
// import { logoutUser } from "./api";
// import PrivateRoute from "./PrivateRoute";
// import { ThemeProvider } from '@mui/material/styles';
// import theme from './theme'; // Import your custom theme
// import Login from './pages/Login';  // Example page
// import Dashboard from './pages/Dashboard';

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <div>
//         {/* You can replace this with your routing logic later */}
//         <Login />
//       </div>
//     </ThemeProvider>
//   );
// }


// function NavBar() {
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");
//   const isLoggedIn = localStorage.getItem("user_id");

//   const handleLogout = async () => {
//     await logoutUser();
//     localStorage.clear();
//     navigate("/login");
//   };

//   return (
//     <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
//       <Link to="/" style={{ marginRight: 10 }}>Jobs</Link>

//       {role === "seeker" && (
//         <>
//           <Link to="/upload" style={{ marginRight: 10 }}>Upload Resume</Link>
//           <Link to="/dashboard" style={{ marginRight: 10 }}>Dashboard</Link>
//         </>
//       )}

//       {role === "employer" && (
//         <Link to="/employer-dashboard" style={{ marginRight: 10 }}>Employer Dashboard</Link>
//       )}

//       {role === "admin" && (
//         <Link to="/admin" style={{ marginRight: 10 }}>Admin Panel</Link>
//       )}

//       {!isLoggedIn ? (
//         <>
//           <Link to="/login" style={{ marginRight: 10 }}>Login</Link>
//           <Link to="/register" style={{ marginRight: 10 }}>Register</Link>
//         </>
//       ) : (
//         <button onClick={handleLogout}>Logout</button>
//       )}
//     </nav>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <NavBar />
//       <div style={{ padding: "20px" }}>
//         <Routes>
//           <Route path="/" element={<JobList />} />
//           <Route
//             path="/upload"
//             element={<PrivateRoute element={ResumeUpload} allowedRoles={["seeker"]} />}
//           />
//           <Route
//             path="/dashboard"
//             element={<PrivateRoute element={Dashboard} allowedRoles={["seeker"]} />}
//           />
//           <Route
//             path="/employer-dashboard"
//             element={<PrivateRoute element={EmployerDashboard} allowedRoles={["employer"]} />}
//           />
//           <Route
//             path="/admin"
//             element={<PrivateRoute element={AdminPanel} allowedRoles={["admin"]} />}
//           />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;





// import React, { useState } from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import ResumeUpload from './components/ResumeUpload';
// import JobForm from './components/JobForm';
// import JobList from './components/JobList';
// import Register from './pages/Register';
// import Login from './pages/Login';
// import MatchResults from './components/MatchResults';

// function App() {
//   const [matches, setMatches] = useState([]);

//   return (
//     <Router>
//       <nav>
//         <Link to="/">Upload Resume</Link>
//         <Link to="/add-job">Add Job</Link>
//         <Link to="/job-list">Job List</Link>
//         <Link to="/register">Register</Link>
//         <Link to="/login">Login</Link>
//       </nav>
//       <Routes>
//         <Route path="/" element={<ResumeUpload setMatches={setMatches} />} />
//         <Route path="/add-job" element={<JobForm />} />
//         <Route path="/job-list" element={<JobList />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/match-results" element={<MatchResults matches={matches} />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// import logo from './logo.svg';
// import './App.css';




// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload. 
//           Hello from Resume Analyzer!

//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <div className="text-center mt-10">
//       <h1 className="text-4xl font-bold text-blue-600">Tailwind is working! 🎉</h1>
//     </div>
//   );
// }



//working copy//
// src/App.js
// App.js
// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import ResumeUpload from './components/ResumeUpload';
// import AddJob from './components/JobForm'; // AddJob is probably your JobForm.js
// import JobList from './components/JobList';
// import MatchResults from './components/MatchResults';
// import Register from './pages/Register';
// import Login from './pages/Login';



// const App = () => {
//   return (
//     <Router>
//       <div className="p-4">
//         {/* Navigation Bar (Optional) */}
//         <nav className="mb-4 space-x-4">
//           <Link to="/upload" className="text-blue-500 hover:underline">Upload Resume</Link>
//           <Link to="/add-job" className="text-blue-500 hover:underline">Add Job</Link>
//           <Link to="/job-list" className="text-blue-500 hover:underline">Job List</Link>
//           <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
//           <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
//         </nav>


//         <Routes>
//           <Route path="/upload" element={<ResumeUpload />} />
//           <Route path="/add-job" element={<AddJob />} />
//           <Route path="/job-list" element={<JobList />} />
//           <Route path="/results" element={<MatchResults />} />
//           {/* Optional: Redirect from root to upload */}
//           <Route path="/" element={<ResumeUpload />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/login" element={<Login />} />

//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default App;


