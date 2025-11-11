import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gameAPI, userAPI } from '../services/api'
import { GameState, Guess, ScoreboardEntry } from '../types'
import { 
  Box,
  Button,
  Typography,
  Grid,
  Stack,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

import GameInfo from './components/GameInfo'
import WordInput from './components/WordInput'
import Scoreboard, { calculateScore } from './components/Scoreboard'
import GameStats from './components/GameStats'
import GuessList from './components/GuessList'
import ArticleInfo from './components/ArticleInfo'

import testData from '../components/test_data.json'

// Extract the test data from the JSON file with proper typing
// @ts-ignore
const TEST_DATA: ScoreboardEntry[] = testData[0].results

const Game: React.FC = () => {
  const { isAuthenticated, user } = useAuth0()

  const { gameId } = useParams<{ gameId: string }>()

  const navigate = useNavigate()
  
  // Check if this is test mode
  const isTestMode = gameId === 'test'
  
  // Game state variables
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([])
  
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
          score: 0,
          guesses: [],
          guessed_words: new Set(),
          remaining_guesses: 3,
          is_completed: false,
          max_guesses: 3,
          scoreboard_size: 10
        }

        const scoreboard: ScoreboardEntry[] = TEST_DATA

        setGameState(gameState)
        setScoreboard(scoreboard)
      } else {
        const gameResponse = await gameAPI.getGameState(gameId || '')

        if (gameResponse.error) {
          console.error('Failed to load game:', gameResponse.error)
        }

        const game = gameResponse.data
        game.guessed_words = new Set(game.guessed_words)
        setGameState(game)

        const scoreboardResponse = await gameAPI.getScoreboard(game.time_period, game.sources, game.scoreboard_size, new Date(game.created_at))

        if (scoreboardResponse.error) {
          console.error('Failed to fetch scoreboard', scoreboardResponse.error)
        }

        const board = scoreboardResponse.data
        setScoreboard(board)
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
      let updatedScore = gameState?.score || 0
      let updatedGuessedWords = new Set<string>(Array.from(gameState?.guessed_words || new Set()))
      let updatedRemainingGuesses = gameState?.remaining_guesses || 0
      
      if (foundWord) {
        index = scoreboard.findIndex(entry => entry.word === guessWord)
        wordScore = calculateScore(index, scoreboard.length)

        updatedScore += wordScore
        updatedGuessedWords.add(guessWord)
      } else {
        index = undefined
        wordScore = 0

        updatedRemainingGuesses -= 1
      }

      const newGuess: Guess = {
        id: `${Date.now()}`,
        game_id: gameId,
        user_id: user?.sub || 'anonymous',
        word: guessWord,
        frequency: foundWord ? foundWord.frequency : 0,
        score: wordScore,
        rank: index !== undefined ? index + 1 : undefined,
        created_at: new Date().toISOString()
      }

      const updatedGuesses = [...gameState?.guesses || [], newGuess]

      const updatedGameState = {
        ...gameState!,
        score: updatedScore,
        guesses: updatedGuesses,
        guessed_words: updatedGuessedWords,
        remaining_guesses: updatedRemainingGuesses
      }

      // Update gameState through setGameState to trigger re-render
      setGameState(prev => prev ? {
        ...prev,
        ...updatedGameState
      } : null)

      setCurrentGuess('')

      if (foundWord) {
        setSuccess(`"${currentGuess}" found! +${wordScore} points`)
      } else {
        setError(`"${currentGuess}" not found in the word list`)
      }

      // Check if game is over - too many wrong guesses, or guessed all words on scoreboard
      if (updatedRemainingGuesses <= 0 || gameState!.scoreboard_size <= updatedGuessedWords.size) {
        setGameState(prev => prev ? { ...prev, is_completed: true } : null)
        updatedGameState.is_completed = true
      }

      if (!isTestMode) {
        await gameAPI.submitGuess(newGuess)
      }

      let { guesses: _, ...updatedGame } = updatedGameState
      
      // @ts-ignore
      updatedGame.guessed_words = Array.from(updatedGame.guessed_words)
      if (updatedGame.is_completed) {
        // @ts-ignore
        updatedGame.completed_at = new Date().toISOString()

        if (isAuthenticated && !isTestMode) {
          const userStats = await userAPI.getSingleUser(user?.sub || '')
          const stats = userStats.data
          const newStats = structuredClone(stats)

          newStats.total_score += updatedGame.score
          newStats.total_games += 1
          newStats.average_score = newStats.total_score / newStats.total_games
          newStats.best_score = Math.max(newStats.best_score, updatedGame.score)
          newStats.updated_at = new Date().toISOString()

          await userAPI.updateUser(newStats, user?.sub || '')
        }
      }

      if (!isTestMode) {
        await gameAPI.updateGameState(updatedGame, updatedGame.id)
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to submit guess')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWordClick = (word: string) => {
    // Find the word data from TEST_DATA
    const wordData = scoreboard.find(item => item.word.toLowerCase() === word.toLowerCase())
    if (wordData) {
      setSelectedWordData(wordData)
      setCurrentPage(0) // Reset to first page when selecting a new word
    }
  }

  const closeArticlePanel = () => {
    setSelectedWordData(null)
  }

  const theme = useTheme()
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down('lg'))

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

  if (isNarrowScreen) {
    // Narrow screen layout: stacked in order
    return (
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Game Info */}
          <Grid size={{ xs: 12 }} sx={{ order: 1 }}>
            <GameInfo isTestMode={isTestMode} gameState={gameState} />
          </Grid>

          {/* Word Guess */}
          <Grid size={{ xs: 12 }} sx={{ order: 2 }}>
            <WordInput gameState={gameState} handleSubmitGuess={handleSubmitGuess} currentGuess={currentGuess} setCurrentGuess={setCurrentGuess} submitting={submitting} error={error} success={success} />
          </Grid>

          {/* Scoreboard */}
          <Grid size={{ xs: 12 }} sx={{ order: 3 }} ref={scoreboardRef}>
            <Scoreboard scoreboard={scoreboard} showScoreboard={showScoreboard} setShowScoreboard={setShowScoreboard} gameState={gameState} handleWordClick={handleWordClick} />
          </Grid>

          {/* Game Stats */}
          <Grid size={{ xs: 12 }} sx={{ order: 4 }}>
            <GameStats gameState={gameState} />
          </Grid>

          {/* Recent Guesses */}
          {gameState.guesses.length > 0 && (
            <Grid size={{ xs: 12 }} sx={{ order: 5 }}>
              <GuessList gameState={gameState} />
            </Grid>
          )}

          {/* Article Info */}
          <Grid size={{ xs: 12 }} sx={{ order: 6 }}>
            <ArticleInfo selectedWordData={selectedWordData} currentPage={currentPage} articlesPerPage={articlesPerPage} setCurrentPage={setCurrentPage} closeArticlePanel={closeArticlePanel} />
          </Grid>
        </Grid>
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
            <GameInfo
              isTestMode={isTestMode}
              gameState={gameState}
            />

            {/* Game Stats */}
            <GameStats gameState={gameState} />

            {/* Recent Guesses */}
            {gameState.guesses.length > 0 && (
              <GuessList gameState={gameState} />
            )}
          </Stack>
        </Grid>

        {/* Middle Column - Word Input & Scoreboard */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={3} ref={scoreboardRef}>
            {/* Word Input Section */}
            <WordInput gameState={gameState} handleSubmitGuess={handleSubmitGuess} currentGuess={currentGuess} setCurrentGuess={setCurrentGuess} submitting={submitting} error={error} success={success} />

            {/* Scoreboard Section */}
            <Scoreboard scoreboard={scoreboard} showScoreboard={showScoreboard} setShowScoreboard={setShowScoreboard} gameState={gameState} handleWordClick={handleWordClick} />
          </Stack>
        </Grid>

        {/* Right Column - Article Info */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <ArticleInfo selectedWordData={selectedWordData} currentPage={currentPage} articlesPerPage={articlesPerPage} setCurrentPage={setCurrentPage} closeArticlePanel={closeArticlePanel} scoreboardHeight={scoreboardHeight} />
        </Grid>
      </Grid>
    </Container>
  )
}

export default Game
