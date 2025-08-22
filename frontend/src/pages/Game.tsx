import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameAPI } from '../services/api'
import { GameState, ScoreboardEntry, TIME_PERIOD_NAMES } from '../types'
import { 
  TrophyIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()

  const navigate = useNavigate()
  
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentGuess, setCurrentGuess] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showScoreboard, setShowScoreboard] = useState(false)

  useEffect(() => {
    if (gameId) {
      loadGame()
    }
  }, [gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadGame = async () => {
    try {
      setLoading(true)
      const [gameResponse, scoreboardResponse] = await Promise.all([
        gameAPI.getGameState(gameId!),
        gameAPI.getScoreboard(gameId!)
      ])

      if (gameResponse.success && gameResponse.data) {
        setGameState(gameResponse.data)
      }

      if (scoreboardResponse.success && scoreboardResponse.data) {
        setScoreboard(scoreboardResponse.data.scoreboard)
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
      const response = await gameAPI.submitGuess(gameId, { word: currentGuess.trim() })
      
      if (response.success && response.data) {
        setSuccess(`"${currentGuess}" found! +${response.data.guess.score} points`)
        setCurrentGuess('')
        
        // Reload game state to get updated score and guesses
        await loadGame()
        
        // Check if game is over
        if (response.data.remainingGuesses === 0) {
          setTimeout(() => {
            endGame()
          }, 2000)
        }
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
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Failed to end game:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200'
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h1>
        <p className="text-gray-600 mb-6">The game you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Newswordy Game</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Time Period</div>
            <div className="text-lg font-semibold text-gray-900">
              {TIME_PERIOD_NAMES[gameState.timePeriod as keyof typeof TIME_PERIOD_NAMES]}
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
            <div className="text-sm text-blue-600">Total Score</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{gameState.remainingGuesses}</div>
            <div className="text-sm text-green-600">Guesses Left</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{gameState.guesses.length}</div>
            <div className="text-sm text-purple-600">Words Guessed</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{gameState.maxGuesses}</div>
            <div className="text-sm text-orange-600">Max Guesses</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Word Input Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Guess a Word</h2>
            
            {gameState.isCompleted ? (
              <div className="text-center py-8">
                <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Complete!</h3>
                <p className="text-gray-600 mb-4">Final Score: {gameState.score} points</p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Play Again
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmitGuess} className="space-y-4">
                  <div>
                    <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter a word that appears in news headlines:
                    </label>
                    <input
                      type="text"
                      id="word"
                      value={currentGuess}
                      onChange={(e) => setCurrentGuess(e.target.value.toLowerCase())}
                      placeholder="Type a word..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                      disabled={submitting}
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={submitting || !currentGuess.trim()}
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Guess'
                    )}
                  </button>
                </form>

                {/* Recent Guesses */}
                {gameState.guesses.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Guesses</h3>
                    <div className="space-y-3">
                      {gameState.guesses.map((guess, index) => (
                        <div
                          key={guess.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-gray-900">
                              {guess.word}
                            </span>
                            {guess.rank && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRankColor(guess.rank)}`}>
                                #{guess.rank}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getScoreColor(guess.score)}`}>
                              +{guess.score}
                            </div>
                            <div className="text-sm text-gray-500">
                              Frequency: {guess.frequency}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Scoreboard Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Top Words</h2>
              <button
                onClick={() => setShowScoreboard(!showScoreboard)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {showScoreboard ? 'Hide' : 'Show'} Full List
              </button>
            </div>
            
            <div className="space-y-3">
              {scoreboard.slice(0, showScoreboard ? scoreboard.length : 10).map((entry, index) => (
                <div
                  key={entry.word}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < 3 ? getRankColor(index + 1) : 'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{entry.word}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{entry.frequency}</div>
                    <div className="text-xs text-gray-500">mentions</div>
                  </div>
                </div>
              ))}
            </div>
            
            {!showScoreboard && scoreboard.length > 10 && (
              <button
                onClick={() => setShowScoreboard(true)}
                className="w-full mt-4 text-sm text-primary-600 hover:text-primary-500"
              >
                Show {scoreboard.length - 10} more words...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Game
