import { TrophyIcon, LightBulbIcon, XCircleIcon } from '@heroicons/react/24/outline'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material'
import { PlayIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useNavigate } from 'react-router-dom'
import { Color, HintType, ExplainerMode } from '../../types'
import { useRef, useEffect } from 'react'
import { WORD_RULES_HELPER_TEXT } from '../../constants/gameRules'
import GameExplainerDialog from './GameExplainerDialog'

interface Props {
  handleSubmitGuess: (e: React.FormEvent<HTMLFormElement>) => void
  currentGuess: string
  setCurrentGuess: (guess: string) => void
  submitting: boolean
  error: string
  success: string
  isCompleted: boolean
  score: number
  isOverlayOpen?: boolean
  onShowHint?: (type: HintType) => void
  onGiveUp?: () => void
  explainerMode?: ExplainerMode
}

const WordInput = ({
  handleSubmitGuess,
  currentGuess,
  setCurrentGuess,
  submitting,
  error,
  success,
  isCompleted,
  score,
  isOverlayOpen = false,
  onShowHint,
  onGiveUp,
  explainerMode,
}: Props) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const inputRef = useRef<HTMLInputElement>(null)
  const prevSubmittingRef = useRef<boolean>(false)

  // Refocus input after submission completes (when submitting changes from true to false)
  useEffect(() => {
    if (prevSubmittingRef.current && !submitting && !isCompleted) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
    prevSubmittingRef.current = submitting
  }, [submitting, isCompleted])

  if (isMobile && isOverlayOpen) {
    return null
  }

  return (
    <Card
      sx={
        isMobile
          ? {
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 0,
              zIndex: theme.zIndex.drawer + 1,
              boxShadow: '0 -8px 24px rgba(15, 23, 42, 0.25)',
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }
          : {}
      }
    >
      <CardContent
        sx={{
          py: 2,
          px: { xs: 2.25, sm: 3 },
          width: '100%',
          mx: isMobile ? 'auto' : 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
            gap: 1,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Guess a Word
          </Typography>
          {explainerMode && <GameExplainerDialog mode={explainerMode} />}
        </Box>

        {isCompleted ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <TrophyIcon className="w-12 h-12 mx-auto mb-3" style={{ color: Color.TROPHY }} />
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              Game Complete!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Final Score: {score} points
            </Typography>
            <Button
              onClick={() => navigate('/')}
              variant="contained"
              size="medium"
              startIcon={<PlayIcon className="w-4 h-4" />}
              sx={{ textTransform: 'none' }}
            >
              Play Again
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmitGuess} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              inputRef={inputRef}
              fullWidth
              label="Enter a word that appears in news headlines:"
              value={currentGuess}
              onChange={e => setCurrentGuess(e.target.value)}
              placeholder="Type a word..."
              variant="outlined"
              size="small"
              disabled={submitting}
              helperText={WORD_RULES_HELPER_TEXT}
              sx={{ '& .MuiInputBase-input': { fontSize: '1rem' } }}
            />

            {error && (
              <Alert severity="error" sx={{ py: 0.5 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ py: 0.5 }}>
                {success}
              </Alert>
            )}

            <Stack direction="row" spacing={1}>
              <Button
                type="submit"
                variant="contained"
                size="medium"
                disabled={submitting || !currentGuess.trim()}
                sx={{ textTransform: 'none', py: 1, flex: 1 }}
              >
                {submitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LoadingSpinner size="sm" />
                    Submitting...
                  </Box>
                ) : (
                  'Submit Guess'
                )}
              </Button>
              {onShowHint && (
                <Button
                  variant="outlined"
                  size="medium"
                  disabled={isCompleted || submitting}
                  onClick={() => onShowHint(HintType.FILL_BLANK)}
                  startIcon={<LightBulbIcon className="w-4 h-4" />}
                  sx={{ textTransform: 'none', py: 1 }}
                >
                  Hint
                </Button>
              )}
              {onGiveUp && (
                <Button
                  variant="outlined"
                  size="medium"
                  disabled={isCompleted || submitting}
                  onClick={onGiveUp}
                  startIcon={<XCircleIcon className="w-4 h-4" />}
                  sx={{
                    textTransform: 'none',
                    py: 1,
                    color: 'error.main',
                    borderColor: 'error.main',
                    '&:hover': { borderColor: 'error.dark', backgroundColor: '#F6A3A2' },
                  }}
                >
                  Give Up
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default WordInput
