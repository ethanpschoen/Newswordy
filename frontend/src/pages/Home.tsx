import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { supabase } from '../services/supabaseClient'
import { gameAPI } from '../services/api'
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
  Divider
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Schedule as ClockIcon,
  EmojiEvents as TrophyIcon,
  Person as UserIcon,
  Language as GlobeIcon,
  CheckCircle as CheckIcon
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

    const isUserInDatabase = await supabase.from('users').select('*').eq('id', user?.sub)

    if (!isUserInDatabase.data?.length) {
      await supabase.from('users').insert({
        email: user?.email,
        username: user?.nickname,
        id: user?.sub,
        average_score: 0,
        best_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_games: 0,
        total_score: 0
      })
    }
  }

  const getUserStats = async () => {
    if (!isAuthenticated) return

    const account = await supabase.from('users').select('*').eq('id', user?.sub).single()
    const history = account.data

    const userStats: Stat[] = [
      { name: 'Total Games', value: history?.total_games || 0, icon: PlayIcon, color: 'primary.main' },
      { name: 'Best Score', value: history?.best_score || 0, icon: TrophyIcon, color: 'warning.main' },
      { name: 'Average Score', value: history?.average_score?.toFixed(1) || '0.0', icon: UserIcon, color: 'success.main' },
    ]

    setStats(userStats)
  }

  useMemo(upsertUser, [])

  useMemo(getUserStats, [])

  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(TIME_PERIODS.PAST_WEEK)
  const [selectedSources, setSelectedSources] = useState<NewsSource[]>(Object.values(NewsSource))
  const [maxGuesses, setMaxGuesses] = useState(DEFAULT_MAX_GUESSES)
  const [scoreboardSize, setScoreboardSize] = useState(DEFAULT_SCOREBOARD_SIZE)
  const [stats, setStats] = useState<Stat[]>([])

  const handleStartGame = async () => {
    setLoading(true)
    try {
      const game: Game = {
        score: 0,
        created_at: new Date().toISOString(),
        max_guesses: maxGuesses || DEFAULT_MAX_GUESSES,
        scoreboard_size: scoreboardSize || DEFAULT_SCOREBOARD_SIZE,
        time_period: selectedTimePeriod || TIME_PERIODS.PAST_WEEK,
        sources: selectedSources.length === 0 ? undefined : selectedSources,
        guessed_words: [],
        remaining_guesses: maxGuesses,
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
      // You could add a toast notification here
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

  // TODO: different layout for mobile / narrow screen
  return (
    <Container maxWidth="lg">
      {/* Authentication Status */}
      <Box sx={{ mb: 4 }}>
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
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to Newswordy!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Guess the most common words in news headlines from different time periods. 
          Test your knowledge of current events and compete with others!
        </Typography>
      </Box>

      {/* User Stats - Only show if authenticated */}
      {isAuthenticated && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat) => (
            <Grid size={{ xs: 12, md: 4 }} key={stat.name}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <stat.icon sx={{ fontSize: 40, color: stat.color }} />
                  </Box>
                  <Typography variant="h4" component="div" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Game Configuration */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h5" component="h2">
            Game Settings
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
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
              label="Max Guesses"
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
              label="Scoreboard Size"
              type="number"
              value={scoreboardSize}
              onChange={(e) => setScoreboardSize(parseInt(e.target.value))}
              inputProps={{ min: 5, max: MAX_SCOREBOARD_SIZE }}
            />
          </Grid>
        </Grid>

        {/* News Sources Selection */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <GlobeIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6">
              News Sources
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
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

        {/* Start Game Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartGame}
            disabled={loading || isLoading}
            startIcon={loading ? <LoadingSpinner size="sm" /> : <PlayIcon />}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            {loading ? 'Creating Game...' : isLoading ? 'Loading...' : 'Start New Game'}
          </Button>
          {window.location.href.includes('localhost') &&
            <Button
              variant="outlined"
              size="large"
              onClick={handleTestGame}
              startIcon={<PlayIcon />}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem', ml: 2 }}
            >
              Test Game (Hard-coded Data)
            </Button>
          }
          {!isAuthenticated && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your game progress won't be saved unless you sign in
            </Typography>
          )}
        </Box>
      </Paper>

      {/* How to Play */}
      <Paper elevation={1} sx={{ p: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h5" component="h3" gutterBottom>
          How to Play
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CheckIcon sx={{ mr: 1, mt: 0.5, color: 'success.main' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  1. Choose a Time Period
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select from past day, week, month, or year to determine which news headlines to analyze.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CheckIcon sx={{ mr: 1, mt: 0.5, color: 'success.main' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  2. Select News Sources
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose specific news sources to get headlines from.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CheckIcon sx={{ mr: 1, mt: 0.5, color: 'success.main' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  3. Guess Common Words
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type words that you think appear frequently in news headlines from that period.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CheckIcon sx={{ mr: 1, mt: 0.5, color: 'success.main' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  4. Score Points
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Earn points based on how common your guessed words are. Higher frequency = more points!
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default Home
