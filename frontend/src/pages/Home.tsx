import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gameAPI, userAPI } from '../services/api'
import { Game, TIME_PERIODS, TIME_PERIOD_NAMES, DEFAULT_MAX_GUESSES, MAX_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE, NewsSource, NewsSourceConfig, MAX_SCOREBOARD_SIZE } from '../types'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  Divider,
  Collapse,
  IconButton
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Schedule as ClockIcon,
  EmojiEvents as TrophyIcon,
  Person as UserIcon,
  Language as GlobeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CompareArrows as CompareIcon,
  Search as SearchIcon,
  Storage as DatabaseIcon
} from '@mui/icons-material'
import LoadingSpinner from '../components/LoadingSpinner'

interface Stat {
  name: string
  value: number
  icon: any
  color: string
}

const Home: React.FC = () => {
  const {
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    user,
  } = useAuth0();

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
        total_score: 0
      }
      
      await userAPI.createUser(newUser)
    }
  }

  const getUserStats = async () => {
    if (!isAuthenticated) return

    const account = await userAPI.getSingleUser(user?.sub || '')
    const history = account.data

    const userStats: Stat[] = [
      { name: 'Total Games', value: history?.total_games || 0, icon: PlayIcon, color: 'primary.main' },
      { name: 'Best Score', value: history?.best_score || 0, icon: TrophyIcon, color: 'warning.main' },
      { name: 'Average Score', value: history?.average_score?.toFixed(1) || '0.0', icon: UserIcon, color: 'success.main' },
    ]

    setStats(userStats)
  }

  useMemo(upsertUser, []) // eslint-disable-line react-hooks/exhaustive-deps

  useMemo(getUserStats, []) // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(TIME_PERIODS.PAST_WEEK)
  const [selectedSources, setSelectedSources] = useState<NewsSource[]>(Object.values(NewsSource))
  const [maxGuesses, setMaxGuesses] = useState(DEFAULT_MAX_GUESSES)
  const [scoreboardSize, setScoreboardSize] = useState(DEFAULT_SCOREBOARD_SIZE)
  const [stats, setStats] = useState<Stat[]>([])
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const handleStartGame = async (useDefaults: boolean = false) => {
    setLoading(true)
    try {
      const finalTimePeriod = useDefaults ? TIME_PERIODS.PAST_WEEK : selectedTimePeriod
      const finalSources = useDefaults ? Object.values(NewsSource) : selectedSources
      const finalMaxGuesses = useDefaults ? DEFAULT_MAX_GUESSES : maxGuesses
      const finalScoreboardSize = useDefaults ? DEFAULT_SCOREBOARD_SIZE : scoreboardSize

      const game: Game = {
        score: 0,
        created_at: new Date().toISOString(),
        max_guesses: finalMaxGuesses,
        scoreboard_size: finalScoreboardSize,
        time_period: finalTimePeriod,
        sources: finalSources.length === 0 ? undefined : finalSources,
        guessed_words: [],
        remaining_guesses: finalMaxGuesses,
        is_completed: false,
        user_id: user?.sub
      }
      const { data, error } = await gameAPI.createGame(game)

      if (error) {
        console.error('Error creating game:', error);
        return;
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

  const handleSourceToggle = (source: NewsSource) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

  const handleSelectAllSources = () => {
    setSelectedSources(Object.values(NewsSource))
  }

  const handleClearSources = () => {
    setSelectedSources([])
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
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Sign in to save your stats and compete on the leaderboard!
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => loginWithRedirect()}
            >
              Sign In to Save Stats
            </Button>
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
      </Box>

      {/* User Stats - Only show if authenticated */}
      {isAuthenticated && stats.length > 0 && (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 3 }}>
          {stats.map((stat) => (
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
                  boxShadow: 6
                }
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
                        bgcolor: 'grey.100'
                      }
                    }}
                  >
                    {loading ? 'Creating Game...' : isLoading ? 'Loading...' : 'Play'}
                  </Button>
                  {window.location.href.includes('localhost') && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleTestGame}
                      startIcon={<PlayIcon />}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        fontSize: '1.1rem',
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }
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

      {/* Advanced Settings - Collapsible */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6">
              Advanced Settings
            </Typography>
          </Box>
          <IconButton>
            {showAdvancedSettings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={showAdvancedSettings}>
          <Box sx={{ p: 3, pt: 1 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Time Period Selection */}
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ClockIcon sx={{ mr: 1, fontSize: 20 }} />
                      Time Period
                    </Box>
                  </InputLabel>
                  <Select
                    value={selectedTimePeriod}
                    onChange={(e) => setSelectedTimePeriod(e.target.value as any)}
                    label="Time Period"
                  >
                    {Object.entries(TIME_PERIOD_NAMES).map(([key, name]) => (
                      <MenuItem key={key} value={key}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Max Guesses */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Wrong Guesses Allowed"
                  type="number"
                  value={maxGuesses}
                  onChange={(e) => setMaxGuesses(parseInt(e.target.value))}
                  inputProps={{ min: 1, max: MAX_MAX_GUESSES }}
                />
              </Grid>

              {/* Scoreboard Size */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Word Scoreboard Size"
                  type="number"
                  value={scoreboardSize}
                  onChange={(e) => setScoreboardSize(parseInt(e.target.value))}
                  inputProps={{ min: 5, max: MAX_SCOREBOARD_SIZE }}
                />
              </Grid>
            </Grid>

            {/* News Sources Selection */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GlobeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6">
                  News Sources
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAllSources}
                >
                  Select All
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearSources}
                >
                  Clear All
                </Button>
              </Stack>

              <Grid container spacing={2}>
                {Object.entries(NewsSourceConfig).map(([key, config]) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedSources.includes(key as NewsSource)}
                          onChange={() => handleSourceToggle(key as NewsSource)}
                        />
                      }
                      label={config.name}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {selectedSources.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`Selected ${selectedSources.length} source${selectedSources.length !== 1 ? 's' : ''}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Start Custom Game Button */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleStartGame()}
                disabled={loading || isLoading}
                startIcon={loading ? <LoadingSpinner size="sm" /> : <PlayIcon />}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? 'Creating Game...' : isLoading ? 'Loading...' : 'Start Custom Game'}
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Other Game Modes */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Source Comparison Mode - Coming Soon */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                height: '100%',
                opacity: 0.6,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <CardContent>
                <CompareIcon sx={{ fontSize: 50, mb: 2, color: 'text.secondary' }} />
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Source Comparison
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Compare word usage between two groups of sources
                </Typography>
                <Chip label="Coming Soon" color="default" size="small" />
              </CardContent>
            </Card>
          </Grid>

          {/* Word Association Mode - Coming Soon */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                height: '100%',
                opacity: 0.6,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <CardContent>
                <SearchIcon sx={{ fontSize: 50, mb: 2, color: 'text.secondary' }} />
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Word Association
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Guess words that commonly appear with a selected word
                </Typography>
                <Chip label="Coming Soon" color="default" size="small" />
              </CardContent>
            </Card>
          </Grid>

          {/* Database Querying System - Coming Soon (Less Priority) */}
          <Grid size={{ xs: 12 }}>
            <Card 
              sx={{ 
                p: 2.5, 
                textAlign: 'center',
                opacity: 0.5,
                border: '2px dashed',
                borderColor: 'grey.300',
                bgcolor: 'grey.50'
              }}
            >
              <CardContent>
                <DatabaseIcon sx={{ fontSize: 40, mb: 1.5, color: 'text.secondary' }} />
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Database Querying System
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Explore and query the news database with custom filters and analytics
                </Typography>
                <Chip label="Coming Soon" color="default" size="small" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* How to Play - Simplified */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          How to Play
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Guess words that appear frequently in news headlines. The more common the word, the more points you earn!
        </Typography>
      </Paper>
    </Container>
  )
}

export default Home
