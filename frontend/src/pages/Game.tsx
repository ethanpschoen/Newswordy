import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameAPI } from '../services/api'
import { Color, GameState, ScoreboardEntry, TIME_PERIOD_NAMES, NewsSourceConfig, WordData, NewsSource } from '../types'
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Alert, 
  Chip, 
  Grid, 
  Paper, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  List,
  Avatar,
  Stack,
  Container
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { 
  TrophyIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

import testData from '../components/test_data.json'

// Extract the test data from the JSON file with proper typing
const TEST_DATA: WordData[] = testData[0].results

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()

  const navigate = useNavigate()
  
  // Check if this is test mode
  const isTestMode = gameId === 'test'
  
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([])
  const [guessedWords, setGuessedWords] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentGuess, setCurrentGuess] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showScoreboard, setShowScoreboard] = useState(false)
  
  // Article panel state
  const [showArticlePanel, setShowArticlePanel] = useState(false)
  const [selectedWordData, setSelectedWordData] = useState<WordData | null>(null)
  
  // Test mode state
  const [testScore, setTestScore] = useState(0)
  const [testGuesses, setTestGuesses] = useState<any[]>([])
  const [testRemainingGuesses, setTestRemainingGuesses] = useState(3)

  // Calculate score based on index and total scoreboard length
  const calculateScore = (index: number, totalLength: number): number => {
    return Math.round(1000 * (1 - (index / totalLength)))
  }

  useEffect(() => {
    if (gameId) {
      loadGame()
    }
  }, [gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadGame = async () => {
    try {
      setLoading(true)

      if (isTestMode) {
        const gameState: GameState = {
          gameId: 'test',
          timePeriod: 'past_week',
          sources: [],
          score: testScore,
          guesses: testGuesses,
          remainingGuesses: 3,
          isCompleted: false,
          maxGuesses: 3,
          scoreboardSize: 10,
          user: {
            id: 'test-user',
            username: 'Test User'
          }
        }

        const scoreboard: ScoreboardEntry[] = TEST_DATA.map((item, index) => ({
          word: item.word,
          frequency: item.count,
          rank: index + 1
        }))

        setGameState(gameState)
        setScoreboard(scoreboard)
      } else {
        const [gameResponse, scoreboardResponse] = await Promise.all([
          gameAPI.getGameState(gameId!),
          gameAPI.getScoreboard(gameId!)
        ])

        if (gameResponse.success && gameResponse.data) {
          setGameState(gameResponse.data)
          
          // Initialize guessed words from existing guesses
          const initialGuessedWords = new Set(gameResponse.data.guesses.map(guess => guess.word.toLowerCase()))
          setGuessedWords(initialGuessedWords)
        }

        if (scoreboardResponse.success && scoreboardResponse.data) {
          setScoreboard(scoreboardResponse.data.scoreboard)
        }
      }
    } catch (error) {
      console.error('Failed to load game:', error)
      setError('Failed to load game')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentGuess.trim() || !gameId) return

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (isTestMode) {
        // Handle test mode guess
        const guessWord = currentGuess.trim().toLowerCase()
        const foundWord = TEST_DATA.find(item => item.word.toLowerCase() === guessWord)
        
        if (foundWord) {
          const index = TEST_DATA.findIndex(item => item.word.toLowerCase() === guessWord)
          const score = calculateScore(index, TEST_DATA.length)
          const newGuess = {
            id: `test-${Date.now()}`,
            gameId: 'test',
            userId: 'test-user',
            word: guessWord,
            frequency: foundWord.count,
            score: score,
            rank: index + 1,
            createdAt: new Date().toISOString()
          }
          
          setTestScore(prev => prev + score)
          setTestGuesses(prev => [...prev, newGuess])
          setGuessedWords(prev => new Set(Array.from(prev).concat(guessWord)))
          setTestRemainingGuesses(prev => prev - (foundWord ? 0 : 1))
          setSuccess(`"${currentGuess}" found! +${score} points`)
          setCurrentGuess('')
          
          // Check if game is over
          if (testRemainingGuesses - 1 === 0) {
            setTimeout(() => {
              endTestGame()
            }, 2000)
          }
        } else {
          setError(`"${currentGuess}" not found in the word list`)
        }
      } else {
        const response = await gameAPI.submitGuess(gameId, { word: currentGuess.trim() })
        
        if (response.success && response.data) {
          setSuccess(`"${currentGuess}" found! +${response.data.guess.score} points`)
          setCurrentGuess('')
          
          // Add the guessed word to our set
          setGuessedWords(prev => new Set(Array.from(prev).concat(currentGuess.trim().toLowerCase())))
          
          // Reload game state to get updated score and guesses
          await loadGame()
          
          // Check if game is over
          if (response.data.remainingGuesses === 0) {
            setTimeout(() => {
              endGame()
            }, 2000)
          }
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to submit guess')
    } finally {
      setSubmitting(false)
    }
  }

  const endTestGame = () => {
    // For test mode, just redirect to home
    setTimeout(() => {
      navigate('/')
    }, 3000)
  }

  const endGame = async () => {
    if (!gameId) return
    
    if (isTestMode) {
      endTestGame()
      return
    }
    
    try {
      await gameAPI.endGame(gameId)
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Failed to end game:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 800) return Color.SCORE_HIGH
    if (score >= 600) return Color.SCORE_MEDIUM
    if (score >= 400) return Color.SCORE_LOW
    return Color.SCORE_DEFAULT
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return Color.RANK_FIRST_BG
    if (rank === 2) return Color.RANK_SECOND_BG
    if (rank === 3) return Color.RANK_THIRD_BG
    return Color.RANK_DEFAULT_BG
  }

  const handleWordClick = (word: string) => {
    // Find the word data from TEST_DATA
    const wordData = TEST_DATA.find(item => item.word.toLowerCase() === word.toLowerCase())
    if (wordData) {
      setSelectedWordData(wordData)
      setShowArticlePanel(true)
    }
  }

  const closeArticlePanel = () => {
    setShowArticlePanel(false)
    setSelectedWordData(null)
  }

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '50vh'
          }}
        >
          <LoadingSpinner size="lg" />
        </Box>
      </Container>
    )
  }

  if (!gameState) {
    return (
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '50vh',
            textAlign: 'center'
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
            Game Not Found
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
            The game you're looking for doesn't exist.
          </Typography>
          <Button
            onClick={() => navigate('/')}
            variant="contained"
            size="large"
            startIcon={<ArrowLeftIcon className="w-4 h-4" />}
            sx={{ textTransform: 'none' }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      {/* Game Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                onClick={() => navigate('/')}
                variant="outlined"
                startIcon={<ArrowLeftIcon className="w-4 h-4" />}
                sx={{ textTransform: 'none' }}
              >
                Back to Home
              </Button>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Newswordy Game
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Time Period
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                {TIME_PERIOD_NAMES[gameState.timePeriod as keyof typeof TIME_PERIOD_NAMES]}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Stack spacing={4}>
        {/* Word Input Section */}
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Guess a Word
            </Typography>
            
            {gameState.isCompleted ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TrophyIcon className="w-16 h-16 mx-auto mb-4" style={{ color: Color.TROPHY }} />
                <Typography variant="h4" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Game Complete!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Final Score: {gameState.score} points
                </Typography>
                <Button
                  onClick={() => navigate('/')}
                  variant="contained"
                  size="large"
                  startIcon={<PlayIcon className="w-5 h-5" />}
                  sx={{ textTransform: 'none' }}
                >
                  Play Again
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmitGuess} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Enter a word that appears in news headlines:"
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  placeholder="Type a word..."
                  variant="outlined"
                  size="medium"
                  disabled={submitting}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.125rem' } }}
                />
                
                {error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    {success}
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting || !currentGuess.trim()}
                  sx={{ textTransform: 'none', py: 1.5 }}
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

        {/* Scoreboard Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                Top Words
              </Typography>
              {scoreboard.length > 10 && (
                <Button
                  onClick={() => setShowScoreboard(!showScoreboard)}
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  {showScoreboard ? 'Hide' : 'Show'} Full List
                </Button>
              )}
            </Box>
            
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {scoreboard.slice(0, showScoreboard ? scoreboard.length : 10).map((entry, index) => {
                const isGuessed = guessedWords.has(entry.word.toLowerCase())
                return (
                  <Paper
                    key={entry.word}
                    elevation={isGuessed ? 2 : 1}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: isGuessed ? 'pointer' : 'default',
                      '&:hover': isGuessed ? {
                        backgroundColor: 'action.hover',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease-in-out'
                      } : {}
                    }}
                    onClick={isGuessed ? () => handleWordClick(entry.word) : undefined}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          bgcolor: getRankColor(index + 1),
                          color: 'black'
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          fontWeight: 'medium',
                          color: isGuessed ? 'text.primary' : 'text.disabled'
                        }}
                      >
                        {isGuessed ? entry.word.toUpperCase() : '???'.repeat(entry.word.length)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: isGuessed ? 'text.primary' : 'text.disabled'
                        }}
                      >
                        {calculateScore(index, scoreboard.length)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={isGuessed ? 'text.secondary' : 'text.disabled'}
                      >
                        {isGuessed ? `${entry.frequency} mentions` : '???'}
                      </Typography>
                    </Box>
                  </Paper>
                )
              })}
            </List>
            
            {!showScoreboard && scoreboard.length > 10 && (
              <Button
                onClick={() => setShowScoreboard(true)}
                fullWidth
                sx={{ mt: 2, textTransform: 'none' }}
              >
                Show {scoreboard.length - 10} more words...
              </Button>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Game Stats */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
            Game Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${Color.GRADIENT_BLUE_START} 0%, ${Color.GRADIENT_BLUE_END} 100%)`
                }}
              >
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  {gameState.score}
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium' }}>
                  Total Score
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${Color.GRADIENT_GREEN_START} 0%, ${Color.GRADIENT_GREEN_END} 100%)`
                }}
              >
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                  {gameState.guesses.length - gameState.maxGuesses + gameState.remainingGuesses}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                  Words Guessed
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${Color.GRADIENT_PURPLE_START} 0%, ${Color.GRADIENT_PURPLE_END} 100%)`
                }}
              >
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 1 }}>
                  {gameState.remainingGuesses}
                </Typography>
                <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 'medium' }}>
                  Wrong Guesses Left
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${Color.GRADIENT_ORANGE_START} 0%, ${Color.GRADIENT_ORANGE_END} 100%)`
                }}
              >
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 1 }}>
                  {gameState.maxGuesses}
                </Typography>
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'medium' }}>
                  Max Guesses
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Guesses Section */}
      {gameState.guesses.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Your Guesses
            </Typography>
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {gameState.guesses.map((guess, index) => (
                <Paper
                  key={guess.id}
                  elevation={1}
                  sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                      {guess.word}
                    </Typography>
                    <Chip
                      label={guess.rank !== undefined ? `#${guess.rank}` : `X`}
                      size="small"
                      color={guess.rank === 1 ? 'success' : guess.rank === 2 ? 'default' : guess.rank === 3 ? 'warning' : guess.rank !== undefined ? 'primary' : 'error'}
                    />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: getScoreColor(guess.score)
                      }}
                    >
                      +{guess.score}
                    </Typography>
                    {guess.rank !== undefined && 
                      <Typography variant="body2" color="text.secondary">
                        Frequency: {guess.frequency}
                      </Typography>
                    }
                  </Box>
                </Paper>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Article Panel */}
      <Dialog
        open={showArticlePanel}
        onClose={closeArticlePanel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            right: 0,
            top: 0,
            height: '100vh',
            width: '400px',
            maxWidth: '100vw',
            margin: 0,
            borderRadius: 0
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Articles for "{selectedWordData?.word.toUpperCase()}"
          </Typography>
          <IconButton
            onClick={closeArticlePanel}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              {selectedWordData?.articles.map((article, index) => (
                <Paper
                  key={index}
                  elevation={1}
                  sx={{ p: 2, '&:hover': { elevation: 3 } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Source Icon */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.light',
                        borderRadius: '50%',
                        overflow: 'hidden'
                      }}
                    >
                      {NewsSourceConfig[article.source as NewsSource].logo}
                    </Box>
                    
                    {/* Article Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        component="a"
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{
                          fontWeight: 'medium',
                          color: 'text.primary',
                          textDecoration: 'none',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          '&:hover': {
                            color: 'primary.main',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {article.headline}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {new Date(article.published_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                      <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5 }}>
                        {NewsSourceConfig[article.source as NewsSource].name}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default Game
