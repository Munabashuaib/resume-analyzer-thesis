import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  MenuItem,
  TextField,
  Input,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function ResumeEnhancer() {
  const [file, setFile] = useState(null);
  const [domain, setDomain] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs/domains", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableDomains(data.filter((d) => d.toLowerCase() !== "all domains"));
        } else if (Array.isArray(data.domains)) {
          setAvailableDomains(data.domains.filter((d) => d.toLowerCase() !== "all domains"));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch domains", err);
        setAvailableDomains([]);
      });
  }, []);

  const handleEnhance = async () => {
    if (!file || !domain) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("domain", domain);

    const res = await fetch("http://localhost:5000/api/resume/enhance", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    setSuggestions(data.suggestions || []);
  };

  return (
    <Box maxWidth="md" mx="auto" mt={4} px={2}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Resume Enhancer
      </Typography>

      <Typography mb={3}>
        Upload your resume and choose a domain. The system will suggest domain-specific skills you can add to make your resume stronger and more relevant to recruiters.
      </Typography>

      <Stack spacing={2} mb={3}>
        <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <TextField
          label="Select Domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          select
        >
          {availableDomains.length === 0 ? (
            <MenuItem disabled>No domains found</MenuItem>
          ) : (
            availableDomains.map((d, i) => (
              <MenuItem key={i} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </MenuItem>
            ))
          )}
        </TextField>

        <Button
          variant="contained"
          onClick={handleEnhance}
          disabled={!file || !domain}
        >
          Enhance Resume
        </Button>
      </Stack>

      {suggestions.length > 0 && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Suggested Additions
            </Typography>
            <Typography gutterBottom>
              Consider including these to improve your resume’s relevance in the{" "}
              <strong>{domain}</strong> domain:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {suggestions.map((skill, idx) => (
                <Chip
                  key={idx}
                  icon={<CheckCircleIcon color="success" />}
                  label={skill}
                  color="success"
                  variant="outlined"
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default ResumeEnhancer;
