import './App.css'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Signup from './pages/SIgnup'
import NotFound from './pages/NotFound'
import Chat from './pages/Chat'
import { useAuth } from './context/AuthContext'
import MatrixRain from './components/MatrixRain'

function App() {
  console.log(useAuth()?.isLoggedIn);
  const auth = useAuth();
  // The chat route is now conditionally rendered based on authentication status
  // Only logged in users with valid user data can access the /chat route
  // This prevents unauthorized access to the chat functionality
  return (
    <main>
      <MatrixRain />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {auth?.isLoggedIn && auth?.user && (
          <Route path="/chat" element={<Chat />} />
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default App