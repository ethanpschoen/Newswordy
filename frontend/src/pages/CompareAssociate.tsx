import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gameAPI } from '../services/api'
import { CompareAssociateGame, TIME_PERIODS, DEFAULT_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE, NewsSource, TimePeriod } from '../types'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  Divider,
  Alert
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  CompareArrows as CompareIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import LoadingSpinner from '../components/LoadingSpinner'
import AdvancedSettings from './components/AdvancedSettings'
import SourceCard from './components/SourceCard'
import AvailableSourceCard from './components/AvailableSourceCard'

const CompareAssociate: React.FC = () => {
  const { user, isLoading } = useAuth0()
  
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>(TIME_PERIODS.PAST_MONTH)
  const [maxGuesses, setMaxGuesses] = useState(DEFAULT_MAX_GUESSES)
  const [scoreboardSize, setScoreboardSize] = useState(DEFAULT_SCOREBOARD_SIZE)
  
  // Two groups of sources
  const [groupA, setGroupA] = useState<NewsSource[]>([])
  const [groupB, setGroupB] = useState<NewsSource[]>([])

  const [selectedWord, setSelectedWord] = useState('')
  const [findingCount, setFindingCount] = useState(false)
  const [wordCountGroupA, setWordCountGroupA] = useState<number | null>(null)
  const [wordCountGroupB, setWordCountGroupB] = useState<number | null>(null)
  
  // Available sources (not in either group)
  const allSources = Object.values(NewsSource)
  const availableSources = allSources.filter(
    source => !groupA.includes(source) && !groupB.includes(source)
  )

  const handleAddToGroupA = (source: NewsSource) => {
    setGroupA(prev => [...prev, source])
    setWordCountGroupA(null)
    setWordCountGroupB(null)
  }

  const handleAddToGroupB = (source: NewsSource) => {
    setGroupB(prev => [...prev, source])
    setWordCountGroupA(null)
    setWordCountGroupB(null)
  }

  const handleRemoveFromGroupA = (source: NewsSource) => {
    setGroupA(prev => prev.filter(s => s !== source))
    setWordCountGroupA(null)
    setWordCountGroupB(null)
  }

  const handleRemoveFromGroupB = (source: NewsSource) => {
    setGroupB(prev => prev.filter(s => s !== source))
    setWordCountGroupA(null)
    setWordCountGroupB(null)
  }

  const handleMoveToGroupA = (source: NewsSource) => {
    setGroupB(prev => prev.filter(s => s !== source))
    setGroupA(prev => [...prev, source])
    setWordCountGroupA(null)
    setWordCountGroupB(null)
  }

  const handleMoveToGroupB = (source: NewsSource) => {
    setGroupA(prev => prev.filter(s => s !== source))
    setGroupB(prev => [...prev, source])
    setWordCountGroupA(null)
    setWordCountGroupB(null)
  }

  const handleStartGame = async () => {
    if (groupA.length === 0 || groupB.length === 0) {
      alert('Please add at least one source to each group before starting.')
      return
    }

    setLoading(true)
    try {
      const game: CompareAssociateGame = {
        score: 0,
        created_at: new Date().toISOString(),
        max_guesses: maxGuesses,
        scoreboard_size: scoreboardSize,
        time_period: selectedTimePeriod,
        sources_group_a: groupA,
        sources_group_b: groupB,
        word: selectedWord,
        guessed_words_group_a: [],
        guessed_words_group_b: [],
        remaining_guesses: maxGuesses,
        is_completed: false,
        user_id: user?.sub
      }
      
      const { data, error } = await gameAPI.createComparativeAssociatedGame(game)

      if (error) {
        console.error('Error creating game:', error)
        return
      }
    
      const gameId = data.id
      // Navigate to compare game
      navigate(`/compare-associate/${gameId}`)
    } catch (error) {
      console.error('Failed to create game:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFindCount = async () => {
    if (findingCount || !selectedWord.trim() || (wordCountGroupA !== undefined && wordCountGroupA !== null) || (wordCountGroupB !== undefined && wordCountGroupB !== null)) {
      return
    }
    setFindingCount(true)
    try {
      const { data: dataGroupA, error: errorGroupA } = await gameAPI.getWordCount(selectedTimePeriod, groupA, selectedWord, new Date())
      const { data: dataGroupB, error: errorGroupB } = await gameAPI.getWordCount(selectedTimePeriod, groupB, selectedWord, new Date())
      if (errorGroupA || errorGroupB) {
        console.error('Error finding count:', errorGroupA || errorGroupB)
        return
      }
      setWordCountGroupA(dataGroupA)
      setWordCountGroupB(dataGroupB)
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
        <CompareIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Comparative Association Mode
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Compare word usage between two groups of sources and see how their language differs with a selected word.
        </Typography>
      </Box>

      {/* Instructions Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> Click the <strong style={{ color: '#1976d2' }}>blue</strong> or <strong style={{ color: '#dc004e' }}>red</strong> plus button on available sources to add them to <strong style={{ color: '#1976d2' }}>Group A</strong> or <strong style={{ color: '#dc004e' }}>Group B</strong>. 
          You can also move sources between groups using the swap icon, or remove them using the delete icon. 
          You need at least one source in each group to start.
          Once you have selected the source groups, type a word in the input field, and verify it's frequency by pressing the 'Find Count' button. Once verified, press the 'Start Game' button to begin.
        </Typography>
      </Alert>

      {/* Two Groups Layout */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Group A */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              minHeight: 400,
              border: '3px solid',
              borderColor: 'primary.main',
              bgcolor: 'primary.50',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Group A
              </Typography>
              <Chip 
                label={`${groupA.length} source${groupA.length !== 1 ? 's' : ''}`}
                color="primary"
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {groupA.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  bgcolor: 'white'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No sources yet. Click on available sources below to add them here.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {groupA.map((source) => (
                  <SourceCard
                    key={source}
                    source={source}
                    onRemove={() => handleRemoveFromGroupA(source)}
                    onMoveToOther={() => handleMoveToGroupB(source)}
                    groupLabel="Group A"
                    groupColor="#1976d2"
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Group B */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              minHeight: 400,
              border: '3px solid',
              borderColor: 'secondary.main',
              bgcolor: 'secondary.50',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" color="secondary.main">
                Group B
              </Typography>
              <Chip 
                label={`${groupB.length} source${groupB.length !== 1 ? 's' : ''}`}
                color="secondary"
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {groupB.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  bgcolor: 'white'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No sources yet. Click on available sources below to add them here.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {groupB.map((source) => (
                  <SourceCard
                    key={source}
                    source={source}
                    onRemove={() => handleRemoveFromGroupB(source)}
                    onMoveToOther={() => handleMoveToGroupA(source)}
                    groupLabel="Group B"
                    groupColor="#dc004e"
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Available Sources */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0.5, fontWeight: 'bold' }}>
          Available Sources
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click the <strong style={{ color: '#1976d2' }}>blue</strong> or <strong style={{ color: '#dc004e' }}>red</strong> plus button to add a source to <strong style={{ color: '#1976d2' }}>Group A</strong> or <strong style={{ color: '#dc004e' }}>Group B</strong>.
        </Typography>
        {availableSources.length === 0 ? (
          <Alert severity="success">
            All sources have been assigned to groups!
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {availableSources.map((source) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={source}>
                <AvailableSourceCard source={source} handleAddToGroupA={handleAddToGroupA} handleAddToGroupB={handleAddToGroupB} />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

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
                  setWordCountGroupA(null)
                  setWordCountGroupB(null)
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
                disabled={findingCount || !selectedWord.trim() || (wordCountGroupA !== undefined && wordCountGroupA !== null) || (wordCountGroupB !== undefined && wordCountGroupB !== null)}
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

          {wordCountGroupA !== null && wordCountGroupA !== undefined && wordCountGroupB !== null && wordCountGroupB !== undefined && (
            <Alert 
              severity={wordCountGroupA > 0 && wordCountGroupB > 0 ? "success" : "warning"} 
              sx={{ 
                mt: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  <strong>{wordCountGroupA.toLocaleString()}</strong> instance{wordCountGroupA !== 1 ? 's' : ''} found in Group A and <strong>{wordCountGroupB.toLocaleString()}</strong> instance{wordCountGroupB !== 1 ? 's' : ''} found in Group B
                </Typography>
                {wordCountGroupA > 0 && wordCountGroupB > 0 && (
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
        handleStartGame={handleStartGame}
        loading={loading}
        isLoading={isLoading}
        showSources={false}
        showStartButton={false}
      />

      {/* Start Game Button */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleStartGame}
          disabled={loading || isLoading || groupA.length === 0 || groupB.length === 0 || selectedWord.length === 0 || wordCountGroupA === null || wordCountGroupA === undefined || wordCountGroupB === null || wordCountGroupB === undefined}
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
          {loading ? 'Creating Game...' : isLoading ? 'Loading...' : 'Start Comparative Association Game'}
        </Button>
        {(groupA.length === 0 || groupB.length === 0 || selectedWord.length === 0 || wordCountGroupA === null || wordCountGroupA === undefined || wordCountGroupB === null || wordCountGroupB === undefined) && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Please add at least one source to each group and type a word and verify its frequency to start
          </Typography>
        )}
      </Box>
    </Container>
  )
}

export default CompareAssociate
