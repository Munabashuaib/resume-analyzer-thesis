import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  Divider,
  Grid,
  Paper
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";

function Dashboard() {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    api.get("/resume/user").then(res => {
      setResumes(res.data.resumes || []);
    });

    api.get("/jobs/applied").then(res => {
      setAppliedJobs(res.data.applications || []);
    });
  }, []);

  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Typography variant="h4" color="primary" gutterBottom>
        Dashboard
      </Typography>

      {/* Resumes Section */}
      <Typography variant="h6" gutterBottom>
        Your Resumes
      </Typography>
      <Stack spacing={2} mb={4}>
        {resumes.map((r) => (
          <Paper
            key={r.id}
            elevation={2}
            sx={{ display: "flex", alignItems: "center", p: 2 }}
          >
            <InsertDriveFileIcon sx={{ mr: 2, color: "gray" }} />
            <Typography>{r.filename}</Typography>
          </Paper>
        ))}
      </Stack>

      {/* Applications Section */}
      <Typography variant="h6" gutterBottom>
        Your Applications
      </Typography>
      <Grid container spacing={3}>
        {appliedJobs.map((app) => (
          <Grid item xs={12} sm={6} key={app.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  <WorkIcon fontSize="small" sx={{ mr: 1 }} />
                  {app.job_title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                  {app.company || "Unknown Company"}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Match Score: {app.match_score}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(app.match_score)}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: "#eee",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: app.match_score > 75 ? "green" : app.match_score > 40 ? "orange" : "red"
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;


// import React, { useEffect, useState } from "react";
// import api from "../api";

// function Dashboard() {
//   const [appliedJobs, setAppliedJobs] = useState([]);
//   const [resumes, setResumes] = useState([]);

//   useEffect(() => {
//     // Fetch latest resumes
//     api.get("/resume/user").then(res => {
//       setResumes(res.data.resumes || []);
//     });

//     // Fetch applications
//     api.get("/jobs/applied").then(res => {
//       setAppliedJobs(res.data.applications || []);
//     });
//   }, []);

//   return (
//     <div>
//       <h2>Your Resumes</h2>
//       <ul>
//         {resumes.map((r) => (
//           <li key={r.id}>{r.filename}</li>
//         ))}
//       </ul>

//       <h2>Your Applications</h2>
//       <ul>
//         {appliedJobs.map((app) => (
//           <li key={app.id}>
//             {app.job_title} @ {app.company} — Match Score: {app.match_score}%
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default Dashboard;
