import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameAPI } from '../services/api'
import { Color, GameState, Guess, ScoreboardEntry, TIME_PERIOD_NAMES, NewsSourceConfig } from '../types'
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
  Avatar,
  Stack,
  Container
} from '@mui/material'
import { Close as CloseIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material'
import { 
  TrophyIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

import testData from '../components/test_data.json'

// Extract the test data from the JSON file with proper typing
// @ts-ignore
const TEST_DATA: ScoreboardEntry[] = testData[0].results

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()

  const navigate = useNavigate()
  
  // Check if this is test mode
  const isTestMode = gameId === 'test'
  
  // Game state variables
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([])
  const [guesses, setGuesses] = useState<Guess[]>([]) // Words submitted by player
  const [guessedWords, setGuessedWords] = useState<Set<string>>(new Set()) // Correct guesses
  const [wrongGuesses, setWrongGuesses] = useState(0) // Number of wrong guesses
  const [score, setScore] = useState(0)
  
  // Action state variables
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentGuess, setCurrentGuess] = useState('')
  const [error, setError] = useState('') // Incorrect guess message
  const [success, setSuccess] = useState('') // Correct guess message
  
  // Article panel state
  const [selectedWordData, setSelectedWordData] = useState<ScoreboardEntry | null>(null)
  const [currentPage, setCurrentPage] = useState(0) // Pagination state
  const articlesPerPage = 10
  
  // Refs and state for height management
  const [showScoreboard, setShowScoreboard] = useState(false)
  const scoreboardRef = useRef<HTMLDivElement>(null)
  const [scoreboardHeight, setScoreboardHeight] = useState<number>(0)

  // Calculate score based on index and total scoreboard length
  const calculateScore = (index: number, totalLength: number): number => {
    return Math.round(1000 * (1 - (index / totalLength)))
  }

  useEffect(() => {
    if (gameId) {
      loadGame()
    }
  }, [gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to measure scoreboard height
  useEffect(() => {
    const updateScoreboardHeight = () => {
      if (scoreboardRef.current) {
        const height = scoreboardRef.current.offsetHeight
        setScoreboardHeight(height)
      }
    }

    // Initial measurement
    updateScoreboardHeight()

    // Set up ResizeObserver to watch for changes
    const resizeObserver = new ResizeObserver(updateScoreboardHeight)
    if (scoreboardRef.current) {
      resizeObserver.observe(scoreboardRef.current)
    }

    // Also update when scoreboard content changes
    const timeoutId = setTimeout(updateScoreboardHeight, 100)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timeoutId)
    }
  }, [scoreboard, showScoreboard, gameState?.guesses])

  const loadGame = async () => {
    try {
      setLoading(true)

      if (isTestMode) {
        const gameState: GameState = {
          id: 'test',
          time_period: 'past_week',
          sources: [],
          score,
          guesses,
          guessed_words: guessedWords,
          remaining_guesses: 3 - wrongGuesses,
          is_completed: false,
          max_guesses: 3,
          scoreboard_size: 10
        }

        const scoreboard: ScoreboardEntry[] = TEST_DATA

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
      const guessWord = currentGuess.trim().toLowerCase()

      // If the word has already been guessed, don't count it
      if (gameState!.guesses.some(guess => guess.word === guessWord)) {
        setError(`"${currentGuess}" has already been guessed`)
        return
      }

      const foundWord = scoreboard.find(entry => entry.word === guessWord)

      let index: number | undefined
      let wordScore: number
      let updatedScore = score
      let updatedGuessedWords = new Set(Array.from(guessedWords))
      let updatedWrongGuesses = wrongGuesses
      
      if (foundWord) {
        index = scoreboard.findIndex(entry => entry.word === guessWord)
        wordScore = calculateScore(index, scoreboard.length)

        updatedScore += wordScore
        setScore(updatedScore)
        updatedGuessedWords.add(guessWord)
        setGuessedWords(updatedGuessedWords)
      } else {
        index = undefined
        wordScore = 0

        updatedWrongGuesses += 1
        setWrongGuesses(updatedWrongGuesses)
      }

      const newGuess: Guess = {
        id: `${Date.now()}`,
        game_id: gameId,
        user_id: 'test-user',
        word: guessWord,
        frequency: foundWord ? foundWord.frequency : 0,
        score: wordScore,
        rank: index !== undefined ? index + 1 : undefined,
        created_at: new Date().toISOString()
      }

      const updatedGuesses = [...guesses, newGuess]
      setGuesses(updatedGuesses)

      // Update gameState through setGameState to trigger re-render
      setGameState(prev => prev ? {
        ...prev,
        score: updatedScore,
        guesses: updatedGuesses,
        guessedWords: updatedGuessedWords,
        remainingGuesses: prev.max_guesses - updatedWrongGuesses
      } : null)
      setCurrentGuess('')

      if (foundWord) {
        setSuccess(`"${currentGuess}" found! +${wordScore} points`)
      } else {
        setError(`"${currentGuess}" not found in the word list`)
      }

      // Check if game is over - too many wrong guesses, or guessed all words on scoreboard
      if (gameState!.max_guesses === updatedWrongGuesses || gameState!.scoreboard_size === updatedGuessedWords.size) {
        setGameState(prev => prev ? { ...prev, isCompleted: true } : null)
        setTimeout(() => {
          endGame()
        }, 2000)
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to submit guess')
    } finally {
      setSubmitting(false)
    }
  }

  const endGame = async () => {
    if (!gameId) return
    
    try {
      await gameAPI.endGame(gameId)
    } catch (error) {
      console.error('Failed to end game:', error)
    }
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
      setCurrentPage(0) // Reset to first page when selecting a new word
    }
  }

  const closeArticlePanel = () => {
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
    <Container maxWidth="xl">
      {/* Main 3-Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column - Header Info, Game Stats & Recent Guesses */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack spacing={2} sx={{ 
            height: scoreboardHeight > 0 ? `${scoreboardHeight}px` : '100%',
            maxHeight: scoreboardHeight > 0 ? `${scoreboardHeight}px` : 'none'
          }}>
            {/* Game Information */}
            <Card>
              <CardContent sx={{ py: 2 }}>
                <Stack spacing={2}>
                  {/* Navigation and Title */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outlined"
                      size="small"
                      startIcon={<ArrowLeftIcon className="w-4 h-4" />}
                      sx={{ textTransform: 'none' }}
                    >
                      Back to Home
                    </Button>
                    <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Newswordy
                    </Typography>
                  </Box>
                  
                  {/* Time Period Info */}
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Selected Time Period
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                      {isTestMode ? 'September 2nd - September 8th' : TIME_PERIOD_NAMES[gameState.time_period as keyof typeof TIME_PERIOD_NAMES]}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Game Stats */}
            <Card>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                  Game Statistics
                </Typography>
                <Stack spacing={1.5}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 1.5, 
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${Color.GRADIENT_BLUE_START} 0%, ${Color.GRADIENT_BLUE_END} 100%)`
                    }}
                  >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                      {gameState.score}
                    </Typography>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium' }}>
                      Total Score
                    </Typography>
                  </Paper>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 1.5, 
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${Color.GRADIENT_GREEN_START} 0%, ${Color.GRADIENT_GREEN_END} 100%)`
                    }}
                  >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'success.main', mb: 0.5 }}>
                      {gameState.guessed_words.size}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                      Word{gameState.guessed_words.size === 1 ? null : 's'} Guessed
                    </Typography>
                  </Paper>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 1.5, 
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${Color.GRADIENT_PURPLE_START} 0%, ${Color.GRADIENT_PURPLE_END} 100%)`
                    }}
                  >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 0.5 }}>
                      {gameState.remaining_guesses}
                    </Typography>
                    <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 'medium' }}>
                      Wrong Guess{gameState.remaining_guesses === 1 ? null : 'es'} Left
                    </Typography>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Guesses */}
            {gameState.guesses.length > 0 && (
              <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <CardContent sx={{ py: 2, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1.5, flexShrink: 0 }}>
                    Your Guesses
                  </Typography>
                  <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                    <Stack spacing={1}>
                      {gameState.guesses.map((guess, index) => (
                        <Paper
                          key={guess.id}
                          elevation={1}
                          sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'semibold' }}>
                              {guess.word}
                            </Typography>
                            <Chip
                              label={guess.rank !== undefined ? `#${guess.rank}` : `X`}
                              size="small"
                              color={guess.rank === 1 ? 'success' : guess.rank === 2 ? 'default' : guess.rank === 3 ? 'warning' : guess.rank !== undefined ? 'primary' : 'error'}
                            />
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: guess.rank !== undefined ? Color.SCORE_HIGH : Color.ERROR
                            }}
                          >
                            +{guess.score}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* Middle Column - Word Input & Scoreboard */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={3} ref={scoreboardRef}>
            {/* Word Input Section */}
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
                
                <Stack spacing={1}>
                  {scoreboard.slice(0, showScoreboard ? scoreboard.length : 10).map((entry, index) => {
                    const showWord = guessedWords.has(entry.word.toLowerCase()) || gameState.is_completed
                    return (
                      <Paper
                        key={entry.word}
                        elevation={showWord ? 2 : 1}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: showWord ? 'pointer' : 'default',
                          minHeight: '48px',
                          '&:hover': showWord ? {
                            backgroundColor: 'action.hover',
                            transform: 'translateY(-1px)',
                            transition: 'all 0.2s ease-in-out'
                          } : {}
                        }}
                        onClick={showWord ? () => handleWordClick(entry.word) : undefined}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 20,
                              height: 20,
                              fontSize: '0.7rem',
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
                              color: showWord ? 'text.primary' : 'text.disabled',
                              minWidth: '120px'
                            }}
                          >
                            {showWord ? entry.word.toUpperCase() : '???'.repeat(entry.word.length)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: showWord ? 'text.primary' : 'text.disabled',
                              minWidth: '40px',
                              textAlign: 'right'
                            }}
                          >
                            {calculateScore(index, scoreboard.length)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={showWord ? 'text.secondary' : 'text.disabled'}
                            sx={{ minWidth: '90px', textAlign: 'right' }}
                          >
                            {`${showWord ? entry.frequency : '???'} mentions`}
                          </Typography>
                        </Box>
                      </Paper>
                    )
                  })}
                </Stack>
                
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
        </Grid>

        {/* Right Column - Article Info */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Card sx={{ 
            height: scoreboardHeight > 0 ? `${scoreboardHeight}px` : '100%',
            maxHeight: scoreboardHeight > 0 ? `${scoreboardHeight}px` : 'none'
          }}>
            <CardContent sx={{ py: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {selectedWordData ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                      Articles for "{selectedWordData.word.toUpperCase()}"
                    </Typography>
                    <IconButton
                      onClick={closeArticlePanel}
                      size="small"
                      sx={{ color: 'text.secondary' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      {selectedWordData.articles
                        .slice(currentPage * articlesPerPage, (currentPage + 1) * articlesPerPage)
                        .map((article, index) => (
                        <Paper
                          key={currentPage * articlesPerPage + index}
                          elevation={1}
                          sx={{ p: 1.5, '&:hover': { elevation: 3 } }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            {/* Source Icon */}
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'primary.light',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                flexShrink: 0
                              }}
                            >
                              {NewsSourceConfig[article.source].logo}
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
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  fontSize: '0.8rem',
                                  lineHeight: 1.3,
                                  '&:hover': {
                                    color: 'primary.main',
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                {article.headline}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
                                {new Date(article.published_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                              <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                                {NewsSourceConfig[article.source].name}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                    
                    {/* Pagination Controls */}
                    {selectedWordData.articles.length > articlesPerPage && (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mt: 2, 
                        pt: 2, 
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0
                      }}>
                        <Typography variant="caption" color="text.secondary">
                          Showing {currentPage * articlesPerPage + 1}-{Math.min((currentPage + 1) * articlesPerPage, selectedWordData.articles.length)} of {selectedWordData.articles.length}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            sx={{ 
                              width: 24, 
                              height: 24,
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <ChevronLeftIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            disabled={(currentPage + 1) * articlesPerPage >= selectedWordData.articles.length}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            sx={{ 
                              width: 24, 
                              height: 24,
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <ChevronRightIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '200px'
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Click on a guessed word to see related articles
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Game
