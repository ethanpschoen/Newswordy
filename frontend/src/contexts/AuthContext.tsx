import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { User } from '../types'
import { authAPI, setAuthToken } from '../services/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
  register: (email: string, username: string, password: string) => Promise<boolean>
  getAccessToken: () => Promise<string | undefined>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user: auth0User, isAuthenticated, isLoading, loginWithRedirect, logout: auth0Logout, getAccessTokenSilently } = useAuth0()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && auth0User) {
        // Get token and set it for API calls
        getAccessTokenSilently()
          .then(token => {
            setAuthToken(token)
            // Get user profile from your backend
            return authAPI.getProfile()
          })
          .then(response => {
            if (response.success && response.data) {
              setUser(response.data.user)
            }
          })
          .catch(error => {
            console.error('Error fetching user profile:', error)
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        setAuthToken(null)
        setUser(null)
        setLoading(false)
      }
    }
  }, [isAuthenticated, auth0User, isLoading, getAccessTokenSilently])

  const login = () => {
    loginWithRedirect()
  }

  const logout = () => {
    setAuthToken(null)
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    })
  }

  const getAccessToken = async () => {
    try {
      return await getAccessTokenSilently()
    } catch (error) {
      console.error('Error getting access token:', error)
      return undefined
    }
  }

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register(email, username, password)
      return response.success
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    getAccessToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
