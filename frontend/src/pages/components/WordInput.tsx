import { TrophyIcon } from "@heroicons/react/24/outline"
import { Box, Button, Card, CardContent, TextField, Typography, Alert } from "@mui/material"
import { PlayIcon } from "@heroicons/react/24/outline"
import LoadingSpinner from "../../components/LoadingSpinner"
import { useNavigate } from "react-router-dom"
import { Color, GameState, CompareGameState } from "../../types"
import { useRef, useEffect } from "react"

interface Props {
  gameState: GameState | CompareGameState
  handleSubmitGuess: (e: React.FormEvent<HTMLFormElement>) => void
  currentGuess: string
  setCurrentGuess: (guess: string) => void
  submitting: boolean
  error: string
  success: string
}

const WordInput = ({ gameState, handleSubmitGuess, currentGuess, setCurrentGuess, submitting, error, success }: Props) => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const prevSubmittingRef = useRef<boolean>(false)

  // Refocus input after submission completes (when submitting changes from true to false)
  useEffect(() => {
    if (prevSubmittingRef.current && !submitting && !gameState.is_completed) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
    prevSubmittingRef.current = submitting
  }, [submitting, gameState.is_completed])

  return (
    <Card>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
          Guess a Word
        </Typography>
    
        {gameState.is_completed ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <TrophyIcon className="w-12 h-12 mx-auto mb-3" style={{ color: Color.TROPHY }} />
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              Game Complete!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Final Score: {gameState.score} points
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
              onChange={(e) => setCurrentGuess(e.target.value)}
              placeholder="Type a word..."
              variant="outlined"
              size="small"
              disabled={submitting}
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
        
            <Button
              type="submit"
              variant="contained"
              size="medium"
              disabled={submitting || !currentGuess.trim()}
              sx={{ textTransform: 'none', py: 1 }}
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
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default WordInput