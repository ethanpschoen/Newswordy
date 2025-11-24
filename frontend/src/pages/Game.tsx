import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gameAPI, userAPI } from '../services/api'
import { GameState, Guess, NewsSource, ScoreboardEntry, HintType, ExplainerMode } from '../types'
import { Box, Button, Typography, Grid, Stack, Container, useMediaQuery, useTheme } from '@mui/material'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

import GameInfo from './components/GameInfo'
import WordInput from './components/WordInput'
import Scoreboard, { calculateScore } from './components/Scoreboard'
import GameStats from './components/GameStats'
import GuessList from './components/GuessList'
import ArticleInfo from './components/ArticleInfo'
import HintModal from './components/HintModal'

import testData from '../components/test_data.json'

// Extract the test data from the JSON file
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

  // Hint state
  const [hintModalOpen, setHintModalOpen] = useState(false)
  const [currentHintWord, setCurrentHintWord] = useState<ScoreboardEntry | null>(null)
  const [hintType, setHintType] = useState<HintType>(HintType.FILL_BLANK)
  const [hintedWords, setHintedWords] = useState<string[]>([])

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

      // If in test mode, use hard-coded test data
      if (isTestMode) {
        const gameState: GameState = {
          id: 'test',
          time_period: 'past_week',
          sources: Object.values(NewsSource),
          score: 0,
          guesses: [],
          guessed_words: [],
          remaining_guesses: 3,
          is_completed: false,
          max_guesses: 3,
          scoreboard_size: 10,
        }

        const scoreboard: ScoreboardEntry[] = TEST_DATA

        setGameState(gameState)
        setScoreboard(scoreboard)
      } else {
        // Get game state from database
        const gameResponse = await gameAPI.getGameState(gameId || '')

        if (gameResponse.error) {
          console.error('Failed to load game:', gameResponse.error)
        }

        const game = gameResponse.data
        setGameState(game)

        // Get top words from database
        const scoreboardResponse = await gameAPI.getScoreboard(
          game.time_period,
          game.sources,
          game.scoreboard_size,
          new Date(game.created_at),
        )

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
        setSubmitting(false)
        return
      }

      const foundWord = scoreboard.find(entry => entry.word === guessWord)

      let index: number | undefined
      let wordScore: number
      let wasHinted: boolean = false
      let updatedScore = gameState?.score || 0
      let updatedGuessedWords = gameState?.guessed_words || []
      let updatedRemainingGuesses = gameState?.remaining_guesses || 0

      if (foundWord) {
        index = scoreboard.findIndex(entry => entry.word === guessWord)
        const baseScore = calculateScore(index, scoreboard.length)

        // Check if word was hinted - if so, award half points
        wasHinted = hintedWords.includes(guessWord)
        wordScore = wasHinted ? Math.round(baseScore / 2) : baseScore

        updatedScore += wordScore
        updatedGuessedWords.push(guessWord)
      } else {
        index = undefined
        wordScore = 0

        // Handle unlimited guesses: subtract points instead of decrementing guesses
        if (updatedRemainingGuesses === -1) {
          wordScore = updatedScore >= 50 ? -50 : updatedScore <= 0 ? 0 : -updatedScore
          updatedScore += wordScore
        } else {
          updatedRemainingGuesses -= 1
        }
      }

      const newGuess: Guess = {
        id: `${Date.now()}`,
        game_id: gameId,
        user_id: user?.sub || 'anonymous',
        word: guessWord,
        frequency: foundWord ? foundWord.frequency : 0,
        score: wordScore,
        rank: index !== undefined ? index + 1 : undefined,
        created_at: new Date().toISOString(),
      }

      const updatedGuesses = [...(gameState?.guesses || []), newGuess]

      const updatedGameState = {
        ...gameState!,
        score: updatedScore,
        guesses: updatedGuesses,
        guessed_words: updatedGuessedWords,
        remaining_guesses: updatedRemainingGuesses,
      }

      // Update gameState through setGameState to trigger re-render
      setGameState(prev =>
        prev
          ? {
              ...prev,
              ...updatedGameState,
            }
          : null,
      )

      setCurrentGuess('')

      if (foundWord) {
        const message = wasHinted
          ? `"${currentGuess}" found! +${wordScore} points (hint used)`
          : `"${currentGuess}" found! +${wordScore} points`
        setSuccess(message)
      } else {
        if (updatedRemainingGuesses === -1 && wordScore < 0) {
          setError(`"${currentGuess}" not found in the word list. ${wordScore} points`)
        } else {
          setError(`"${currentGuess}" not found in the word list`)
        }
      }

      // Check if game is over - too many wrong guesses (unless unlimited), or guessed all words on scoreboard
      if (
        (updatedRemainingGuesses !== -1 && updatedRemainingGuesses <= 0) ||
        gameState!.scoreboard_size <= updatedGuessedWords.length
      ) {
        setGameState(prev => (prev ? { ...prev, is_completed: true } : null))
        updatedGameState.is_completed = true
      }

      if (!isTestMode) {
        await gameAPI.submitGuess(newGuess)
      }

      let { guesses: _, ...updatedGame } = updatedGameState

      if (updatedGame.is_completed) {
        // @ts-ignore
        updatedGame.completed_at = new Date().toISOString()

        // Update user stats
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

  const handleGiveUp = async () => {
    if (!gameState || gameState.is_completed || !gameId) return

    try {
      setSubmitting(true)

      const updatedGameState = {
        ...gameState,
        is_completed: true,
        // @ts-ignore
        completed_at: new Date().toISOString(),
      }

      // Update local state
      setGameState(updatedGameState)

      // Update user stats
      if (isAuthenticated && !isTestMode) {
        const userStats = await userAPI.getSingleUser(user?.sub || '')
        const stats = userStats.data
        const newStats = structuredClone(stats)

        newStats.total_score += updatedGameState.score
        newStats.total_games += 1
        newStats.average_score = newStats.total_score / newStats.total_games
        newStats.best_score = Math.max(newStats.best_score, updatedGameState.score)
        newStats.updated_at = new Date().toISOString()

        await userAPI.updateUser(newStats, user?.sub || '')
      }

      // Update game state in database
      if (!isTestMode) {
        let { guesses: _, ...updatedGame } = updatedGameState
        await gameAPI.updateGameState(updatedGame, updatedGame.id)
      }
    } catch (error: any) {
      console.error('Failed to give up game:', error)
      setError(error.response?.data?.error || 'Failed to end game')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWordClick = (word: string) => {
    // Find the word data from scoreboard
    const wordData = scoreboard.find(item => item.word.toLowerCase() === word.toLowerCase())
    if (wordData) {
      setSelectedWordData(wordData)
      setCurrentPage(0) // Reset to first page when selecting a new word
    }
  }

  const handleHintClick = (word: string) => {
    const wordLower = word.toLowerCase()
    const wordData = scoreboard.find(item => item.word.toLowerCase() === wordLower)
    if (!wordData) return
    setCurrentHintWord(wordData)
    setHintModalOpen(true)
  }

  const closeArticlePanel = () => {
    setSelectedWordData(null)
  }

  // Select a hint word with equal probability (no weights)
  const selectHintWord = (): ScoreboardEntry | null => {
    // Filter for unguessed words that haven't been hinted yet
    const availableWords = scoreboard.filter(entry => {
      const wordLower = entry.word.toLowerCase()
      return !gameState?.guessed_words.includes(wordLower) && !hintedWords.includes(wordLower)
    })

    if (availableWords.length === 0) {
      return null
    }

    // Select random word with equal probability
    const randomIndex = Math.floor(Math.random() * availableWords.length)
    return availableWords[randomIndex]
  }

  const handleShowHint = (type: HintType) => {
    const hintWord = selectHintWord()
    if (hintWord) {
      setCurrentHintWord(hintWord)
      setHintType(type)
      // Add word to hinted words list when hint is shown
      setHintedWords(prev => {
        if (!prev.includes(hintWord.word.toLowerCase())) {
          return [...prev, hintWord.word.toLowerCase()]
        }
        return prev
      })
      setHintModalOpen(true)
    } else {
      // No more hints are available
      setError('No more hints are available. Select a hinted word to fill in the blank!')
    }
  }

  const handleCloseHintModal = () => {
    setHintModalOpen(false)
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
            minHeight: '50vh',
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
            textAlign: 'center',
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
      <Container maxWidth="xl" sx={{ pb: 18 }}>
        <Grid container spacing={2}>
          {/* Game Info */}
          <Grid size={{ xs: 12 }} sx={{ order: 1 }}>
            <GameInfo isTestMode={isTestMode} timePeriod={gameState.time_period} />
          </Grid>

          {/* Scoreboard */}
          <Grid size={{ xs: 12 }} sx={{ order: 2 }} ref={scoreboardRef}>
            <Scoreboard
              scoreboard={scoreboard}
              sources={gameState.sources}
              showScoreboard={showScoreboard}
              setShowScoreboard={setShowScoreboard}
              isCompleted={gameState.is_completed}
              guessedWords={gameState.guessed_words}
              handleWordClick={handleWordClick}
              handleHintClick={handleHintClick}
              hintedWords={hintedWords}
            />
          </Grid>

          {/* Game Stats */}
          <Grid size={{ xs: 12 }} sx={{ order: 3 }}>
            <GameStats
              guessedWords={gameState.guessed_words}
              score={gameState.score}
              remainingGuesses={gameState.remaining_guesses}
            />
          </Grid>

          {/* Recent Guesses */}
          {gameState.guesses.length > 0 && (
            <Grid size={{ xs: 12 }} sx={{ order: 4 }}>
              <GuessList guesses={gameState.guesses} />
            </Grid>
          )}

          {/* Word Guess - Fixed bar */}
          <Grid size={{ xs: 12 }} sx={{ order: 5 }}>
            <WordInput
              handleSubmitGuess={handleSubmitGuess}
              currentGuess={currentGuess}
              setCurrentGuess={setCurrentGuess}
              submitting={submitting}
              error={error}
              success={success}
              isCompleted={gameState.is_completed}
              score={gameState.score}
              isOverlayOpen={Boolean(selectedWordData)}
              onShowHint={handleShowHint}
              onGiveUp={handleGiveUp}
              explainerMode={ExplainerMode.CLASSIC}
            />
          </Grid>

          {/* Article Info */}
          <ArticleInfo
            selectedWordData={selectedWordData}
            currentPage={currentPage}
            articlesPerPage={articlesPerPage}
            setCurrentPage={setCurrentPage}
            closeArticlePanel={closeArticlePanel}
          />
        </Grid>

        {/* Hint Modal */}
        <HintModal
          open={hintModalOpen}
          onClose={handleCloseHintModal}
          hintWord={currentHintWord}
          hintType={hintType}
          onHintTypeChange={setHintType}
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      {/* Main 3-Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column - Header Info, Game Stats & Recent Guesses */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack
            spacing={2}
            sx={{
              height: scoreboardHeight > 0 ? `${scoreboardHeight}px` : '100%',
              maxHeight: scoreboardHeight > 0 ? `${scoreboardHeight}px` : 'none',
            }}
          >
            {/* Game Information */}
            <GameInfo isTestMode={isTestMode} timePeriod={gameState.time_period} />

            {/* Game Stats */}
            <GameStats
              guessedWords={gameState.guessed_words}
              score={gameState.score}
              remainingGuesses={gameState.remaining_guesses}
            />

            {/* Recent Guesses */}
            <GuessList guesses={gameState.guesses} />
          </Stack>
        </Grid>

        {/* Middle Column - Word Input & Scoreboard */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={3} ref={scoreboardRef}>
            {/* Word Input Section */}
            <WordInput
              handleSubmitGuess={handleSubmitGuess}
              currentGuess={currentGuess}
              setCurrentGuess={setCurrentGuess}
              submitting={submitting}
              error={error}
              success={success}
              isCompleted={gameState.is_completed}
              score={gameState.score}
              isOverlayOpen={Boolean(selectedWordData)}
              onShowHint={handleShowHint}
              onGiveUp={handleGiveUp}
              explainerMode={ExplainerMode.CLASSIC}
            />

            {/* Scoreboard Section */}
            <Scoreboard
              scoreboard={scoreboard}
              sources={gameState.sources}
              showScoreboard={showScoreboard}
              setShowScoreboard={setShowScoreboard}
              isCompleted={gameState.is_completed}
              guessedWords={gameState.guessed_words}
              handleWordClick={handleWordClick}
              handleHintClick={handleHintClick}
              hintedWords={hintedWords}
            />
          </Stack>
        </Grid>

        {/* Right Column - Article Info */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <ArticleInfo
            selectedWordData={selectedWordData}
            currentPage={currentPage}
            articlesPerPage={articlesPerPage}
            setCurrentPage={setCurrentPage}
            closeArticlePanel={closeArticlePanel}
            scoreboardHeight={scoreboardHeight}
          />
        </Grid>
      </Grid>

      {/* Hint Modal */}
      <HintModal
        open={hintModalOpen}
        onClose={handleCloseHintModal}
        hintWord={currentHintWord}
        hintType={hintType}
        onHintTypeChange={setHintType}
      />
    </Container>
  )
}

export default Game
