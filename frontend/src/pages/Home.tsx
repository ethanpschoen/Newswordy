import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gameAPI, userAPI } from '../services/api'
import { Game, TIME_PERIODS, DEFAULT_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE, NewsSource, TimePeriod } from '../types'
import { Box, Button, Card, CardContent, Container, Grid, Typography, Alert } from '@mui/material'
import {
  PlayArrow as PlayIcon,
  EmojiEvents as TrophyIcon,
  Person as UserIcon,
  CompareArrows as CompareIcon,
  Search as SearchIcon,
  Compare as CompareAssociateIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material'
import LoadingSpinner from '../components/LoadingSpinner'
import AdvancedSettings from './components/AdvancedSettings'
import TutorialDialog from './components/TutorialDialog'

interface Stat {
  name: string
  value: number
  icon: any
  color: string
}

const Home: React.FC = () => {
  const { isLoading, isAuthenticated, loginWithRedirect, user } = useAuth0()

  const upsertUser = async () => {
    if (!isAuthenticated) return

    const isUserInDatabase = await userAPI.getUser(user?.sub || '')

    // If no users with that ID, create a new user
    if (!isUserInDatabase.data?.length) {
      const newUser = {
        email: user?.email || '',
        username: user?.nickname || '',
        id: user?.sub || '',
        average_score: 0,
        best_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_games: 0,
        total_score: 0,
      }

      await userAPI.createUser(newUser)
    }
  }

  const getUserStats = async () => {
    if (!isAuthenticated) return

    const account = await userAPI.getUser(user?.sub || '')
    const history = account.data

    const userStats: Stat[] = [
      {
        name: 'Total Games',
        value: history?.total_games || 0,
        icon: PlayIcon,
        color: 'primary.main',
      },
      {
        name: 'Best Score',
        value: history?.best_score || 0,
        icon: TrophyIcon,
        color: 'warning.main',
      },
      {
        name: 'Average Score',
        value: history?.average_score?.toFixed(1) || '0.0',
        icon: UserIcon,
        color: 'success.main',
      },
    ]

    setStats(userStats)
  }

  useMemo(upsertUser, []) // eslint-disable-line react-hooks/exhaustive-deps

  useMemo(getUserStats, []) // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>(TIME_PERIODS.PAST_WEEK)
  const [selectedSources, setSelectedSources] = useState<NewsSource[]>(Object.values(NewsSource))
  const [maxGuesses, setMaxGuesses] = useState(DEFAULT_MAX_GUESSES)
  const [scoreboardSize, setScoreboardSize] = useState(DEFAULT_SCOREBOARD_SIZE)
  const [unlimitedGuesses, setUnlimitedGuesses] = useState(false)
  const [stats, setStats] = useState<Stat[]>([])
  const [tutorialOpen, setTutorialOpen] = useState(false)

  // Check if user has seen tutorial on mount
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('newswordy_tutorial_completed')
    if (!hasSeenTutorial) {
      setTutorialOpen(true)
    }
  }, [])

  const handleTutorialComplete = () => {
    localStorage.setItem('newswordy_tutorial_completed', 'true')
    setTutorialOpen(false)
  }

  const handleShowTutorial = () => {
    setTutorialOpen(true)
  }

  const handleStartGame = async (useDefaults: boolean = false) => {
    setLoading(true)
    try {
      const finalTimePeriod = useDefaults ? TIME_PERIODS.PAST_WEEK : selectedTimePeriod
      const finalSources = useDefaults ? Object.values(NewsSource) : selectedSources
      const finalMaxGuesses = useDefaults ? DEFAULT_MAX_GUESSES : maxGuesses
      const finalScoreboardSize = useDefaults ? DEFAULT_SCOREBOARD_SIZE : scoreboardSize
      const finalUnlimitedGuesses = useDefaults ? false : unlimitedGuesses

      const game: Game = {
        score: 0,
        created_at: new Date().toISOString(),
        max_guesses: finalUnlimitedGuesses ? -1 : finalMaxGuesses,
        scoreboard_size: finalScoreboardSize,
        time_period: finalTimePeriod,
        sources: finalSources.length === 0 ? undefined : finalSources,
        guessed_words: [],
        remaining_guesses: finalUnlimitedGuesses ? -1 : finalMaxGuesses,
        is_completed: false,
        user_id: user?.sub,
      }
      const { data, error } = await gameAPI.createGame(game)

      if (error) {
        console.error('Error creating game:', error)
        return
      }

      const gameId = data.id
      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Failed to create game:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestGame = () => {
    // Navigate to test game with hard-coded data
    navigate('/game/test')
  }

  return (
    <Container maxWidth="lg">
      {/* Authentication Status */}
      <Box sx={{ mb: 3 }}>
        {isAuthenticated ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Welcome back, <strong>{user?.nickname || user?.email}</strong>! Your stats will be saved.
          </Alert>
        ) : (
          <Alert
            severity="info"
            sx={{ mb: 2, pb: 0 }}
            action={
              <Button variant="contained" size="small" onClick={() => loginWithRedirect()}>
                Sign In to Save Stats
              </Button>
            }
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              Sign in to save your stats and compete on the leaderboard!
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to Newswordy!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 1 }}>
          Guess the most common words in news headlines. Test your knowledge of current events!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleShowTutorial}
            startIcon={<HelpIcon />}
            sx={{ textTransform: 'none' }}
          >
            Show Tutorial
          </Button>
        </Box>
      </Box>

      {/* User Stats - Only show if authenticated */}
      {isAuthenticated && stats.length > 0 && (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 3 }}>
          {stats.map(stat => (
            <Box key={stat.name} sx={{ textAlign: 'center' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Game Mode Selection */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Classic Mode */}
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                p: 2,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '60px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <PlayIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Classic Mode
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
                  Guess the most common words from recent news headlines. From all available sources over the past week.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleStartGame(true)}
                    disabled={loading || isLoading}
                    startIcon={loading ? <LoadingSpinner size="sm" /> : null}
                    sx={{
                      px: 5,
                      py: 1.5,
                      fontSize: '1.1rem',
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    {loading ? 'Creating Game...' : isLoading ? 'Loading...' : 'Play'}
                  </Button>
                  {window.location.href.includes('localhost') && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleTestGame}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Test Game
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Advanced Settings */}
      <AdvancedSettings
        selectedTimePeriod={selectedTimePeriod}
        setSelectedTimePeriod={setSelectedTimePeriod}
        maxGuesses={maxGuesses}
        setMaxGuesses={setMaxGuesses}
        scoreboardSize={scoreboardSize}
        setScoreboardSize={setScoreboardSize}
        selectedSources={selectedSources}
        setSelectedSources={setSelectedSources}
        handleStartGame={handleStartGame}
        loading={loading}
        isLoading={isLoading}
        showSources={true}
        showStartButton={true}
        unlimitedGuesses={unlimitedGuesses}
        setUnlimitedGuesses={setUnlimitedGuesses}
      />

      {/* Other Game Modes */}
      <Box>
        <Grid container spacing={3}>
          {/* Source Comparison Mode */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '20px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <CompareIcon sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Source Comparison
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
                  Compare word usage between two groups of sources. Organize sources into groups and see how their
                  language differs.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/compare')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    bgcolor: 'white',
                    color: 'secondary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Start Comparison
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Word Association Mode */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(135deg, #51F588 0%, #099A39 100%)',
                color: 'white',
                borderRadius: '20px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <SearchIcon sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Word Association
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
                  Choose a word commonly seen in news headlines, and guess words that frequently appear with that
                  selected word.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/associate')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    bgcolor: 'white',
                    color: 'rgb(12, 202, 74)',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Start Association
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Comparative Association Mode */}
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(135deg, #FAC748 0%, #B38205 100%)',
                color: 'white',
                borderRadius: '20px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <CompareAssociateIcon sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Comparative Association
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
                  Compare word usage between two groups of sources and see how their language differs with a selected
                  word.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/compare-associate')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    bgcolor: 'white',
                    color: 'rgb(249, 183, 16)',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Start Comparative Association
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tutorial Dialog */}
      <TutorialDialog open={tutorialOpen} onClose={() => setTutorialOpen(false)} onComplete={handleTutorialComplete} />
    </Container>
  )
}

export default Home
