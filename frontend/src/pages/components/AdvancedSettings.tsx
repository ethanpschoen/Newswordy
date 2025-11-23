import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
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
  Divider,
  Collapse,
  IconButton,
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Schedule as ClockIcon,
  Language as GlobeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'
import {
  TIME_PERIOD_NAMES,
  NewsSource,
  NewsSourceConfig,
  MAX_MAX_GUESSES,
  MAX_SCOREBOARD_SIZE,
  TimePeriod,
} from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'

interface Props {
  selectedTimePeriod: TimePeriod
  setSelectedTimePeriod: (timePeriod: TimePeriod) => void
  maxGuesses: number
  setMaxGuesses: (maxGuesses: number) => void
  scoreboardSize: number
  setScoreboardSize: (scoreboardSize: number) => void
  selectedSources?: NewsSource[]
  setSelectedSources?: (sources: React.SetStateAction<NewsSource[]>) => void
  handleStartGame: () => void
  loading: boolean
  isLoading: boolean
  showSources: boolean
  showStartButton: boolean
}

const AdvancedSettings = ({
  selectedTimePeriod,
  setSelectedTimePeriod,
  maxGuesses,
  setMaxGuesses,
  scoreboardSize,
  setScoreboardSize,
  selectedSources,
  setSelectedSources,
  handleStartGame,
  loading,
  isLoading,
  showSources,
  showStartButton,
}: Props) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const handleSourceToggle = (source: NewsSource) => {
    if (!setSelectedSources) return
    setSelectedSources(prev => (prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]))
  }

  const handleSelectAllSources = () => {
    if (!setSelectedSources) return
    setSelectedSources(Object.values(NewsSource))
  }

  const handleClearSources = () => {
    if (!setSelectedSources) return
    setSelectedSources([])
  }

  return (
    <Paper elevation={2} sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6">Advanced Settings</Typography>
        </Box>
        <IconButton>{showAdvancedSettings ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
      </Box>

      <Collapse in={showAdvancedSettings}>
        <Box sx={{ p: 3, pt: 1 }}>
          <Grid container spacing={3} sx={showSources ? { mb: 3 } : {}}>
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
                  onChange={e => setSelectedTimePeriod(e.target.value as any)}
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
                onChange={e => setMaxGuesses(parseInt(e.target.value))}
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
                onChange={e => setScoreboardSize(parseInt(e.target.value))}
                inputProps={{ min: 5, max: MAX_SCOREBOARD_SIZE }}
              />
            </Grid>
          </Grid>

          {/* News Sources Selection */}
          {showSources && selectedSources && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GlobeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6">News Sources</Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button variant="outlined" size="small" onClick={handleSelectAllSources}>
                  Select All
                </Button>
                <Button variant="outlined" size="small" onClick={handleClearSources}>
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
          )}

          {showStartButton && (
            <>
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
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default AdvancedSettings
