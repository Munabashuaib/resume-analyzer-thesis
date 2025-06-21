import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Stack
} from '@mui/material';
import { addJob } from '../api';

function JobForm() {
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    description: '',
    skills: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await addJob(jobData);
    alert(data.message || data.error);
  };

  return (
    <Box maxWidth="sm" mx="auto" mt={4} px={2}>
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} color="primary" gutterBottom>
            Add Job
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                fullWidth
                value={jobData.title}
                onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                required
              />
              <TextField
                label="Company"
                fullWidth
                value={jobData.company}
                onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                required
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={jobData.description}
                onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                required
              />
              <TextField
                label="Skills (comma separated)"
                fullWidth
                value={jobData.skills}
                onChange={(e) => setJobData({ ...jobData, skills: e.target.value })}
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                Add Job
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default JobForm;



// working code

// import React, { useState } from 'react';
// import { addJob } from '../api';

// function JobForm() {
//   const [jobData, setJobData] = useState({
//     title: '',
//     company: '',
//     description: '',
//     skills: '',
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = await addJob(jobData);
//     alert(data.message || data.error);
//   };

//   return (
//     <div>
//       <h2>Add Job</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="text" placeholder="Title" onChange={(e) => setJobData({...jobData, title: e.target.value})} />
//         <input type="text" placeholder="Company" onChange={(e) => setJobData({...jobData, company: e.target.value})} />
//         <textarea placeholder="Description" onChange={(e) => setJobData({...jobData, description: e.target.value})} />
//         <input type="text" placeholder="Skills (comma separated)" onChange={(e) => setJobData({...jobData, skills: e.target.value})} />
//         <button type="submit">Add Job</button>
//       </form>
//     </div>
//   );
// }

// export default JobForm;

// import React, { useState } from 'react';
// import axios from 'axios';

// const JobForm = () => {
//   const [title, setTitle] = useState('');
//   const [company, setCompany] = useState('');
//   const [description, setDescription] = useState('');
//   const [skills, setSkills] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('/add_job', {
//         title,
//         company,
//         description,
//         skills
//       });
//       alert(response.data.message); // Show success
//       setTitle('');
//       setCompany('');
//       setDescription('');
//       setSkills('');
//     } catch (error) {
//       console.error('Error adding job:', error);
//       alert('Failed to add job');
//     }
//   };

//   return (
//     <div>
//       <h2>Add New Job</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Job Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           required
//         />
//         <input
//           type="text"
//           placeholder="Company"
//           value={company}
//           onChange={(e) => setCompany(e.target.value)}
//           required
//         />
//         <textarea
//           placeholder="Job Description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           required
//         />
//         <input
//           type="text"
//           placeholder="Skills (comma separated)"
//           value={skills}
//           onChange={(e) => setSkills(e.target.value)}
//           required
//         />
//         <button type="submit">Add Job</button>
//       </form>
//     </div>
//   );
// };

// export default JobForm;



//working copy//

// import React, { useState } from 'react';
// import axios from 'axios';

// const JobForm = () => {
//   const [title, setTitle] = useState('');
//   const [company, setCompany] = useState('');
//   const [description, setDescription] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post('http://localhost:5000/add_job', {
//         title,
//         company,
//         description,
//       });
//       alert('Job added!');
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Add Job</h2>
//       <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
//       <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
//       <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
//       <button type="submit">Add</button>
//     </form>
//   );
// };

// export default JobForm;
