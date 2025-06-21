import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Stack, Divider, Chip,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const MatchResults = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [resumeSummary, setResumeSummary] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("recentMatches");
    const resumeData = localStorage.getItem("resumeParsed");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMatches(parsed);
        }
      } catch (err) {
        console.error("Failed to parse matches:", err);
      }
    }

    if (resumeData) {
      try {
        setResumeSummary(JSON.parse(resumeData));
      } catch (err) {
        console.error("Failed to parse resume summary:", err);
      }
    }

    const fetchAppliedJobs = async () => {
      try {
        const res = await api.get("/jobs/applied");
        const ids = res.data.applications.map(app => app.job_id);
        setAppliedJobs(ids);
      } catch (err) {
        console.error("Failed to fetch applied jobs:", err);
      }
    };

    fetchAppliedJobs();
  }, []);

  useEffect(() => {
    let filtered = [...matches];

    if (filter !== "all") {
      filtered = filtered.filter(m => m.match_score >= parseInt(filter));
    }

    if (sortOrder === "desc") {
      filtered.sort((a, b) => b.match_score - a.match_score);
    } else if (sortOrder === "asc") {
      filtered.sort((a, b) => a.match_score - b.match_score);
    }

    setFilteredMatches(filtered);
  }, [matches, filter, sortOrder]);

  const getScoreColor = (score) => {
    if (score >= 85) return "#4CAF50";  // Green
    if (score >= 60) return "#FFC107";  // Amber
    if (score >= 40) return "#FF9800";  // Orange
    return "#F44336";                   // Red
  };

  const getMatchLabel = (score) => {
    if (score >= 85) return "Top Match";
    if (score >= 60) return "Strong Match";
    if (score >= 40) return "Moderate Match";
    return "Low Match";
  };

  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobs/apply/${jobId}`);
      alert("Successfully applied to the job!");
      setAppliedJobs(prev => [...prev, jobId]);
    } catch (err) {
      console.error("Application failed:", err);
      alert("Failed to apply. Please try again.");
    }
  };

  return (
    <Box maxWidth="md" mx="auto" mt={4} px={2}>
      <Typography variant="h4" color="primary" gutterBottom>
        Matching Jobs
      </Typography>

      {matches.length === 0 ? (
        <Typography>No matches found. Try uploading a resume!</Typography>
      ) : (
        <>
          {/* Resume Summary */}
          {resumeSummary && (
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Resume Summary</Typography>
                <Typography variant="body2"><strong>Skills:</strong></Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                  {resumeSummary.skills.map((skill, i) => (
                    <Chip key={i} label={skill} color="primary" variant="outlined" />
                  ))}
                </Stack>
                <Typography variant="body2"><strong>Domains:</strong></Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Object.keys(resumeSummary.domains).map((domain, i) => (
                    <Chip key={i} label={domain} color="secondary" variant="outlined" />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Minimal Top Match Overview */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Top Match Overview
          </Typography>

          <Box sx={{ overflowX: "auto", pb: 2, mb: 4 }}>
            <Stack direction="row" spacing={2}>
              {filteredMatches.slice(0, 5).map((match) => (
                <Card
                  key={match.job_id}
                  sx={{
                    minWidth: 240,
                    borderLeft: `6px solid`,
                    borderColor: getScoreColor(match.match_score),
                    boxShadow: 2,
                    flexShrink: 0,
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {match.job_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {match.company_name || 'Private Company'}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Chip
                      label={`${getMatchLabel(match.match_score)} (${match.match_score.toFixed(2)}%)`}
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: getScoreColor(match.match_score),
                        color: '#fff'
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Filters */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="70">≥ 70%</MenuItem>
                <MenuItem value="50">≥ 50%</MenuItem>
                <MenuItem value="30">≥ 30%</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sortOrder}
                label="Sort"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="desc">Score: High → Low</MenuItem>
                <MenuItem value="asc">Score: Low → High</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Detailed Match Cards */}
          <Stack spacing={3}>
            {filteredMatches.map((match) => {
              const alreadyApplied = appliedJobs.includes(match.job_id);

              return (
                <Card key={match.job_id} sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600}>
                      {match.job_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Company: {match.company_name || 'Unknown'}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Chip
                      label={`${getMatchLabel(match.match_score)} (${match.match_score.toFixed(2)}%)`}
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        backgroundColor: getScoreColor(match.match_score),
                        color: '#fff'
                      }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Scores are based on resume-job similarity.
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Matched Skills:</strong> {match.matched_skills?.join(', ') || 'None'}
                    </Typography>

                    {alreadyApplied ? (
                      <Chip label="Applied" color="default" sx={{ mt: 2 }} />
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => handleApply(match.job_id)}
                      >
                        Apply Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </>
      )}

      <Button
        onClick={() => navigate("/upload")}
        variant="contained"
        sx={{ mt: 4 }}
      >
        Upload Another Resume
      </Button>
    </Box>
  );
};

export default MatchResults;





// import React, { useEffect, useState } from 'react';
// import {
//   Box, Typography, Card, CardContent, Button, Stack, Divider, Chip,
//   FormControl, InputLabel, Select, MenuItem
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import MatchScoreChart from './MatchScoreChart';

// const MatchResults = () => {
//   const [matches, setMatches] = useState([]);
//   const [filteredMatches, setFilteredMatches] = useState([]);
//   const [resumeSummary, setResumeSummary] = useState(null);
//   const [filter, setFilter] = useState("all");
//   const [sortOrder, setSortOrder] = useState("desc");

//   const navigate = useNavigate();

//   const handleApply = async (jobId) => {
//   try {
//     const res = await api.post(`/jobs/apply`, { job_id: jobId });
//     alert("Successfully applied to the job!");
//   } catch (err) {
//     console.error("Application failed:", err);
//     alert("Failed to apply. Please try again.");
//   }
// };


//   useEffect(() => {
//     const saved = localStorage.getItem("recentMatches");
//     const resumeData = localStorage.getItem("resumeParsed");

//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         if (Array.isArray(parsed)) {
//           setMatches(parsed);
//         }
//       } catch (err) {
//         console.error("Failed to parse matches:", err);
//       }
//     }

//     if (resumeData) {
//       try {
//         setResumeSummary(JSON.parse(resumeData));
//       } catch (err) {
//         console.error("Failed to parse resume summary:", err);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     let filtered = [...matches];

//     if (filter !== "all") {
//       filtered = filtered.filter(m => m.match_score >= parseInt(filter));
//     }

//     if (sortOrder === "desc") {
//       filtered.sort((a, b) => b.match_score - a.match_score);
//     } else if (sortOrder === "asc") {
//       filtered.sort((a, b) => a.match_score - b.match_score);
//     }

//     setFilteredMatches(filtered);
//   }, [matches, filter, sortOrder]);

//   const getScoreColor = (score) => {
//     if (score >= 70) return 'success';
//     if (score >= 40) return 'warning';
//     return 'error';
//   };

//   return (
//     <Box maxWidth="md" mx="auto" mt={4} px={2}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Matching Jobs
//       </Typography>
//       <Typography variant="body2" color="error">
//         Debug: {JSON.stringify(matches)}
//       </Typography>

//       {matches.length === 0 ? (
//         <Typography>No matches found. Try uploading a resume!</Typography>
//       ) : (
//         <>
//           {/* ✅ Resume Summary */}
//           {resumeSummary && (
//             <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>Resume Summary</Typography>
//                 <Typography variant="body2"><strong>Skills:</strong></Typography>
//                 <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
//                   {resumeSummary.skills.map((skill, i) => (
//                     <Chip key={i} label={skill} color="primary" variant="outlined" />
//                   ))}
//                 </Stack>
//                 <Typography variant="body2"><strong>Domains:</strong></Typography>
//                 <Stack direction="row" spacing={1} flexWrap="wrap">
//                   {Object.keys(resumeSummary.domains).map((domain, i) => (
//                     <Chip key={i} label={domain} color="secondary" variant="outlined" />
//                   ))}
//                 </Stack>
//               </CardContent>
//             </Card>
//           )}

//           {/* ✅ Match Score Chart */}
//           <MatchScoreChart matches={matches} />

//           {/* 🟨 Filtering and Sorting Controls */}
//           <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//             <FormControl sx={{ minWidth: 120 }}>
//               <InputLabel>Filter</InputLabel>
//               <Select
//                 value={filter}
//                 label="Filter"
//                 onChange={(e) => setFilter(e.target.value)}
//               >
//                 <MenuItem value="all">All</MenuItem>
//                 <MenuItem value="70">≥ 70%</MenuItem>
//                 <MenuItem value="50">≥ 50%</MenuItem>
//                 <MenuItem value="30">≥ 30%</MenuItem>
//               </Select>
//             </FormControl>

//             <FormControl sx={{ minWidth: 160 }}>
//               <InputLabel>Sort</InputLabel>
//               <Select
//                 value={sortOrder}
//                 label="Sort"
//                 onChange={(e) => setSortOrder(e.target.value)}
//               >
//                 <MenuItem value="desc">Score: High → Low</MenuItem>
//                 <MenuItem value="asc">Score: Low → High</MenuItem>
//               </Select>
//             </FormControl>
//           </Stack>

//           {/* ✅ Filtered Job Cards */}
//           <Stack spacing={3}>
//             {filteredMatches.map((match) => (
//               <Card key={match.job_id} sx={{ borderRadius: 3, boxShadow: 3 }}>
//                 <CardContent>
//                   <Typography variant="h6" fontWeight={600}>
//                     {match.job_title}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" mb={1}>
//                     Company: {match.company_name || 'Unknown'}
//                   </Typography>
//                   <Divider sx={{ mb: 1 }} />
//                   <Chip
//                     label={`Match Score: ${match.match_score}%`}
//                     color={getScoreColor(match.match_score)}
//                     sx={{ fontWeight: 600, mb: 1 }}
//                   />
//                   <Typography variant="body2">
//                     <strong>Matched Skills:</strong> {match.matched_skills?.join(', ') || 'None'}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             ))}
//           </Stack>
//         </>
//       )}

//       <Button
//         onClick={() => navigate("/upload")}
//         variant="contained"
//         sx={{ mt: 4 }}
//       >
//         Upload Another Resume
//       </Button>
//     </Box>
//   );
// };

// export default MatchResults;









// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   Stack,
//   Divider,
//   Chip,
//   Alert
// } from '@mui/material';
// import api from '../api';

// const MatchResults = () => {
//   const [matches, setMatches] = useState([]);
//   const [rawResponse, setRawResponse] = useState(null);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchMatches = async () => {
//       try {
//         const res = await api.get("/resume/matches");
//         console.log("🎯 res.data:", JSON.stringify(res.data, null, 2));
//         console.log("🎯 res.data.matches:", res.data.matches);

//         setRawResponse(res.data.matches || []);
//         setMatches(res.data.matches || []);
//       } catch (err) {
//         console.error("❌ Failed to fetch matches:", err);
//         setError("Unable to load matching results.");
//         if (err.response?.status === 401) {
//           localStorage.clear();
//           window.location.href = "/login";
//         }
//       }
//     };

//     fetchMatches();
//   }, []);

//   const getScoreColor = (score) => {
//     if (score >= 70) return 'success';
//     if (score >= 40) return 'warning';
//     return 'error';
//   };

//   const getDomainColor = (domain) => {
//     const colorMap = {
//       nursing: 'success',
//       healthcare: 'info',
//       technology: 'primary',
//       administration: 'secondary',
//       management: 'warning',
//       education: 'default',
//       other: 'default'
//     };
//     return colorMap[domain.toLowerCase()] || 'default';
//   };

//   return (
//     <Box maxWidth="md" mx="auto" mt={4} px={2}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Matching Jobs
//       </Typography>
//       <Typography variant="body1" color="error">
//         ✅ Debugging Enabled
//       </Typography>

//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//       {matches.length === 0 && rawResponse && (
//         <Box my={2} sx={{ backgroundColor: '#f0f0f0', p: 2, borderRadius: 2 }}>
//           <Typography variant="subtitle2">🔍 Raw Backend Matches:</Typography>
//           <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
//             {JSON.stringify(rawResponse, null, 2)}
//           </pre>
//         </Box>
//       )}

//       {matches.length === 0 ? (
//         <Typography>No matches found. Try uploading a resume!</Typography>
//       ) : (
//         <Stack spacing={3}>
//           {matches.map((match) => (
//             <Card key={match.job_id} sx={{ borderRadius: 3, boxShadow: 3 }}>
//               <CardContent>
//                 <Typography variant="h6" fontWeight={600}>
//                   {match.job_title}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" mb={1}>
//                   Company: {match.company_name || 'Unknown'}
//                 </Typography>
//                 <Divider sx={{ mb: 1 }} />
//                 <Stack direction="row" alignItems="center" spacing={2}>
//                   <Chip
//                     label={`Match Score: ${match.match_score}%`}
//                     color={getScoreColor(match.match_score)}
//                     sx={{ fontWeight: 600 }}
//                   />
//                   {match.match_score >= 70 && (
//                     <Chip
//                       label="Highly Recommended"
//                       color="success"
//                       variant="outlined"
//                       size="small"
//                     />
//                   )}
//                 </Stack>

//                 <Typography variant="body2" mt={1}>
//                   <strong>Matched Skills:</strong>{' '}
//                   {match.matched_skills?.length > 0
//                     ? match.matched_skills.join(', ')
//                     : 'No matched skills'}
//                 </Typography>

//                 {match.matched_domains && Object.keys(match.matched_domains).length > 0 && (
//                   <Box mt={1}>
//                     <strong>Skill Domains:</strong>{' '}
//                     <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
//                       {Object.entries(match.matched_domains).map(([domain, count]) => (
//                         <Chip
//                           key={domain}
//                           label={`${domain} (${count})`}
//                           color={getDomainColor(domain)}
//                           variant="outlined"
//                           size="small"
//                         />
//                       ))}
//                     </Stack>
//                   </Box>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </Stack>
//       )}

//       <Button
//         onClick={() => navigate('/upload')}
//         variant="contained"
//         color="primary"
//         sx={{ mt: 4, fontWeight: 600, textTransform: 'none' }}
//       >
//         Upload Another Resume
//       </Button>
//     </Box>
//   );
// };

// export default MatchResults;





// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   Stack,
//   Divider,
//   Chip
// } from '@mui/material';
// import api from "../api";

// const MatchResults = () => {
//   const [matches, setMatches] = useState([]);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchMatches = async () => {
//       try {
//         const res = await api.get("/resume/matches");
//         setMatches(res.data.matches || []);
//       } catch (err) {
//         setError("❌ Failed to load matches.");
//       }
//     };

//     fetchMatches();
//   }, []);

//   const getScoreColor = (score) => {
//     if (score >= 70) return 'success';
//     if (score >= 40) return 'warning';
//     return 'error';
//   };

//   const getDomainColor = (domain) => {
//     const colorMap = {
//       nursing: 'success',
//       healthcare: 'info',
//       technology: 'primary',
//       administration: 'secondary',
//       management: 'warning',
//       education: 'default',
//       other: 'default'
//     };
//     return colorMap[domain.toLowerCase()] || 'default';
//   };

//   return (
//     <Box maxWidth="md" mx="auto" mt={4} px={2}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Matching Jobs
//       </Typography>
//       <Typography variant="body1" color="error">
//         ✅ Top 3 Filter Active
//       </Typography>

//       {error && <Typography color="error">{error}</Typography>}

//       {matches.length === 0 ? (
//         <Typography>No matches found. Try uploading a resume!</Typography>
//       ) : (
//         <Stack spacing={3}>
//           {matches.slice(0, 3).map((match) => (
//             <Card key={match.job_id} sx={{ borderRadius: 3, boxShadow: 3 }}>
//               <CardContent>
//                 <Typography variant="h6" fontWeight={600}>
//                   {match.job_title}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" mb={1}>
//                   Company: {match.company_name || 'Unknown'}
//                 </Typography>
//                 <Divider sx={{ mb: 1 }} />
//                 <Stack direction="row" alignItems="center" spacing={2}>
//                   <Chip
//                     label={`Match Score: ${match.match_score}%`}
//                     color={getScoreColor(match.match_score)}
//                     sx={{ fontWeight: 600 }}
//                   />
//                   {match.match_score >= 70 && (
//                     <Chip
//                       label="Highly Recommended"
//                       color="success"
//                       variant="outlined"
//                       size="small"
//                     />
//                   )}
//                 </Stack>

//                 <Typography variant="body2" mt={1}>
//                   <strong>Matched Skills:</strong>{' '}
//                   {match.matched_skills?.length > 0
//                     ? match.matched_skills.join(', ')
//                     : 'No matched skills'}
//                 </Typography>

//                 {match.matched_domains && Object.keys(match.matched_domains).length > 0 && (
//                   <Box mt={1}>
//                     <strong>Skill Domains:</strong>{' '}
//                     <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
//                       {Object.entries(match.matched_domains).map(([domain, count]) => (
//                         <Chip
//                           key={domain}
//                           label={`${domain} (${count})`}
//                           color={getDomainColor(domain)}
//                           variant="outlined"
//                           size="small"
//                         />
//                       ))}
//                     </Stack>
//                   </Box>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </Stack>
//       )}

//       <Button
//         onClick={() => navigate('/upload')}
//         variant="contained"
//         color="primary"
//         sx={{ mt: 4, fontWeight: 600, textTransform: 'none' }}
//       >
//         Upload Another Resume
//       </Button>
//     </Box>
//   );
// };

// export default MatchResults;






// import React, { useEffect, useState } from 'react';
// import { fetchMatches } from '../api';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   Stack,
//   Divider,
//   Chip
// } from '@mui/material';

// const MatchResults = () => {
//   const [matches, setMatches] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const getMatches = async () => {
//       try {
//         const response = await fetchMatches();
//         console.log("Fetched Match Results:", response); // Optional console
//         setMatches(response.matches || []);
//       } catch (error) {
//         console.error('Error fetching match results:', error);
//       }
//     };
//     getMatches();
//   }, []);

//   const getScoreColor = (score) => {
//     if (score >= 70) return 'success';
//     if (score >= 40) return 'warning';
//     return 'error';
//   };

//   return (
//     <Box maxWidth="md" mx="auto" mt={4} px={2}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Matching Jobs
//       </Typography>

//       {/* 🔍 Debug section to show raw data */}
//       {matches.length > 0 && (
//         <Box
//           sx={{
//             background: '#f5f5f5',
//             borderRadius: 2,
//             padding: 2,
//             mb: 4,
//             fontSize: '0.8rem',
//             fontFamily: 'monospace',
//             whiteSpace: 'pre-wrap',
//             wordBreak: 'break-word',
//           }}
//         >
//           <strong>Raw Match Data (Debug):</strong>
//           <br />
//           {JSON.stringify(matches, null, 2)}
//         </Box>
//       )}

//       {matches.length === 0 ? (
//         <Typography>No matches found. Try uploading a resume!</Typography>
//       ) : (
//         <Stack spacing={3}>
//           {matches.map((match) => (
//             <Card key={match.job_id} sx={{ borderRadius: 3, boxShadow: 3 }}>
//               <CardContent>
//                 <Typography variant="h6" fontWeight={600}>
//                   {match.job_title}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" mb={1}>
//                   Company: {match.company_name || 'Unknown'}
//                 </Typography>
//                 <Divider sx={{ mb: 1 }} />
//                 <Stack direction="row" alignItems="center" spacing={2}>
//                   <Chip
//                     label={`Match Score: ${match.match_score}%`}
//                     color={getScoreColor(match.match_score)}
//                     sx={{ fontWeight: 600 }}
//                   />
//                   {match.match_score >= 70 && (
//                     <Chip
//                       label="Highly Recommended"
//                       color="success"
//                       variant="outlined"
//                       size="small"
//                     />
//                   )}
//                 </Stack>

//                 <Typography variant="body2" mt={1}>
//                   <strong>Matched Skills:</strong>{' '}
//                   {match.matched_skills?.length > 0
//                     ? match.matched_skills.join(', ')
//                     : 'No matched skills'}
//                 </Typography>
                 
//               </CardContent>
//             </Card>
//           ))}
//         </Stack>
//       )}

//       <Button
//         onClick={() => navigate('/')}
//         variant="contained"
//         color="primary"
//         sx={{ mt: 4, fontWeight: 600, textTransform: 'none' }}
//       >
//         Back to Home
//       </Button>
//     </Box>
//   );
// };

// export default MatchResults;



// import React, { useEffect, useState } from 'react';
// import { fetchMatches } from '../api';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   Stack,
//   Divider,
//   Chip
// } from '@mui/material';

// const MatchResults = () => {
//   const [matches, setMatches] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const getMatches = async () => {
//       try {
//         const response = await fetchMatches();
//         setMatches(response.matches || []);
//       } catch (error) {
//         console.error('Error fetching match results:', error);
//       }
//     };
//     getMatches();
//   }, []);

//   const getScoreColor = (score) => {
//     if (score >= 70) return 'success';
//     if (score >= 40) return 'warning';
//     return 'error';
//   };

//   return (
//     <Box maxWidth="md" mx="auto" mt={4} px={2}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Matching Jobs
//       </Typography>

//       {matches.length === 0 ? (
//         <Typography>No matches found. Try uploading a resume!</Typography>
//       ) : (
//         <Stack spacing={3}>
//           {matches.map((match) => (
//             <Card key={match.job_id} sx={{ borderRadius: 3, boxShadow: 3 }}>
//               <CardContent>
//                 <Typography variant="h6" fontWeight={600}>
//                   {match.job_title}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" mb={1}>
//                   Company: {match.company_name || 'Unknown'}
//                 </Typography>
//                 <Divider sx={{ mb: 1 }} />
//                 <Stack direction="row" alignItems="center" spacing={2}>
//                   <Chip
//                     label={`Match Score: ${match.match_score}%`}
//                     color={getScoreColor(match.match_score)}
//                     sx={{ fontWeight: 600 }}
//                   />
//                   {match.match_score >= 70 && (
//                     <Chip
//                       label="Highly Recommended"
//                       color="success"
//                       variant="outlined"
//                       size="small"
//                     />
//                   )}
//                 </Stack>

//                 {match.matched_skills?.length > 0 && (
//                   <Typography variant="body2" mt={1}>
//                     <strong>Matched Skills:</strong> {match.matched_skills.join(', ')}
//                   </Typography>
//                 )}

//                 {match.resume_experience && (
//                   <Typography variant="body2" mt={0.5}>
//                     <strong>Experience:</strong> {match.resume_experience}
//                   </Typography>
//                 )}

//                 {match.resume_education?.length > 0 && (
//                   <Typography variant="body2" mt={0.5}>
//                     <strong>Education:</strong> {match.resume_education.join(', ')}
//                   </Typography>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </Stack>
//       )}

//       <Button
//         onClick={() => navigate('/')}
//         variant="contained"
//         color="primary"
//         sx={{ mt: 4, fontWeight: 600, textTransform: 'none' }}
//       >
//         Back to Home
//       </Button>
//     </Box>
//   );
// };

// export default MatchResults;





// import React, { useEffect, useState } from 'react';
// import { fetchMatches } from '../api';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   Stack,
//   Divider
// } from '@mui/material';

// const MatchResults = () => {
//   const [matches, setMatches] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const getMatches = async () => {
//       try {
//         const response = await fetchMatches();
//         setMatches(response.matches || []);
//       } catch (error) {
//         console.error('Error fetching match results:', error);
//       }
//     };
//     getMatches();
//   }, []);

//   return (
//     <Box maxWidth="md" mx="auto" mt={4} px={2}>
//       <Typography variant="h4" color="primary" gutterBottom>
//         Matching Jobs
//       </Typography>

//       {matches.length === 0 ? (
//         <Typography>No matches found. Try uploading a resume!</Typography>
//       ) : (
//         <Stack spacing={3}>
//           {matches.map((match) => (
//             <Card key={match.job_id} sx={{ borderRadius: 2 }}>
//               <CardContent>
//                 <Typography variant="h6" fontWeight={600}>
//                   {match.job_title}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Company: {match.company_name || 'Unknown'}
//                 </Typography>
//                 <Divider sx={{ my: 1 }} />
//                 <Typography variant="body1" color="success.main" fontWeight={600}>
//                   Match Score: {match.match_score}%
//                 </Typography>
//               </CardContent>
//             </Card>
//           ))}
//         </Stack>
//       )}

//       <Button
//         onClick={() => navigate('/')}
//         variant="contained"
//         color="primary"
//         sx={{ mt: 4, fontWeight: 600, textTransform: 'none' }}
//       >
//         Back to Home
//       </Button>
//     </Box>
//   );
// };

// export default MatchResults;


// working code

// import React, { useEffect, useState } from 'react';
// import { fetchMatches } from '../api'; // we will use a small function to fetch match results
// import { useNavigate } from 'react-router-dom';

// const MatchResults = () => {
//   const [matches, setMatches] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const getMatches = async () => {
//       try {
//         const response = await fetchMatches();
//         setMatches(response.matches || []);
//       } catch (error) {
//         console.error('Error fetching match results:', error);
//       }
//     };

//     getMatches();
//   }, []);

//   const handleBack = () => {
//     navigate('/');
//   };

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Matching Jobs</h1>
//       {matches.length === 0 ? (
//         <p>No matches found. Try uploading a resume!</p>
//       ) : (
//         <div className="space-y-4">
//           {matches.map((match) => (
//             <div key={match.job_id} className="border rounded p-4 shadow">
//               <h2 className="text-xl font-semibold">{match.job_title}</h2>
//               <p className="text-gray-600">Company: {match.company_name}</p>
//               <p className="text-green-700 font-bold">Match Score: {match.match_score}%</p>
//             </div>
//           ))}
//         </div>
//       )}
//       <button
//         onClick={handleBack}
//         className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//       >
//         Back to Home
//       </button>
//     </div>
//   );
// };

// export default MatchResults;




// import React from 'react';

// const MatchResults = ({ matches }) => {
//   return (
//     <div>
//       <h3>Matching Jobs</h3>
//       <ul>
//         {matches.map((match) => (
//           <li key={match.job_id}>
//             <strong>{match.title}</strong> at <em>{match.company}</em> — Score: <b>{match.match_score}%</b>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MatchResults;


//working copy//

// import React from 'react';

// const MatchResults = ({ matches }) => {
//   return (
//     <div>
//       <h3>Matching Jobs</h3>
//       <ul>
//         {matches.map((match) => (
//           <li key={match.job_id}>
//             <strong>{match.title}</strong> at <em>{match.company}</em> — Score: <b>{match.match_score}%</b>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MatchResults;
