import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [showAppDialog, setShowAppDialog] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    try {
      const usersRes = await api.get('/admin/users');
      const jobsRes = await api.get('/admin/jobs');
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      alert("Failed to load admin data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = (jobId) => setJobToDelete(jobId);

  const handleDelete = async () => {
    try {
      await api.delete(`/jobs/delete/${jobToDelete}`);
      setJobToDelete(null);
      fetchData();
    } catch (err) {
      alert("Failed to delete job.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Admin Panel
      </Typography>

      {/* 🧮 Analytics Cards */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} md={2.4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2">Total Users</Typography>
              <Typography variant="h6">{stats.total_users}</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2">Employers</Typography>
              <Typography variant="h6">{stats.total_employers}</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2">Jobseekers</Typography>
              <Typography variant="h6">{stats.total_seekers}</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2">Jobs Posted</Typography>
              <Typography variant="h6">{stats.total_jobs}</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2">Applications</Typography>
              <Typography variant="h6">{stats.total_applications}</Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 👤 Users Section */}
      <Typography variant="h5" gutterBottom>
        Users
      </Typography>
      <Grid container spacing={2} mb={4}>
        {users.map((u) => (
          <Grid item xs={12} md={6} key={u.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{u.username}</Typography>

                <Typography variant="body2" color="text.secondary">
                  <input
                    type="email"
                    defaultValue={u.email}
                    onChange={(e) =>
                      setUsers((prev) =>
                        prev.map((usr) =>
                          usr.id === u.id ? { ...usr, email: e.target.value } : usr
                        )
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '6px',
                      margin: '6px 0',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                    }}
                  />
                </Typography>

                <Typography variant="body2">
                  Role:
                  <select
                    value={u.role}
                    onChange={(e) =>
                      setUsers((prev) =>
                        prev.map((usr) =>
                          usr.id === u.id ? { ...usr, role: e.target.value } : usr
                        )
                      )
                    }
                    style={{
                      marginLeft: '10px',
                      padding: '4px',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="seeker">Seeker</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                  </select>
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={async () => {
                    try {
                      await api.put(`/admin/users/${u.id}`, {
                        email: u.email,
                        role: u.role,
                      });
                      alert('User updated successfully');
                    } catch (err) {
                      alert('Failed to update user');
                    }
                  }}
                >
                  Save
                </Button>

                <Button
                  size="small"
                  sx={{ mt: 1, ml: 1 }}
                  onClick={async () => {
                    const res = await api.get(`/admin/user-applications/${u.id}`);
                    setUserApplications(res.data);
                    setSelectedUser(u);
                    setShowAppDialog(true);
                  }}
                >
                  View Applications
                </Button>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  Status:{" "}
                  <strong style={{ color: u.is_active ? "green" : "red" }}>
                    {u.is_active ? "Active" : "Banned"}
                  </strong>
                </Typography>

                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  variant="outlined"
                  color={u.is_active ? "error" : "success"}
                  onClick={async () => {
                    try {
                      await api.put(`/admin/users/${u.id}`, {
                        is_active: !u.is_active,
                        email: u.email,
                        role: u.role
                      });
                      setUsers((prev) =>
                        prev.map((usr) =>
                          usr.id === u.id ? { ...usr, is_active: !usr.is_active } : usr
                        )
                      );
                    } catch {
                      alert("Failed to update status");
                    }
                  }}
                >
                  {u.is_active ? "Ban" : "Unban"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 📄 Jobs Section */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h5" gutterBottom>
        Jobs
      </Typography>
      <Grid container spacing={2}>
        {jobs.map((j) => (
          <Grid item xs={12} md={6} key={j.id}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">{j.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {j.description}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => confirmDelete(j.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 🗑️ Delete Confirm Dialog */}
      <Dialog open={!!jobToDelete} onClose={() => setJobToDelete(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this job?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobToDelete(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* 👁️ View Applications Modal */}
      <Dialog open={showAppDialog} onClose={() => setShowAppDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Applications by {selectedUser?.username}</DialogTitle>
        <DialogContent dividers>
          {userApplications.length > 0 ? (
            userApplications.map((app, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{app.job_title}</Typography>
                <Typography variant="body2">Resume: {app.resume_name}</Typography>
                <Typography variant="body2">Score: {app.match_score}%</Typography>
                <Typography variant="body2">Status: {app.status}</Typography>
                <Typography variant="body2">Date: {app.applied_on}</Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
            ))
          ) : (
            <Typography>No applications found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAppDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminPanel;




// import React, { useEffect, useState } from 'react';
// import api from '../api';

// function AdminPanel() {
//   const [users, setUsers] = useState([]);
//   const [jobs, setJobs] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const usersRes = await api.get('/admin/users');
//         const jobsRes = await api.get('/admin/jobs');
//         setUsers(usersRes.data);
//         setJobs(jobsRes.data);
//       } catch (err) {
//         alert("Failed to load admin data.");
//       }
//     };
//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h2>Admin Panel</h2>
//       <h3>Users</h3>
//       <ul>
//         {users.map(u => (
//           <li key={u.id}>{u.username} ({u.email}) - Role: {u.role}</li>
//         ))}
//       </ul>
//       <h3>Jobs</h3>
//       <ul>
//         {jobs.map(j => (
//           <li key={j.id}>{j.title} - {j.description}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default AdminPanel;
