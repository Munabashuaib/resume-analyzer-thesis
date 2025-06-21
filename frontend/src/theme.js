// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  palette: {
    primary: {
      main: '#1976D2', // Professional blue
    },
    secondary: {
      main: '#00B8D9', // Teal
    },
    background: {
      default: '#F5F7FA', // Light grey
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;



// // src/theme.js
// import { createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1976d2',  // Primary color
//     },
//     secondary: {
//       main: '#ff5722',  // Secondary color
//     },
//   },
//   typography: {
//     fontFamily: 'Roboto, sans-serif',
//   },
// });

// export default theme;
