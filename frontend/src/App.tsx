import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Game from './pages/Game'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import LoadingSpinner from './components/LoadingSpinner'
import { useAuth0 } from '@auth0/auth0-react'
import { setAuthToken, setAnonymousSession } from './services/api'

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth0()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const AppContent: React.FC = () => {
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0()

  // Set up Auth0 token for API calls and handle anonymous sessions
  useEffect(() => {
    const setupAuth = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently()
          setAuthToken(token)
        } catch (error) {
          console.error('Failed to get access token:', error)
          setAuthToken(null)
        }
      } else {
        setAuthToken(null)
        // Restore anonymous session if it exists
        const sessionId = localStorage.getItem('newswordy_session_id')
        if (sessionId) {
          setAnonymousSession(sessionId)
        }
      }
    }

    if (!isLoading) {
      setupAuth()
    }
  }, [isAuthenticated, getAccessTokenSilently, isLoading])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:gameId" element={<Game />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AppContent />
  )
}

export default App
