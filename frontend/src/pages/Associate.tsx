import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gameAPI } from '../services/api'
import { AssociateGame, TIME_PERIODS, DEFAULT_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE, NewsSource, TimePeriod } from '../types'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
  Alert
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import LoadingSpinner from '../components/LoadingSpinner'
import AdvancedSettings from './components/AdvancedSettings'

const Associate: React.FC = () => {
  const { isLoading, user } = useAuth0();

  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>(TIME_PERIODS.PAST_MONTH)
  const [selectedSources, setSelectedSources] = useState<NewsSource[]>(Object.values(NewsSource))
  const [maxGuesses, setMaxGuesses] = useState(DEFAULT_MAX_GUESSES)
  const [scoreboardSize, setScoreboardSize] = useState(DEFAULT_SCOREBOARD_SIZE)

  const [selectedWord, setSelectedWord] = useState('')
  const [findingCount, setFindingCount] = useState(false)
  const [wordCount, setWordCount] = useState<number | null>(null)

  const handleStartGame = async () => {
    setLoading(true)
    try {
      const game: AssociateGame = {
        score: 0,
        created_at: new Date().toISOString(),
        max_guesses: maxGuesses,
        scoreboard_size: scoreboardSize,
        time_period: selectedTimePeriod,
        sources: selectedSources,
        word: selectedWord,
        guessed_words: [],
        remaining_guesses: maxGuesses,
        is_completed: false,
        user_id: user?.sub
      }
      
      const { data, error } = await gameAPI.createAssociateGame(game)

      if (error) {
        console.error('Error creating game:', error)
        return
      }
    
      const gameId = data.id
      // Navigate to associate game
      navigate(`/associate/${gameId}`)
    } catch (error) {
      console.error('Failed to create game:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFindCount = async () => {
    if (findingCount || !selectedWord.trim() || (wordCount !== undefined && wordCount !== null)) {
      return
    }
    setFindingCount(true)
    try {
      const { data, error } = await gameAPI.getWordCount(selectedTimePeriod, selectedSources, selectedWord, new Date())
      if (error) {
        console.error('Error finding count:', error)
        return
      }
      setWordCount(data)
    } catch (error) {
      console.error('Failed to find count:', error)
    } finally {
      setFindingCount(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleFindCount()
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <SearchIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Word Association Mode
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Choose a word and guess which words go alongside it most.
        </Typography>
      </Box>

      {/* Instructions Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> Type a word in the input field, and verify it's frequency by pressing the 'Find Count' button. Once verified, press the 'Start Game' button to begin.
        </Typography>
      </Alert>

      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Word Selection
          </Typography>
          <Box component="form" onSubmit={handleFormSubmit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Enter a word that appears in news headlines"
                value={selectedWord}
                onChange={(e) => {
                  setSelectedWord(e.target.value)
                  setWordCount(null)
                }}
                placeholder="Type a word..."
                variant="outlined"
                fullWidth
                disabled={findingCount}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ 
                  '& .MuiInputBase-input': { fontSize: '1rem' },
                  flex: 1
                }}
              />
              <Button 
                variant="contained" 
                type="submit"
                disabled={findingCount || !selectedWord.trim() || (wordCount !== undefined && wordCount !== null)}
                sx={{ 
                  minWidth: { xs: '100%', sm: 140 },
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {findingCount ? 'Searching...' : 'Find Count'}
              </Button>
            </Stack>
          </Box>
          
          {findingCount && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <LoadingSpinner size="sm" />
              <Typography variant="body2">Checking word frequency...</Typography>
            </Box>
          )}

          {wordCount !== null && wordCount !== undefined && (
            <Alert 
              severity={wordCount > 0 ? "success" : "warning"} 
              sx={{ 
                mt: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  <strong>{wordCount.toLocaleString()}</strong> instance{wordCount !== 1 ? 's' : ''} found
                </Typography>
                {wordCount > 0 && (
                  <Chip 
                    label="Ready to play" 
                    color="success" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            </Alert>
          )}
        </CardContent>
      </Card>

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
        showStartButton={false}
      />

      {/* Start Game Button */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleStartGame}
          disabled={loading || isLoading || selectedWord.length === 0 || wordCount === null || wordCount === undefined}
          startIcon={loading ? <LoadingSpinner size="sm" /> : <PlayIcon />}
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #1976D2 0%, #DC024E 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1870C9 0%, #CA0248 100%)',
            },
            '&:disabled': {
              background: 'grey.300'
            }
          }}
        >
          {loading ? 'Creating Game...' : isLoading ? 'Loading...' : 'Start Association Game'}
        </Button>
        {(selectedWord.length === 0 || wordCount === null || wordCount === undefined) && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Please type a word and verify its frequency to start
          </Typography>
        )}
      </Box>
    </Container>
  )
}

export default Associate
