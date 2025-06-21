import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Typography, Box } from '@mui/material';

const MatchScoreChart = ({ matches }) => {
  const data = matches.map(match => ({
    name: match.job_title.length > 20 ? match.job_title.slice(0, 20) + '...' : match.job_title,
    score: match.match_score,
  }));

  return (
    <Box my={4}>
      <Typography variant="h6" gutterBottom>
        Match Score Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} angle={-15} height={60} />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="score" fill="#4caf50" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MatchScoreChart;
