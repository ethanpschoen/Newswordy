import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gameAPI, userAPI } from '../services/api'
import {
  CompareGameState,
  Guess,
  ScoreboardEntry,
  ComparativeScoreboardEntry,
  ComparativeGroup,
  HintType,
  ExplainerMode,
} from '../types'
import { Box, Button, Typography, Grid, Stack, Container, useMediaQuery, useTheme } from '@mui/material'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

import GameInfo from './components/GameInfo'
import WordInput from './components/WordInput'
import Scoreboard, { calculateScore } from './components/Scoreboard'
import GameStats from './components/GameStats'
import GuessList from './components/GuessList'
import ArticleInfo from './components/ArticleInfo'
import ComparativeArticleDrawer from './components/ComparativeArticleDrawer'
import HintModal from './components/HintModal'

const CompareGame: React.FC = () => {
  const { isAuthenticated, user } = useAuth0()

  const { compareId: gameId } = useParams<{ compareId: string }>()

  const navigate = useNavigate()

  // Game state variables
  const [gameState, setGameState] = useState<CompareGameState | null>(null)
  const [scoreboard, setScoreboard] = useState<ComparativeScoreboardEntry[]>([])
  const [scoreboardGroupA, setScoreboardGroupA] = useState<ComparativeScoreboardEntry[]>([])
  const [scoreboardGroupB, setScoreboardGroupB] = useState<ComparativeScoreboardEntry[]>([])

  // Action state variables
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentGuess, setCurrentGuess] = useState('')
  const [error, setError] = useState('') // Incorrect guess message
  const [success, setSuccess] = useState('') // Correct guess message

  // Article panel state
  const [selectedWordDataGroupA, setSelectedWordDataGroupA] = useState<ScoreboardEntry | null>(null)
  const [selectedWordDataGroupB, setSelectedWordDataGroupB] = useState<ScoreboardEntry | null>(null)
  const [currentPageGroupA, setCurrentPageGroupA] = useState(0)
  const [currentPageGroupB, setCurrentPageGroupB] = useState(0)
  const articlesPerPage = 10

  // Refs and state for height management
  const [showScoreboard, setShowScoreboard] = useState(false)
  const scoreboardRef = useRef<HTMLDivElement>(null)
  const [scoreboardHeight, setScoreboardHeight] = useState<number>(0)

  // Hint state
  const [hintModalOpen, setHintModalOpen] = useState(false)
  const [currentHintWord, setCurrentHintWord] = useState<ScoreboardEntry | null>(null)
  const [currentHintWordGroupB, setCurrentHintWordGroupB] = useState<ScoreboardEntry | null>(null)
  const [hintedWordsGroupA, setHintedWordsGroupA] = useState<string[]>([])
  const [hintedWordsGroupB, setHintedWordsGroupB] = useState<string[]>([])

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
  }, [scoreboardGroupA, showScoreboard, gameState?.compare_guesses])

  const loadGame = async () => {
    try {
      setLoading(true)

      // Get game state from database
      const gameResponse = await gameAPI.getComparativeGameState(gameId || '')

      if (gameResponse.error) {
        console.error('Failed to load game:', gameResponse.error)
      }

      const game = gameResponse.data
      setGameState(game)

      // Get top words from database
      const scoreboardResponse = await gameAPI.getComparativeScoreboard(
        game.time_period,
        game.sources_group_a,
        game.sources_group_b,
        game.scoreboard_size,
        new Date(game.created_at),
      )

      if (scoreboardResponse.error) {
        console.error('Failed to fetch scoreboard', scoreboardResponse.error)
      }

      const board = scoreboardResponse.data
      setScoreboard(board)
      setScoreboardGroupA(
        board.filter((entry: ComparativeScoreboardEntry) => entry.group_name === ComparativeGroup.GROUP_A),
      )
      setScoreboardGroupB(
        board.filter((entry: ComparativeScoreboardEntry) => entry.group_name === ComparativeGroup.GROUP_B),
      )
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
      if (gameState!.compare_guesses.some(guess => guess.word === guessWord)) {
        setError(`"${currentGuess}" has already been guessed`)
        setSubmitting(false)
        return
      }

      const foundWord = scoreboard.find(entry => entry.word === guessWord)

      let index: number | undefined
      let wordScore: number
      let wasHinted: boolean = false
      let updatedScore = gameState?.score || 0
      let updatedGuessedWordsGroupA = gameState?.guessed_words_group_a || []
      let updatedGuessedWordsGroupB = gameState?.guessed_words_group_b || []
      let updatedRemainingGuesses = gameState?.remaining_guesses || 0

      if (foundWord) {
        index = scoreboard.findIndex(entry => entry.word === guessWord)

        if (foundWord.group_name === ComparativeGroup.GROUP_A) {
          updatedGuessedWordsGroupA.push(guessWord)
          wasHinted = hintedWordsGroupA.includes(guessWord)
        } else {
          updatedGuessedWordsGroupB.push(guessWord)
          index -= gameState!.scoreboard_size
          wasHinted = hintedWordsGroupB.includes(guessWord)
        }

        const baseScore = calculateScore(index, scoreboard.length / 2)
        wordScore = wasHinted ? Math.round(baseScore / 2) : baseScore
        updatedScore += wordScore

        handleWordClick(foundWord.word)
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
        score: wordScore,
        rank: index !== undefined ? index + 1 : undefined,
        created_at: new Date().toISOString(),
      }

      const updatedGuesses = [...(gameState?.compare_guesses || []), newGuess]

      const updatedGameState = {
        ...gameState!,
        score: updatedScore,
        compare_guesses: updatedGuesses,
        guessed_words_group_a: updatedGuessedWordsGroupA,
        guessed_words_group_b: updatedGuessedWordsGroupB,
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
        2 * gameState!.scoreboard_size <= updatedGuessedWordsGroupA.length + updatedGuessedWordsGroupB.length
      ) {
        setGameState(prev => (prev ? { ...prev, is_completed: true } : null))
        updatedGameState.is_completed = true
      }

      await gameAPI.submitComparativeGuess(newGuess)

      let { compare_guesses: _, ...updatedGame } = updatedGameState

      if (updatedGame.is_completed) {
        // @ts-ignore
        updatedGame.completed_at = new Date().toISOString()

        // Update user stats
        if (isAuthenticated) {
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

      await gameAPI.updateComparativeGameState(updatedGame, updatedGame.id)
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
      if (isAuthenticated) {
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
      let { compare_guesses: _, ...updatedGame } = updatedGameState
      await gameAPI.updateComparativeGameState(updatedGame, updatedGame.id)
    } catch (error: any) {
      console.error('Failed to give up game:', error)
      setError(error.response?.data?.error || 'Failed to end game')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWordClick = (word: string) => {
    // Find the word in the combined scoreboard to get articles from both groups
    const wordLower = word.toLowerCase()
    const wordEntry = scoreboard.find((entry: ComparativeScoreboardEntry) => entry.word.toLowerCase() === wordLower) as
      | ComparativeScoreboardEntry
      | undefined

    if (wordEntry) {
      // Each ComparativeScoreboardEntry has articles from both groups
      const condensedWordDataGroupA: ScoreboardEntry = {
        word: wordEntry.word,
        rank: wordEntry.avg_rank_group_a,
        articles: wordEntry.articles_group_a,
      }
      const condensedWordDataGroupB: ScoreboardEntry = {
        word: wordEntry.word,
        rank: wordEntry.avg_rank_group_b,
        articles: wordEntry.articles_group_b,
      }
      setSelectedWordDataGroupA(condensedWordDataGroupA)
      setSelectedWordDataGroupB(condensedWordDataGroupB)
      setCurrentPageGroupA(0)
      setCurrentPageGroupB(0)
    }
  }

  const handleHintClick = (word: string) => {
    const wordLower = word.toLowerCase()
    let condensedWordData: ScoreboardEntry | null = null
    const wordDataGroupA = scoreboardGroupA.find(item => item.word.toLowerCase() === wordLower)
    const wordDataGroupB = scoreboardGroupB.find(item => item.word.toLowerCase() === wordLower)

    if (wordDataGroupA) {
      condensedWordData = {
        word: wordDataGroupA.word,
        rank: wordDataGroupA.avg_rank_group_a,
        articles: wordDataGroupA.articles_group_a,
      }
    } else if (wordDataGroupB) {
      condensedWordData = {
        word: wordDataGroupB.word,
        rank: wordDataGroupB.avg_rank_group_b,
        articles: wordDataGroupB.articles_group_b,
      }
    }

    if (condensedWordData) {
      setCurrentHintWord(condensedWordData)
      setCurrentHintWordGroupB(null) // Clear group B hint to show only single hint
      setHintModalOpen(true)
    }
  }

  const closeArticlePanel = () => {
    setSelectedWordDataGroupA(null)
    setSelectedWordDataGroupB(null)
  }

  // Select a hint word with equal probability (no weights)
  const selectHintWord = (wordBoard: ComparativeScoreboardEntry[], group: ComparativeGroup): ScoreboardEntry | null => {
    // Filter for unguessed words that haven't been hinted yet
    const availableWords = wordBoard.filter(entry => {
      const wordLower = entry.word.toLowerCase()
      if (group === ComparativeGroup.GROUP_A) {
        return !gameState?.guessed_words_group_a.includes(wordLower) && !hintedWordsGroupA.includes(wordLower)
      } else {
        return !gameState?.guessed_words_group_b.includes(wordLower) && !hintedWordsGroupB.includes(wordLower)
      }
    })

    if (availableWords.length === 0) {
      return null
    }

    // Select random word with equal probability
    const randomIndex = Math.floor(Math.random() * availableWords.length)
    return {
      word: availableWords[randomIndex].word,
      rank:
        group === ComparativeGroup.GROUP_A
          ? availableWords[randomIndex].avg_rank_group_a
          : availableWords[randomIndex].avg_rank_group_b,
      articles:
        group === ComparativeGroup.GROUP_A
          ? availableWords[randomIndex].articles_group_a
          : availableWords[randomIndex].articles_group_b,
    }
  }

  const handleShowHint = (type: HintType) => {
    const hintWordA = selectHintWord(scoreboardGroupA, ComparativeGroup.GROUP_A)
    const hintWordB = selectHintWord(scoreboardGroupB, ComparativeGroup.GROUP_B)
    if (!hintWordA && !hintWordB) {
      // No more hints are available
      setError('No more hints are available. Select a hinted word to fill in the blank!')
      return
    }
    if (hintWordA) {
      // Add word to hinted words list when hint is shown
      setHintedWordsGroupA(prev => {
        if (!prev.includes(hintWordA.word.toLowerCase())) {
          return [...prev, hintWordA.word.toLowerCase()]
        }
        return prev
      })
    }
    if (hintWordB) {
      setHintedWordsGroupB(prev => {
        if (!prev.includes(hintWordB.word.toLowerCase())) {
          return [...prev, hintWordB.word.toLowerCase()]
        }
        return prev
      })
    }
    setCurrentHintWord(hintWordA)
    setCurrentHintWordGroupB(hintWordB)
    setHintModalOpen(true)
  }

  const handleCloseHintModal = () => {
    setHintModalOpen(false)
  }

  const theme = useTheme()
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const groupAAccentColor = theme.palette.primary.main
  const groupBAccentColor = theme.palette.secondary.main || theme.palette.info.main

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
            <GameInfo timePeriod={gameState.time_period} backPage={'/compare'} />
          </Grid>

          {/* Group A Scoreboard */}
          <Grid size={{ xs: 12 }} sx={{ order: 2 }} ref={scoreboardRef}>
            <Scoreboard
              scoreboard={scoreboardGroupA}
              sources={gameState.sources_group_a}
              showScoreboard={showScoreboard}
              setShowScoreboard={setShowScoreboard}
              isCompleted={gameState.is_completed}
              guessedWords={gameState.guessed_words_group_a}
              handleWordClick={handleWordClick}
              handleHintClick={handleHintClick}
              hintedWords={hintedWordsGroupA}
              groupLabel="Source Group A"
              groupAccentColor={groupAAccentColor}
            />
          </Grid>

          {/* Group B Scoreboard */}
          <Grid size={{ xs: 12 }} sx={{ order: 3 }} ref={scoreboardRef}>
            <Scoreboard
              scoreboard={scoreboardGroupB}
              sources={gameState.sources_group_b}
              showScoreboard={showScoreboard}
              setShowScoreboard={setShowScoreboard}
              isCompleted={gameState.is_completed}
              guessedWords={gameState.guessed_words_group_b}
              handleWordClick={handleWordClick}
              handleHintClick={handleHintClick}
              hintedWords={hintedWordsGroupB}
              groupLabel="Source Group B"
              groupAccentColor={groupBAccentColor}
            />
          </Grid>

          {/* Game Stats */}
          <Grid size={{ xs: 12 }} sx={{ order: 4 }}>
            <GameStats
              guessedWords={gameState.guessed_words_group_a.concat(gameState.guessed_words_group_b)}
              score={gameState.score}
              remainingGuesses={gameState.remaining_guesses}
            />
          </Grid>

          {/* Recent Guesses */}
          {gameState.compare_guesses.length > 0 && (
            <Grid size={{ xs: 12 }} sx={{ order: 5 }}>
              <GuessList guesses={gameState.compare_guesses} />
            </Grid>
          )}

          {/* Word Guess - Fixed bar */}
          <Grid size={{ xs: 12 }} sx={{ order: 6 }}>
            <WordInput
              handleSubmitGuess={handleSubmitGuess}
              currentGuess={currentGuess}
              setCurrentGuess={setCurrentGuess}
              submitting={submitting}
              error={error}
              success={success}
              isCompleted={gameState.is_completed}
              score={gameState.score}
              isOverlayOpen={Boolean(selectedWordDataGroupA || selectedWordDataGroupB)}
              onShowHint={handleShowHint}
              onGiveUp={handleGiveUp}
              explainerMode={ExplainerMode.COMPARE}
            />
          </Grid>
        </Grid>
        <ComparativeArticleDrawer
          open={Boolean(selectedWordDataGroupA || selectedWordDataGroupB)}
          onClose={closeArticlePanel}
          groupAData={selectedWordDataGroupA}
          groupBData={selectedWordDataGroupB}
          groupALabel="Source Group A"
          groupBLabel="Source Group B"
          groupAAccentColor={groupAAccentColor}
          groupBAccentColor={groupBAccentColor}
          currentPageGroupA={currentPageGroupA}
          currentPageGroupB={currentPageGroupB}
          setCurrentPageGroupA={setCurrentPageGroupA}
          setCurrentPageGroupB={setCurrentPageGroupB}
          articlesPerPage={articlesPerPage}
        />

        {/* Hint Modal */}
        <HintModal
          open={hintModalOpen}
          onClose={handleCloseHintModal}
          hintWord={currentHintWord}
          hintWordGroupB={currentHintWordGroupB}
          groupALabel="Source Group A"
          groupBLabel="Source Group B"
          groupAAccentColor={groupAAccentColor}
          groupBAccentColor={groupBAccentColor}
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      {/* Main 3-Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column - Header Info, Game Stats & Group A Article Info */}
        <Grid size={{ xs: 12, lg: 2.5 }}>
          <Stack
            spacing={2}
            sx={{
              height: scoreboardHeight > 0 ? `${scoreboardHeight}px` : '100%',
              maxHeight: scoreboardHeight > 0 ? `${scoreboardHeight}px` : 'none',
            }}
          >
            {/* Game Information */}
            <GameInfo timePeriod={gameState.time_period} backPage={'/compare'} />

            {/* Game Stats */}
            <GameStats
              guessedWords={gameState.guessed_words_group_a.concat(gameState.guessed_words_group_b)}
              score={gameState.score}
              remainingGuesses={gameState.remaining_guesses}
            />

            {/* Group A Article Info */}
            <ArticleInfo
              selectedWordData={selectedWordDataGroupA}
              currentPage={currentPageGroupA}
              articlesPerPage={articlesPerPage}
              setCurrentPage={setCurrentPageGroupA}
              closeArticlePanel={closeArticlePanel}
              scoreboardHeight={scoreboardHeight}
              groupLabel="Source Group A"
              groupAccentColor={groupAAccentColor}
            />
          </Stack>
        </Grid>

        {/* Middle Column - Word Input & Scoreboards */}
        <Grid size={{ xs: 12, lg: 7 }}>
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
              isOverlayOpen={Boolean(selectedWordDataGroupA || selectedWordDataGroupB)}
              onShowHint={handleShowHint}
              onGiveUp={handleGiveUp}
              explainerMode={ExplainerMode.COMPARE}
            />

            {/* Scoreboard Section */}
            <Grid container spacing={2}>
              {/* Group A Scoreboard */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Scoreboard
                  scoreboard={scoreboardGroupA}
                  sources={gameState.sources_group_a}
                  showScoreboard={showScoreboard}
                  setShowScoreboard={setShowScoreboard}
                  isCompleted={gameState.is_completed}
                  guessedWords={gameState.guessed_words_group_a}
                  handleWordClick={handleWordClick}
                  handleHintClick={handleHintClick}
                  hintedWords={hintedWordsGroupA}
                  groupLabel="Source Group A"
                  groupAccentColor={groupAAccentColor}
                />
              </Grid>

              {/* Group B Scoreboard */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Scoreboard
                  scoreboard={scoreboardGroupB}
                  sources={gameState.sources_group_b}
                  showScoreboard={showScoreboard}
                  setShowScoreboard={setShowScoreboard}
                  isCompleted={gameState.is_completed}
                  guessedWords={gameState.guessed_words_group_b}
                  handleWordClick={handleWordClick}
                  handleHintClick={handleHintClick}
                  hintedWords={hintedWordsGroupB}
                  groupLabel="Source Group B"
                  groupAccentColor={groupBAccentColor}
                />
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        {/* Right Column - Recent Guesses & Group B Article Info */}
        <Grid size={{ xs: 12, lg: 2.5 }}>
          <Stack
            spacing={2}
            sx={{
              height: scoreboardHeight > 0 ? `${scoreboardHeight}px` : '100%',
              maxHeight: scoreboardHeight > 0 ? `${scoreboardHeight}px` : 'none',
            }}
          >
            {/* Recent Guesses */}
            <GuessList guesses={gameState.compare_guesses} />

            {/* Group B Article Info */}
            <ArticleInfo
              selectedWordData={selectedWordDataGroupB}
              currentPage={currentPageGroupB}
              articlesPerPage={articlesPerPage}
              setCurrentPage={setCurrentPageGroupB}
              closeArticlePanel={closeArticlePanel}
              scoreboardHeight={scoreboardHeight}
              groupLabel="Source Group B"
              groupAccentColor={groupBAccentColor}
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Hint Modal */}
      <HintModal
        open={hintModalOpen}
        onClose={handleCloseHintModal}
        hintWord={currentHintWord}
        hintWordGroupB={currentHintWordGroupB}
        groupALabel="Source Group A"
        groupBLabel="Source Group B"
        groupAAccentColor={groupAAccentColor}
        groupBAccentColor={groupBAccentColor}
      />
    </Container>
  )
}

export default CompareGame
