import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Avatar,
  Divider,
  Button,
  TextField
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import ArticleIcon from '@mui/icons-material/Article';
import SendIcon from '@mui/icons-material/Send';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import api from '../api';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });

  useEffect(() => {
    api.get('/auth/profile')
      .then(res => {
        setProfile(res.data);
        setFormData({ username: res.data.username, email: res.data.email });
      })
      .catch(console.error);
  }, []);

  if (!profile) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  const joinDate = "January 2024"; // Placeholder unless you expose created_at

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', formData);
      setProfile(prev => ({ ...prev, ...formData }));
      setEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  return (
    <Box
      minHeight="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
    >
      <Card sx={{ width: "100%", maxWidth: 500, borderRadius: 4, boxShadow: 5 }}>
        <Box
          sx={{
            backgroundColor: "primary.main",
            height: 100,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }}
        />

        <CardContent sx={{ mt: -6 }}>
          <Stack spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.dark",
                border: "3px solid white"
              }}
            >
              {profile.username?.charAt(0).toUpperCase()}
            </Avatar>

            <Typography variant="h5" fontWeight={600}>
              User Profile
            </Typography>

            <Divider flexItem />

            <Box textAlign="left" width="100%">
              {editing ? (
                <>
                  <TextField
                    label="Username"
                    fullWidth
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                </>
              ) : (
                <>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <PersonIcon fontSize="small" />
                    <Typography><strong>Username:</strong> {profile.username}</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <EmailIcon fontSize="small" />
                    <Typography><strong>Email:</strong> {profile.email}</Typography>
                  </Stack>
                </>
              )}

              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <WorkIcon fontSize="small" />
                <Typography><strong>Role:</strong> {profile.role}</Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <ArticleIcon fontSize="small" />
                <Typography><strong>Uploaded Resumes:</strong> {profile.resume_count}</Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <SendIcon fontSize="small" />
                <Typography><strong>Applications Submitted:</strong> {profile.application_count}</Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <CalendarMonthIcon fontSize="small" />
                <Typography><strong>Member Since:</strong> {joinDate}</Typography>
              </Stack>

              {profile.last_application && (
                <Typography sx={{ mt: 1 }}>
                  <strong>Last Application:</strong> {profile.last_application.title} at {profile.last_application.company} ({profile.last_application.date})
                </Typography>
              )}

              {profile.resumes?.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle1" fontWeight={600}>Recent Resumes</Typography>
                  {profile.resumes.slice(0, 5).map((res, i) => (
                    <Typography key={i} fontSize="0.9rem">📄 {res.filename} — {res.created_at}</Typography>
                  ))}
                </Box>
              )}
            </Box>

            {editing ? (
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={handleSave}>Save</Button>
                <Button onClick={() => setEditing(false)}>Cancel</Button>
              </Stack>
            ) : (
              <Button variant="outlined" onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfile;
