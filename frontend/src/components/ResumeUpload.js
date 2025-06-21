import React, { useState } from 'react';
import {
  Box, Typography, Button, Alert, Stack, //CircularProgress,
  Card, CardContent, Chip, LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import api from '../api';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeSummary, setResumeSummary] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a resume file.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await api.post("/resume/upload", formData);
      //const res = await api.post("/resume/upload?use_embeddings=true", formData);
      const matches = res.data?.matches || [];
      const summary = res.data?.resume_summary || null;

      localStorage.setItem("recentMatches", JSON.stringify(matches));
      if (summary) {
        localStorage.setItem("resumeParsed", JSON.stringify(summary));
        setResumeSummary(summary);
      }

      setMessage(`Applied successfully! Match score: ${matches[0]?.match_score.toFixed(2)}%`);

      setTimeout(() => navigate("/results"), 1500);

    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("Failed to upload resume. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="sm" mx="auto" mt={6} px={3}>
      <Typography variant="h4" fontWeight={600} gutterBottom align="center">
        Upload Resume
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom align="center">
        Upload your resume in PDF or DOCX format to get matched with the best jobs.
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mb: 2, textAlign: 'center' }}>
          {message}
        </Alert>
      )}

      <Stack spacing={2} alignItems="center" textAlign="center">
        {/* Custom Upload Button */}
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileIcon />}
        >
          Choose File
          <input
            type="file"
            hidden
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
        </Button>

        {/* Selected Filename Preview */}
        {file && (
          <Typography variant="body2" color="text.secondary">
            Selected: {file.name}
          </Typography>
        )}

        {/* Upload Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading}
          sx={{ minWidth: '200px' }}
        >
          {loading ? "Uploading..." : "Upload and Match"}
        </Button>

        {/* Progress Indicator */}
        {loading && <LinearProgress sx={{ width: '100%', mt: 2 }} />}
      </Stack>

      {/* Resume Summary Display */}
      {resumeSummary && (
        <Card sx={{ mt: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resume Summary
            </Typography>
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
    </Box>
  );
};

export default ResumeUpload;






// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Box,
//   Button,
//   Typography,
//   Card,
//   CardContent,
//   Alert
// } from "@mui/material";
// import api from "../api";

// function ResumeUpload() {
//   const [file, setFile] = useState(null);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (!file) {
//       setError("Please select a resume file.");
//       return;
//     }
//     const formData = new FormData();
//     formData.append("resume", file);
//     try {
//       await api.post("/resume/upload", formData);
//       setError("");
//       navigate("/results"); // ✅ No in-memory state
//     } catch (err) {
//       if (err.response?.status === 401) {
//         localStorage.clear();
//         window.location.href = "/login";
//       } else {
//         setError("Upload failed. Please try again.");
//       }
//     }
//   };

//   return (
//     <Box maxWidth="sm" mx="auto" mt={4} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
//       <Card sx={{ p: 3 }}>
//         <CardContent>
//           <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
//             Upload Your Resume
//           </Typography>
//           <Typography variant="body2" color="text.secondary" mb={2}>
//             We’ll analyze your resume and match it to relevant jobs.
//           </Typography>
//           <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             <input
//               type="file"
//               onChange={(e) => setFile(e.target.files[0])}
//               accept=".pdf,.doc,.docx"
//             />
//             {error && <Alert severity="error">{error}</Alert>}
//             <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
//               Upload Resume
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }

// export default ResumeUpload;








// working version

// import React, { useState } from "react";
// import api from "../api";

// function ResumeUpload() {
//   const [file, setFile] = useState(null);
//   const [matches, setMatches] = useState([]);

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("resume", file);
//     try {
//       const res = await api.post("/resume/upload", formData);
//       setMatches(res.data.matches);
//     } catch (err) {
//       alert("Upload failed.");
//     }
//   };

//   return (
//     <>
//       <form onSubmit={handleUpload}>
//         <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//         <button type="submit">Upload Resume</button>
//       </form>
//       <div>
//         {matches.map((m, i) => (
//           <p key={i}>
//             {m.job_title}: {m.match_score}%
//           </p>
//         ))}
//       </div>
//     </>
//   );
// }

// export default ResumeUpload;






//working copy//

// import React, { useState } from 'react';
// import axios from 'axios';
// import MatchResults from './MatchResults';

// const ResumeUpload = () => {
//   const [resume, setResume] = useState(null);
//   const [matches, setMatches] = useState([]);

//   const handleFileChange = (e) => {
//     setResume(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!resume) {
//       alert("Please select a resume file first.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append('resume', resume);

//     try {
//       const response = await axios.post('http://localhost:5000/api/upload_resume', formData);
//       setMatches(response.data.matches);
//     } catch (err) {
//       console.error('Upload failed:', err.response?.data || err.message);
//       alert("Failed to upload resume. Check console for details.");
//     }
//   };

//   return (
//     <div>
//       <h2>Upload Your Resume</h2>
//       <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
//       <button onClick={handleUpload}>Upload</button>

//       {matches.length > 0 && <MatchResults matches={matches} />}
//     </div>
//   );
// };

// export default ResumeUpload;
