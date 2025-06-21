import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Card, CardContent, Chip, Stack } from '@mui/material';

const SeekerDashboard = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get('/jobs/applied').then(res => setApplications(res.data.applications));
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>My Applications</Typography>
      <Stack spacing={2}>
        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent>
              <Typography variant="h6">{app.job_title}</Typography>
              <Typography>Company: {app.company}</Typography>
              <Typography color="text.secondary">Match score shown after upload</Typography>
              <Chip label={`Status: ${app.status || "Pending"}`} color={
                app.status === 'Accepted' ? 'success' : app.status === 'Rejected' ? 'error' : 'warning'
              } />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default SeekerDashboard;


