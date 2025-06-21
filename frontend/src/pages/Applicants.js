import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import {
  Box, Typography, Card, CardContent, Button, Stack, Chip
} from "@mui/material";

function Applicants() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    api.get(`/jobs/applications/${jobId}`).then((res) => {
      setApplicants(res.data.applicants || []);
    });

    api.get("/jobs/employer").then((res) => {
      const job = res.data.jobs.find((j) => j.id === parseInt(jobId));
      setJobTitle(job?.title || "Applicants");
    });
  }, [jobId]);

  const updateStatus = async (appId, newStatus) => {
    try {
      await api.post(`/jobs/applications/update-status/${appId}`, {
        status: newStatus,
      });
      alert(`Status updated to ${newStatus}`);
      // Refresh list
      const res = await api.get(`/jobs/applications/${jobId}`);
      setApplicants(res.data.applicants || []);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Typography variant="h4" color="primary" gutterBottom>
        Applicants for "{jobTitle}"
      </Typography>

      {applicants.length === 0 ? (
        <Typography>No applications found.</Typography>
      ) : (
        <Stack spacing={3}>
          {applicants.map((app, idx) => (
            <Card key={idx}>
              <CardContent>
                <Typography variant="body1">
                  <strong>Applicant ID:</strong> {app.user_id}
                </Typography>
                <Typography variant="body2" sx={{ my: 1 }}>
                  <Typography>Matched via resume</Typography>
                </Typography>
                <Chip
                  label={`Status: ${app.status || "Pending"}`}
                  color={
                    app.status === "Accepted"
                      ? "success"
                      : app.status === "Rejected"
                      ? "error"
                      : "warning"
                  }
                  sx={{ mb: 2 }}
                />

                <Stack spacing={1} direction="row">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => updateStatus(app.id, "Accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => updateStatus(app.id, "Rejected")}
                  >
                    Reject
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default Applicants;
