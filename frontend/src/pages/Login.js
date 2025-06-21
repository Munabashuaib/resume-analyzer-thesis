import React, { useState } from "react";
import {
  TextField, Button, Typography, CardContent, Box,
  InputAdornment, IconButton, Snackbar, Alert, Grid, Card, useMediaQuery
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import loginIllustration from "../assets/login.svg";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      const { user_id, role } = res.data;
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("role", role);

      if (role === "employer") navigate("/employer-dashboard");
      else if (role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {!isSmallScreen && (
        <Grid item md={5} sx={{
          backgroundColor: "#f0f4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img
            src={loginIllustration}
            alt="Login Illustration"
            style={{ width: "80%", maxWidth: 500 }}
          />
        </Grid>
      )}

      <Grid item xs={12} md={7} sx={{
        display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: { xs: 6, md: 0 }
      }}>
        <Card sx={{ width: "100%", maxWidth: 520, p: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
                Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please enter your credentials to continue
              </Typography>
            </Box>

            <form onSubmit={handleLogin}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                helperText="Password must be correct to proceed"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
              >
                Login
              </Button>

              <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                Don’t have an account? <Link to="/register">Register</Link>
              </Typography>
            </form>
          </CardContent>
        </Card>

        <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg("")}>
          <Alert onClose={() => setErrorMsg("")} severity="error" variant="filled">
            {errorMsg}
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
}

export default Login;





// import React, { useState } from "react";
// import {
//   TextField,
//   Button,
//   Container,
//   Typography,
//   Card,
//   CardContent,
//   Box
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import api from "../api";

// function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/auth/login", form);
//       const { user_id, role } = res.data;

//       localStorage.setItem("user_id", user_id);
//       localStorage.setItem("role", role);

//       alert(`Login successful as ${role}`);

//       if (role === "employer") {
//         navigate("/employer-dashboard");
//       } else if (role === "admin") {
//         navigate("/admin");
//       } else {
//         navigate("/dashboard");
//       }
//     } catch (err) {
//       alert(err.response?.data?.error || "Login failed");
//     }
//   };

//   return (
//     <Container
//       maxWidth="sm"
//       sx={{
//         minHeight: "80vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center"
//       }}
//     >
//       <Card sx={{ width: "100%", p: 3, boxShadow: 3, borderRadius: 2 }}>
//         <CardContent>
//           <Box sx={{ textAlign: "center", mb: 2 }}>
//             <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
//               Login
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Please enter your credentials to continue
//             </Typography>
//           </Box>

//           <form onSubmit={handleLogin}>
//             <TextField
//               label="Email"
//               type="email"
//               fullWidth
//               variant="outlined"
//               margin="normal"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               required
//             />

//             <TextField
//               label="Password"
//               type="password"
//               fullWidth
//               variant="outlined"
//               margin="normal"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               required
//             />

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               color="primary"
//               size="large"
//               sx={{
//                 mt: 3,
//                 py: 1.5,
//                 fontWeight: 600,
//                 textTransform: "none",
//                 ":hover": { transform: "scale(1.02)" },
//                 transition: "all 0.2s ease-in-out"
//               }}
//             >
//               Login
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </Container>
//   );
// }

// export default Login;


// import React, { useState } from "react";
// import { TextField, Button, Container, Typography } from '@mui/material';
// import { useNavigate } from "react-router-dom";
// import api from "../api";

// function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/auth/login", form);
//       const { user_id, role } = res.data;

//       // Save user info to localStorage
//       localStorage.setItem("user_id", user_id);
//       localStorage.setItem("role", role);

//       alert(`Login successful as ${role}`);

//       // Redirect based on role
//       if (role === "employer") {
//         navigate("/employer");
//       } else if (role === "admin") {
//         navigate("/admin");
//       } else {
//         navigate("/dashboard");
//       }
//     } catch (err) {
//       alert(err.response?.data?.error || "Login failed");
//     }
//   };

//   return (
//     <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 3 }}>
//       <Typography variant="h4" component="h1" gutterBottom>
//         Login
//       </Typography>
//       <form onSubmit={handleLogin} style={{ width: '100%' }}>
//         <TextField
//           label="Email"
//           variant="outlined"
//           fullWidth
//           margin="normal"
//           value={form.email}
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//         />
//         <TextField
//           label="Password"
//           type="password"
//           variant="outlined"
//           fullWidth
//           margin="normal"
//           value={form.password}
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />
//         <Button
//           type="submit"
//           variant="contained"
//           color="primary"
//           fullWidth
//           sx={{ marginTop: 2 }}
//         >
//           Login
//         </Button>
//       </form>
//     </Container>
//   );
// }

// export default Login;


// code with basic html//
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api";

// function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/auth/login", form);
//       const { user_id, role } = res.data;

//       // Save user info to localStorage
//       localStorage.setItem("user_id", user_id);
//       localStorage.setItem("role", role);

//       alert(`Login successful as ${role}`);
//       localStorage.setItem("role", res.data.role);


//       // Redirect based on role
//       if (role === "employer") {
//         navigate("/employer");
//       } else if (role === "admin") {
//         navigate("/admin");
//       } else {
//         navigate("/dashboard");
//       }
//     } catch (err) {
//       alert(err.response?.data?.error || "Login failed");
//     }
//   };

//   return (
//     <form onSubmit={handleLogin}>
//       <input
//         type="email"
//         placeholder="Email"
//         value={form.email}
//         onChange={(e) => setForm({ ...form, email: e.target.value })}
//         required
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={form.password}
//         onChange={(e) => setForm({ ...form, password: e.target.value })}
//         required
//       />
//       <button type="submit">Login</button>
//     </form>
//   );
// }

// export default Login;



// import React, { useState } from 'react';
// import { loginUser } from '../api';

// function Login() {
//   const [formData, setFormData] = useState({ username: '', password: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = await loginUser(formData);
//     alert(data.message || data.error);
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} />
//         <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }

// export default Login;


// import React, { useState } from 'react';

// const Login = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     const response = await fetch('/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password }),
//     });

//     if (response.ok) {
//       alert('Login successful');
//       setUsername('');
//       setPassword('');
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleLogin}>
//         <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
//         <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default Login;



//working copy//

// import React, { useState } from 'react';
// import axios from 'axios';

// const Login = () => {
//   const [form, setForm] = useState({ email: '', password: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post('http://localhost:5000/login', form);
//       alert('Login successful');
//     } catch (err) {
//       alert('Login failed');
//       console.error(err);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Login</h2>
//       <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
//       <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
//       <button type="submit">Login</button>
//     </form>
//   );
// };

// export default Login;
