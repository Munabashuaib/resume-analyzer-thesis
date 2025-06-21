import React, { useState } from "react";
import {
  TextField, Button, Typography, Select, MenuItem, FormControl,
  InputLabel, CardContent, Box, InputAdornment, IconButton, Snackbar,
  Alert, Grid, Card, useMediaQuery
} from "@mui/material";
import { Email, Person, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import registerIllustration from "../assets/register.svg";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "seeker" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", form);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Registration failed");
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
            src={registerIllustration}
            alt="Register Illustration"
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
                Register
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your account and get started
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                }}
              />
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
                helperText="Password must be at least 6 characters"
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

              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="seeker">Job Seeker</MenuItem>
                  <MenuItem value="employer">Employer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
              >
                Register
              </Button>

              <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                Already have an account? <Link to="/login">Login</Link>
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

export default Register;



// import React, { useState } from "react";
// import {
//   TextField,
//   Button,
//   Container,
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Card,
//   CardContent,
//   Box
// } from "@mui/material";
// import api from "../api";

// function Register() {
//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     role: "seeker"
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/auth/register", form);
//       alert(res.data.message);
//     } catch (err) {
//       alert(err.response?.data?.error || "Registration failed");
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
//               Register
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Create your account and get started
//             </Typography>
//           </Box>

//           <form onSubmit={handleSubmit}>
//             <TextField
//               label="Username"
//               variant="outlined"
//               fullWidth
//               margin="normal"
//               value={form.username}
//               onChange={(e) => setForm({ ...form, username: e.target.value })}
//               required
//             />
//             <TextField
//               label="Email"
//               type="email"
//               variant="outlined"
//               fullWidth
//               margin="normal"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               required
//             />
//             <TextField
//               label="Password"
//               type="password"
//               variant="outlined"
//               fullWidth
//               margin="normal"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               required
//             />
//             <FormControl fullWidth margin="normal">
//               <InputLabel>Role</InputLabel>
//               <Select
//                 value={form.role}
//                 onChange={(e) => setForm({ ...form, role: e.target.value })}
//                 label="Role"
//               >
//                 <MenuItem value="seeker">Job Seeker</MenuItem>
//                 <MenuItem value="employer">Employer</MenuItem>
//                 <MenuItem value="admin">Admin</MenuItem>
//               </Select>
//             </FormControl>
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
//               Register
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </Container>
//   );
// }

// export default Register;


// import React, { useState } from "react";
// import { TextField, Button, Container, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
// import api from "../api";

// function Register() {
//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     role: "seeker" // default
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/auth/register", form);
//       alert(res.data.message);
//     } catch (err) {
//       alert(err.response?.data?.error || "Registration failed");
//     }
//   };

//   return (
//     <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 3 }}>
//       <Typography variant="h4" component="h1" gutterBottom>
//         Register
//       </Typography>
//       <form onSubmit={handleSubmit} className="space-y-4" style={{ width: '100%' }}>
//         <TextField
//           label="Username"
//           variant="outlined"
//           fullWidth
//           margin="normal"
//           value={form.username}
//           onChange={(e) => setForm({ ...form, username: e.target.value })}
//         />
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
//         <FormControl fullWidth margin="normal">
//           <InputLabel>Role</InputLabel>
//           <Select
//             value={form.role}
//             onChange={(e) => setForm({ ...form, role: e.target.value })}
//             label="Role"
//           >
//             <MenuItem value="seeker">Job Seeker</MenuItem>
//             <MenuItem value="employer">Employer</MenuItem>
//             <MenuItem value="admin">Admin</MenuItem>
//           </Select>
//         </FormControl>
//         <Button
//           type="submit"
//           variant="contained"
//           color="primary"
//           fullWidth
//           sx={{ marginTop: 2 }}
//         >
//           Register
//         </Button>
//       </form>
//     </Container>
//   );
// }

// export default Register;



// code with basic html//
// import React, { useState } from "react";
// import api from "../api";

// function Register() {
//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     role: "seeker" // default
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/auth/register", form);
//       alert(res.data.message);
//     } catch (err) {
//       alert(err.response?.data?.error || "Registration failed");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <input
//         type="text"
//         placeholder="Username"
//         value={form.username}
//         onChange={e => setForm({ ...form, username: e.target.value })}
//         className="block border p-2 w-full"
//       />
//       <input
//         type="email"
//         placeholder="Email"
//         value={form.email}
//         onChange={e => setForm({ ...form, email: e.target.value })}
//         className="block border p-2 w-full"
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={form.password}
//         onChange={e => setForm({ ...form, password: e.target.value })}
//         className="block border p-2 w-full"
//       />
//       <select
//         value={form.role}
//         onChange={e => setForm({ ...form, role: e.target.value })}
//         className="block border p-2 w-full"
//       >
//         <option value="seeker">Job Seeker</option>
//         <option value="employer">Employer</option>
//         <option value="admin">Admin</option>
//       </select>
//       <button type="submit" className="bg-blue-600 text-white p-2 w-full">Register</button>
//     </form>
//   );
// }

// export default Register;


// import React, { useState } from "react";
// import api from "../api";

// function Register() {
//   const [form, setForm] = useState({ username: "", email: "", password: "" });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/auth/register", form);
//       alert(res.data.message);
//     } catch (err) {
//       alert(err.response?.data?.error || "Registration failed");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input type="text" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
//       <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
//       <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
//       <button type="submit">Register</button>
//     </form>
//   );
// }

// export default Register;



// import React, { useState } from 'react';
// import { registerUser } from '../api';

// function Register() {
//   const [formData, setFormData] = useState({ username: '', password: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = await registerUser(formData);
//     alert(data.message || data.error);
//   };

//   return (
//     <div>
//       <h2>Register</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} />
//         <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
//         <button type="submit">Register</button>
//       </form>
//     </div>
//   );
// }

// export default Register;




//working copy//

// import React, { useState } from 'react';
// import axios from 'axios';

// const Register = () => {
//   const [form, setForm] = useState({ username: '', email: '', password: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post('http://localhost:5000/register', form);
//       alert('Registered successfully');
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Register</h2>
//       <input placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} required />
//       <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
//       <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
//       <button type="submit">Register</button>
//     </form>
//   );
// };

// export default Register;
