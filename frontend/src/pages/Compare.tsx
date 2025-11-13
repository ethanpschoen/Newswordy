import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gameAPI } from '../services/api'
import { CompareGame, TIME_PERIODS, TIME_PERIOD_NAMES, DEFAULT_MAX_GUESSES, MAX_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE, NewsSource, NewsSourceConfig, MAX_SCOREBOARD_SIZE } from '../types'
import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
  IconButton,
  Divider,
  Alert
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Schedule as ClockIcon,
  CompareArrows as CompareIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material'
import LoadingSpinner from '../components/LoadingSpinner'

const Compare: React.FC = () => {
  const { user, isLoading } = useAuth0()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(TIME_PERIODS.PAST_WEEK)
  const [maxGuesses, setMaxGuesses] = useState(DEFAULT_MAX_GUESSES)
  const [scoreboardSize, setScoreboardSize] = useState(DEFAULT_SCOREBOARD_SIZE)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  
  // Two groups of sources
  const [groupA, setGroupA] = useState<NewsSource[]>([])
  const [groupB, setGroupB] = useState<NewsSource[]>([])
  
  // Available sources (not in either group)
  const allSources = Object.values(NewsSource)
  const availableSources = allSources.filter(
    source => !groupA.includes(source) && !groupB.includes(source)
  )

  const handleAddToGroupA = (source: NewsSource) => {
    setGroupA(prev => [...prev, source])
  }

  const handleAddToGroupB = (source: NewsSource) => {
    setGroupB(prev => [...prev, source])
  }

  const handleRemoveFromGroupA = (source: NewsSource) => {
    setGroupA(prev => prev.filter(s => s !== source))
  }

  const handleRemoveFromGroupB = (source: NewsSource) => {
    setGroupB(prev => prev.filter(s => s !== source))
  }

  const handleMoveToGroupA = (source: NewsSource) => {
    setGroupB(prev => prev.filter(s => s !== source))
    setGroupA(prev => [...prev, source])
  }

  const handleMoveToGroupB = (source: NewsSource) => {
    setGroupA(prev => prev.filter(s => s !== source))
    setGroupB(prev => [...prev, source])
  }

  const handleStartGame = async () => {
    if (groupA.length === 0 || groupB.length === 0) {
      alert('Please add at least one source to each group before starting.')
      return
    }

    setLoading(true)
    try {
      const game: CompareGame = {
        score: 0,
        created_at: new Date().toISOString(),
        max_guesses: maxGuesses,
        scoreboard_size: scoreboardSize,
        time_period: selectedTimePeriod,
        sources_group_a: groupA,
        sources_group_b: groupB,
        guessed_words_group_a: [],
        guessed_words_group_b: [],
        remaining_guesses: maxGuesses,
        is_completed: false,
        user_id: user?.sub
      }

      console.log('game', game)
      
      const { data, error } = await gameAPI.createComparativeGame(game)

      console.log('data', data)

      if (error) {
        console.error('Error creating game:', error)
        return
      }
    
      const gameId = data.id
      // Navigate to compare game - you may need to pass group info via state or query params
      navigate(`/compare/${gameId}`)
    } catch (error) {
      console.error('Failed to create game:', error)
    } finally {
      setLoading(false)
    }
  }

  const SourceCard: React.FC<{ 
    source: NewsSource
    onRemove?: () => void
    onMoveToOther?: () => void
    groupLabel: string
    groupColor: string
  }> = ({ source, onRemove, onMoveToOther, groupLabel, groupColor }) => {
    const config = NewsSourceConfig[source]
    return (
      <Card
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          border: `2px solid ${groupColor}`,
          bgcolor: `${groupColor}15`,
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s'
          }
        }}
      >
        <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {config.logo}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {config.name}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5}>
          {onMoveToOther && (
            <IconButton
              size="small"
              onClick={onMoveToOther}
              title={`Move to ${groupLabel === 'Group A' ? 'Group B' : 'Group A'}`}
            >
              <CompareIcon fontSize="small" />
            </IconButton>
          )}
          {onRemove && (
            <IconButton
              size="small"
              onClick={onRemove}
              title="Remove from group"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Card>
    )
  }

  const AvailableSourceCard: React.FC<{ source: NewsSource }> = ({ source }) => {
    const config = NewsSourceConfig[source]
    return (
      <Card
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          border: '2px dashed',
          borderColor: 'grey.300',
          bgcolor: 'grey.50',
          '&:hover': {
            borderColor: '#23CE6B',
            bgcolor: 'rgba(35, 206, 107, 0.1)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s'
          }
        }}
      >
        <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {config.logo}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {config.name}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleAddToGroupA(source)
            }}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
            title="Add to Group A"
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleAddToGroupB(source)
            }}
            sx={{
              bgcolor: 'secondary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'secondary.dark'
              }
            }}
            title="Add to Group B"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Card>
    )
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CompareIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Source Comparison Mode
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Compare word usage between two groups of news sources. Organize sources into Group A and Group B to see how their language differs.
        </Typography>
      </Box>

      {/* Instructions Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> Click the <strong style={{ color: '#1976d2' }}>blue</strong> or <strong style={{ color: '#dc004e' }}>red</strong> plus button on available sources to add them to <strong style={{ color: '#1976d2' }}>Group A</strong> or <strong style={{ color: '#dc004e' }}>Group B</strong>. 
          You can also move sources between groups using the swap icon, or remove them using the delete icon. 
          You need at least one source in each group to start.
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
                <AvailableSourceCard source={source} />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Advanced Settings */}
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

        {showAdvancedSettings && (
          <Box sx={{ p: 3, pt: 1 }}>
            <Grid container spacing={3}>
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
          </Box>
        )}
      </Paper>

      {/* Start Game Button */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleStartGame}
          disabled={loading || isLoading || groupA.length === 0 || groupB.length === 0}
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
          {loading ? 'Creating Game...' : isLoading ? 'Loading...' : 'Start Comparison Game'}
        </Button>
        {(groupA.length === 0 || groupB.length === 0) && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Please add at least one source to each group to start
          </Typography>
        )}
      </Box>
    </Container>
  )
}

export default Compare
