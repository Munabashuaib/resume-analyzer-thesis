import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Grid, Stack, Divider, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../api';

function EmployerDashboard() {
  const [form, setForm] = useState({ title: '', description: '' });
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/employer');
      setJobs(res.data.jobs);
    } catch {
      alert("Failed to fetch your jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs/add', form);
      setForm({ title: '', description: '' });
      fetchJobs();
    } catch {
      alert("Failed to post job");
    }
  };

  const handleViewApplicants = async (jobId) => {
    try {
      const res = await api.get(`/jobs/applications/${jobId}`);
      setApplicants(res.data.applicants);
      setSelectedJobId(jobId);
      setOpenDialog(true);
    } catch {
      alert("Failed to fetch applicants");
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const res = await api.post(`/jobs/applications/update-status/${applicationId}`, {
        status: newStatus
      });
      alert(res.data.message || "Status updated");

      // Refresh the applicant list after status change
      const updated = await api.get(`/jobs/applications/${selectedJobId}`);
      setApplicants(updated.data.applicants);
    } catch (err) {
      console.error(err);
      alert("Failed to update application status");
    }
  };

  const extractFromPDF = async () => {
    if (!pdfFile) return alert("Upload a PDF first");
    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const res = await api.post("/jobs/parse-pdf-description", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(prev => ({ ...prev, description: res.data.text }));
    } catch {
      alert("Failed to extract text from PDF");
    }
  };

  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Typography variant="h4" color="primary" gutterBottom>Employer Dashboard</Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Post a New Job</Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Job Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <TextField
                label="Description"
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="outlined" component="label">
                  Upload Description PDF
                  <input type="file" hidden accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
                </Button>
                <Button variant="contained" onClick={extractFromPDF}>
                  Extract Description from PDF
                </Button>
              </Stack>
              <Button type="submit" variant="contained" color="primary">Post Job</Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>Your Posted Jobs</Typography>
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} key={job.id}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <WorkIcon color="action" />
                  <Typography variant="subtitle1" fontWeight={600}>{job.title}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {job.description?.slice(0, 80)}...
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">Posted by you</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleViewApplicants(job.id)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small"><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Applicants for Job ID #{selectedJobId}</DialogTitle>
        <DialogContent dividers>
          {applicants.length === 0 ? (
            <Typography>No applicants yet.</Typography>
          ) : (
            applicants.map((app, index) => (
              <Box key={index} mb={3}>
                <Typography fontWeight={600}>User ID: {app.user_id}</Typography>
                <Typography>Matched via resume</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {app.resume_text?.slice(0, 250)}...
                </Typography>
                <Stack direction="row" spacing={2} mt={1}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleStatusChange(app.id, "Accepted")}
                  >
                    ACCEPT
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleStatusChange(app.id, "Rejected")}
                  >
                    REJECT
                  </Button>
                  <Typography variant="caption" sx={{ ml: 2 }}>
                    Status: {app.status}
                  </Typography>
                </Stack>
                <Divider sx={{ my: 2 }} />
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmployerDashboard;




// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   Grid,
//   Stack,
//   Divider,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from '@mui/material';
// import WorkIcon from '@mui/icons-material/Work';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import api from '../api';

// function EmployerDashboard() {
//   const [form, setForm] = useState({ title: '', description: '' });
//   const [jobs, setJobs] = useState([]);
//   const [editingJob, setEditingJob] = useState(null);
//   const [confirmDeleteId, setConfirmDeleteId] = useState(null);

//   const fetchJobs = async () => {
//     try {
//       const res = await api.get('/jobs/employer');
//       setJobs(res.data.jobs);
//     } catch (err) {
//       alert("Failed to fetch your jobs");
//     }
//   };

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post('/jobs/add', form);
//       setForm({ title: '', description: '' });
//       fetchJobs();
//     } catch (err) {
//       alert("Failed to post job");
//     }
//   };

//   const handleEditSave = async () => {
//     try {
//       await api.put(`/jobs/update/${editingJob.id}`, {
//         title: editingJob.title,
//         description: editingJob.description
//       });
//       setEditingJob(null);
//       fetchJobs();
//     } catch (err) {
//       alert("Failed to update job");
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await api.delete(`/jobs/delete/${confirmDeleteId}`);
//       setConfirmDeleteId(null);
//       fetchJobs();
//     } catch (err) {
//       alert("Failed to delete job");
//     }
//   };

//   return (
//     <Box maxWidth="md" mx="auto" mt={4}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Employer Dashboard
//       </Typography>

//       {/* Post Job Form */}
//       <Card sx={{ mb: 4 }}>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             Post a New Job
//           </Typography>
//           <form onSubmit={handleSubmit}>
//             <Stack spacing={2}>
//               <TextField
//                 label="Job Title"
//                 value={form.title}
//                 onChange={(e) => setForm({ ...form, title: e.target.value })}
//                 required
//               />
//               <TextField
//                 label="Description"
//                 multiline
//                 minRows={3}
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 required
//               />
//               <Button type="submit" variant="contained" color="primary">
//                 Post Job
//               </Button>
//             </Stack>
//           </form>
//         </CardContent>
//       </Card>

//       {/* Posted Jobs */}
//       <Typography variant="h6" gutterBottom>
//         Your Posted Jobs
//       </Typography>
//       <Grid container spacing={3}>
//         {Array.isArray(jobs) && jobs.map((job) => (
//           <Grid item xs={12} sm={6} key={job.id}>
//             <Card variant="outlined">
//               <CardContent>
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                   <WorkIcon color="action" />
//                   <Typography variant="subtitle1" fontWeight={600}>
//                     {job.title}
//                   </Typography>
//                 </Stack>
//                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                   {job.description?.slice(0, 80)}...
//                 </Typography>
//                 <Divider sx={{ my: 1 }} />
//                 <Stack direction="row" justifyContent="space-between" alignItems="center">
//                   <Typography variant="caption" color="text.secondary">
//                     Posted by you
//                   </Typography>
//                   <Box>
//                     <IconButton size="small" onClick={() => setEditingJob(job)}>
//                       <EditIcon fontSize="small" />
//                     </IconButton>
//                     <IconButton size="small" onClick={() => setConfirmDeleteId(job.id)}>
//                       <DeleteIcon fontSize="small" />
//                     </IconButton>
//                   </Box>
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {/* Edit Dialog */}
//       {editingJob && (
//         <Dialog open onClose={() => setEditingJob(null)} fullWidth>
//           <DialogTitle>Edit Job</DialogTitle>
//           <DialogContent>
//             <TextField
//               label="Title"
//               fullWidth
//               sx={{ mt: 2 }}
//               value={editingJob.title}
//               onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
//             />
//             <TextField
//               label="Description"
//               fullWidth
//               multiline
//               minRows={3}
//               sx={{ mt: 2 }}
//               value={editingJob.description}
//               onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setEditingJob(null)}>Cancel</Button>
//             <Button onClick={handleEditSave} variant="contained">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}

//       {/* Delete Confirm Dialog */}
//       {confirmDeleteId !== null && (
//         <Dialog open onClose={() => setConfirmDeleteId(null)}>
//           <DialogTitle>Confirm Delete</DialogTitle>
//           <DialogContent>
//             <Typography>Are you sure you want to delete this job?</Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
//             <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </Box>
//   );
// }

// export default EmployerDashboard;



// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   Grid,
//   Stack,
//   Divider,
//   IconButton
// } from '@mui/material';
// import WorkIcon from '@mui/icons-material/Work';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import api from '../api';

// function EmployerDashboard() {
//   const [form, setForm] = useState({ title: '', description: '' });
//   const [jobs, setJobs] = useState([]);

//   const fetchJobs = async () => {
//     try {
//       const res = await api.get('/jobs/employer');
//       setJobs(res.data);
//     } catch (err) {
//       alert("Failed to fetch your jobs");
//     }
//   };

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post('/jobs/add', form);
//       setForm({ title: '', description: '' });
//       fetchJobs();
//     } catch (err) {
//       alert("Failed to post job");
//     }
//   };

//   return (
//     <Box maxWidth="md" mx="auto" mt={4}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Employer Dashboard
//       </Typography>

//       {/* Post Job Form */}
//       <Card sx={{ mb: 4 }}>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             Post a New Job
//           </Typography>
//           <form onSubmit={handleSubmit}>
//             <Stack spacing={2}>
//               <TextField
//                 label="Job Title"
//                 value={form.title}
//                 onChange={(e) => setForm({ ...form, title: e.target.value })}
//                 required
//               />
//               <TextField
//                 label="Description"
//                 multiline
//                 minRows={3}
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 required
//               />
//               <Button type="submit" variant="contained" color="primary">
//                 Post Job
//               </Button>
//             </Stack>
//           </form>
//         </CardContent>
//       </Card>

//       {/* Posted Jobs */}
//       <Typography variant="h6" gutterBottom>
//         Your Posted Jobs
//       </Typography>
//       <Grid container spacing={3}>
//         {jobs.map((job) => (
//           <Grid item xs={12} sm={6} key={job.id}>
//             <Card variant="outlined">
//               <CardContent>
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                   <WorkIcon color="action" />
//                   <Typography variant="subtitle1" fontWeight={600}>
//                     {job.title}
//                   </Typography>
//                 </Stack>
//                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                   {job.description?.slice(0, 80)}...
//                 </Typography>
//                 <Divider sx={{ my: 1 }} />
//                 <Stack direction="row" justifyContent="space-between" alignItems="center">
//                   <Typography variant="caption" color="text.secondary">
//                     Posted by you
//                   </Typography>
//                   <Box>
//                     <IconButton size="small" aria-label="edit">
//                       <EditIcon fontSize="small" />
//                     </IconButton>
//                     <IconButton size="small" aria-label="delete">
//                       <DeleteIcon fontSize="small" />
//                     </IconButton>
//                   </Box>
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// }

// export default EmployerDashboard;



// blank code

// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   //Stack,
//   Alert
// } from "@mui/material";
// import api from "../api";

// function EmployerDashboard() {
//   const [form, setForm] = useState({ title: "", description: "" });
//   const [jobs, setJobs] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const fetchJobs = async () => {
//     try {
//       const res = await api.get("/jobs/my");
//       setJobs(res.data);
//     } catch (err) {
//       setError("Failed to fetch your jobs.");
//     }
//   };

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     try {
//       await api.post("/jobs/add", form);
//       setForm({ title: "", description: "" });
//       fetchJobs();
//       setSuccess("Job posted successfully.");
//     } catch (err) {
//       setError("Failed to post job.");
//     }
//   };

//   return (
//     <Box maxWidth="md" mx="auto" mt={4} px={2}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Employer Dashboard
//       </Typography>

//       <Card sx={{ p: 3, mb: 4 }}>
//         <CardContent>
//           <Typography variant="h6" fontWeight={600} gutterBottom>
//             Post a Job
//           </Typography>

//           <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             <TextField
//               label="Job Title"
//               fullWidth
//               variant="outlined"
//               value={form.title}
//               onChange={(e) => setForm({ ...form, title: e.target.value })}
//               required
//             />
//             <TextField
//               label="Job Description"
//               fullWidth
//               variant="outlined"
//               multiline
//               rows={4}
//               value={form.description}
//               onChange={(e) => setForm({ ...form, description: e.target.value })}
//               required
//             />
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               sx={{
//                 alignSelf: "flex-start",
//                 fontWeight: 600,
//                 textTransform: "none",
//                 ":hover": { transform: "scale(1.02)" },
//                 transition: "all 0.2s ease-in-out"
//               }}
//             >
//               Post Job
//             </Button>
//           </form>

//           {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
//           {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
//         </CardContent>
//       </Card>

//       <Card sx={{ p: 3 }}>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             Your Posted Jobs
//           </Typography>
//           <List>
//             {jobs.map((job, index) => (
//               <React.Fragment key={job.id}>
//                 <ListItem>
//                   <ListItemText
//                     primary={job.title}
//                     secondary={job.description ? job.description.slice(0, 100) + "..." : ""}
//                   />
//                 </ListItem>
//                 {index < jobs.length - 1 && <Divider />}
//               </React.Fragment>
//             ))}
//           </List>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }

// export default EmployerDashboard;


// working code

// import React, { useState, useEffect } from 'react';
// import api from '../api';

// function EmployerDashboard() {
//   const [form, setForm] = useState({ title: '', description: '' });
//   const [jobs, setJobs] = useState([]);

//   const fetchJobs = async () => {
//     try {
//       const res = await api.get('/jobs/my');
//       setJobs(res.data);
//     } catch (err) {
//       alert("Failed to fetch your jobs");
//     }
//   };

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post('/jobs/add', form);
//       setForm({ title: '', description: '' });
//       fetchJobs();
//     } catch (err) {
//       alert("Failed to post job");
//     }
//   };

//   return (
//     <div>
//       <h2>Post a Job</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Job Title"
//           value={form.title}
//           onChange={e => setForm({ ...form, title: e.target.value })}
//         />
//         <textarea
//           placeholder="Description"
//           value={form.description}
//           onChange={e => setForm({ ...form, description: e.target.value })}
//         ></textarea>
//         <button type="submit">Post</button>
//       </form>

//       <h3>Your Posted Jobs</h3>
//       <ul>
//         {jobs.map(job => <li key={job.id}>{job.title}</li>)}
//       </ul>
//     </div>
//   );
// }

// export default EmployerDashboard;


// import React, { useState } from "react";
// import api from "../api";

// function EmployerDashboard() {
//   const [job, setJob] = useState({ title: "", description: "", skills: "" });
//   const [message, setMessage] = useState("");

//   const handlePostJob = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/jobs/add", job);
//       setMessage("Job posted successfully!");
//       setJob({ title: "", description: "", skills: "" });
//     } catch (err) {
//       setMessage("Failed to post job");
//     }
//   };

//   return (
//     <div>
//       <h2>Post a New Job</h2>
//       <form onSubmit={handlePostJob}>
//         <input type="text" placeholder="Job Title" value={job.title} onChange={e => setJob({ ...job, title: e.target.value })} />
//         <textarea placeholder="Job Description" value={job.description} onChange={e => setJob({ ...job, description: e.target.value })} />
//         <input type="text" placeholder="Skills (comma-separated)" value={job.skills} onChange={e => setJob({ ...job, skills: e.target.value })} />
//         <button type="submit">Post Job</button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   );
// }

// export default EmployerDashboard;


// import React, { useEffect, useState } from 'react';
// import api from '../api';

// function EmployerDashboard() {
//   const [jobs, setJobs] = useState([]);
//   const [form, setForm] = useState({ title: '', description: '' });

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const fetchJobs = async () => {
//     const res = await api.get('/jobs/employer');
//     setJobs(res.data.jobs);
//   };

//   const handlePost = async (e) => {
//     e.preventDefault();
//     await api.post('/jobs/add', form);
//     setForm({ title: '', description: '' });
//     fetchJobs();
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Post a New Job</h2>
//       <form onSubmit={handlePost} className="space-y-2 mb-6">
//         <input type="text" placeholder="Job Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border p-2 w-full" />
//         <textarea placeholder="Job Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border p-2 w-full" />
//         <button type="submit" className="bg-blue-600 text-white p-2">Post Job</button>
//       </form>

//       <h3 className="text-lg font-semibold">Your Jobs</h3>
//       <ul className="space-y-2 mt-2">
//         {jobs.map(job => (
//           <li key={job.id} className="border p-2">
//             <strong>{job.title}</strong>
//             <p>{job.description}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default EmployerDashboard;
