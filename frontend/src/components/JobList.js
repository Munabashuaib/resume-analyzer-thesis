import React, { useEffect, useState } from "react"; 
import api from "../api";
import {
  Box, Typography, Card, CardContent, Button, Chip, Stack, Divider,
  FormControl, InputLabel, Select, MenuItem, CircularProgress
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [domains, setDomains] = useState([]);
  const [domainFilter, setDomainFilter] = useState("All Domains");
  const [jobSourceFilter, setJobSourceFilter] = useState("all");
  const [matchResults, setMatchResults] = useState({});
  const [loading, setLoading] = useState(true);

  const [appliedJobId, setAppliedJobId] = useState(null);
  const [appliedMatchScore, setAppliedMatchScore] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const jobRes = await api.get("/jobs/list");
      const domainRes = await api.get("/jobs/domains");

      setJobs(jobRes.data);
      setDomains(domainRes.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/jobs/list", {
      params: {
        source: jobSourceFilter,
        domain: domainFilter,
      },
    })
      .then(res => {
        setJobs(res.data);
        setFilteredJobs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobSourceFilter, domainFilter]);

  const applyToJob = async (jobId) => {
    try {
      const res = await api.post(`/jobs/apply/${jobId}`);
      setAppliedJobId(jobId);
      setAppliedMatchScore(res.data.match_score);
    } catch {
      setAppliedJobId(jobId);
      setAppliedMatchScore(null);
    }
  };

  const checkMatch = async (jobId) => {
    try {
      const res = await api.get(`/jobs/check-match/${jobId}`);
      setMatchResults(prev => ({
        ...prev,
        [jobId]: res.data
      }));
    } catch {
      console.error("Failed to check match.");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Typography variant="h4" color="primary" gutterBottom>
        Available Jobs
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Domain</InputLabel>
          <Select
            value={domainFilter}
            label="Filter by Domain"
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <MenuItem value="All Domains">All Domains</MenuItem>
            {domains.map((domain, i) => (
              <MenuItem key={i} value={domain}>{domain}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Source</InputLabel>
          <Select
            value={jobSourceFilter}
            label="Filter by Source"
            onChange={(e) => setJobSourceFilter(e.target.value)}
          >
            <MenuItem value="all">All Jobs</MenuItem>
            <MenuItem value="employer">Employer Only</MenuItem>
            <MenuItem value="dataset">Dataset Only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Stack spacing={3}>
        {filteredJobs.map((job) => {
          const match = matchResults[job.id];
          return (
            <Card key={`${job.source}-${job.id}`} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  <WorkIcon fontSize="small" sx={{ mr: 1 }} />
                  {job.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                  {job.company || "Unknown Company"}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                  {job.description}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip label={job.domain || "unspecified"} size="small" />
                  <Chip label="Full-Time" color="primary" size="small" />
                  <Chip label="Remote" color="success" size="small" />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => applyToJob(job.id)}
                    sx={{ fontWeight: 600, textTransform: "none" }}
                  >
                    Apply
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => checkMatch(job.id)}
                    sx={{ textTransform: "none" }}
                  >
                    Check Match
                  </Button>
                </Stack>

                {appliedJobId === job.id && (
                  <Typography color="success.main" sx={{ mt: 1 }}>
                    Applied successfully! 
                  </Typography>
                )}

                {match && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Matched Skills:{" "}
                      {match.matched_skills.length > 0
                        ? match.matched_skills.join(", ")
                        : "None"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Matched Domains:{" "}
                      {Object.keys(match.matched_domains || {}).length > 0
                        ? Object.keys(match.matched_domains).join(", ")
                        : "None"}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}

export default JobList;




// blank version
// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   Divider,
//   Alert,
//   Stack
// } from "@mui/material";
// import api from "../api";

// function JobList() {
//   const [jobs, setJobs] = useState([]);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     api.get("/jobs/list").then((res) => setJobs(res.data));
//   }, []);

//   const applyToJob = async (jobId) => {
//     try {
//       const res = await api.post(`/jobs/apply/${jobId}`);
//       setMessage(`✅ Applied successfully! Match score: ${res.data.match_score}%`);
//     } catch (err) {
//       setMessage("❌ Application failed. Try again.");
//     }
//   };

//   return (
//     <Box maxWidth="md" mx="auto" mt={4} px={2}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Available Jobs
//       </Typography>

//       {message && (
//         <Alert severity={message.includes("successfully") ? "success" : "error"} sx={{ mb: 2 }}>
//           {message}
//         </Alert>
//       )}

//       <Stack spacing={3}>
//         {jobs.map((job) => (
//           <Card key={job.id} variant="outlined" sx={{ borderRadius: 2 }}>
//             <CardContent>
//               <Typography variant="h6" fontWeight={600}>
//                 {job.title}
//               </Typography>
//               <Typography variant="subtitle1" color="text.secondary">
//                 {job.company}
//               </Typography>
//               <Divider sx={{ my: 1 }} />
//               <Typography variant="body2" sx={{ mb: 2 }}>
//                 {job.description}
//               </Typography>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={() => applyToJob(job.id)}
//                 sx={{
//                   fontWeight: 600,
//                   textTransform: "none",
//                   ":hover": { transform: "scale(1.02)" },
//                   transition: "all 0.2s ease-in-out"
//                 }}
//               >
//                 Apply
//               </Button>
//             </CardContent>
//           </Card>
//         ))}
//       </Stack>
//     </Box>
//   );
// }

// export default JobList;


// working code

// import React, { useEffect, useState } from "react";
// import api from "../api";

// function JobList() {
//   const [jobs, setJobs] = useState([]);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     api.get("/jobs/list").then((res) => setJobs(res.data));
//   }, []);

//   const applyToJob = async (jobId) => {
//     try {
//       const res = await api.post(`/jobs/apply/${jobId}`);
//       setMessage(`Applied successfully! Match score: ${res.data.match_score}%`);
//     } catch (err) {
//       setMessage("Application failed.");
//     }
//   };

//   return (
//     <div>
//       <h3>Available Jobs</h3>
//       {message && <p>{message}</p>}
//       <ul>
//         {jobs.map((job) => (
//           <li key={job.id}>
//             <strong>{job.title}</strong> - {job.company}<br />
//             <em>{job.description}</em><br />
//             <button onClick={() => applyToJob(job.id)}>Apply</button>
//             <hr />
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default JobList;




// import React, { useEffect, useState } from 'react';

// const JobList = () => {
//   const [jobs, setJobs] = useState([]);

//   useEffect(() => {
//     fetch('/get_jobs')
//       .then(res => res.json())
//       .then(data => setJobs(data.jobs));
//   }, []);

//   return (
//     <div>
//       <h2>Job List</h2>
//       <ul>
//         {jobs.map(job => (
//           <li key={job.id}>
//             <strong>{job.title}</strong>: {job.description}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default JobList;



//working copy//

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const JobList = () => {
//   const [jobs, setJobs] = useState([]);

//   useEffect(() => {
//     axios.get('http://localhost:5000/get_jobs')
//       .then(res => setJobs(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   return (
//     <div>
//       <h2>Job Postings</h2>
//       <ul>
//         {jobs.map(job => (
//           <li key={job.id}>
//             <strong>{job.title}</strong> at <em>{job.company}</em>
//             <p>{job.description}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default JobList;
