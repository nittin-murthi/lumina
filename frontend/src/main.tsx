import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'

import { Toaster } from 'react-hot-toast'

import axios from 'axios'

// Set baseURL based on environment
axios.defaults.baseURL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001/api/v1'
  : '/api/v1';
axios.defaults.withCredentials = true

const theme = createTheme({
  typography: {
    fontFamily: 'Open Sans, sans-serif',
    allVariants: {
      color: '#fff',
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Toaster position="top-center" />
        <App />
      </ThemeProvider>
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
