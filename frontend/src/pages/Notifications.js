import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/auth/notifications').then(res => setNotifications(res.data));
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Notifications</Typography>
      <Stack spacing={2}>
        {notifications.map((note, index) => (
          <Card key={index}>
            <CardContent>
              <Typography>{note.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(note.created_at).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Notifications;
