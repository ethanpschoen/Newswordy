import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gameAPI } from '../services/api';
import { TIME_PERIODS, TIME_PERIOD_NAMES, DEFAULT_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE } from '../types';
import { 
  PlayIcon, 
  Cog6ToothIcon,
  ClockIcon,
  TrophyIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(TIME_PERIODS.PAST_DAY);
  const [maxGuesses, setMaxGuesses] = useState(DEFAULT_MAX_GUESSES);
  const [scoreboardSize, setScoreboardSize] = useState(DEFAULT_SCOREBOARD_SIZE);

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const response = await gameAPI.createGame({
        timePeriod: selectedTimePeriod,
        maxGuesses,
        scoreboardSize
      });

      if (response.success && response.data) {
        navigate(`/game/${response.data.game.id}`);
      }
    } catch (error) {
      console.error('Failed to create game:', error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: 'Total Games', value: user?.totalGames || 0, icon: PlayIcon, color: 'text-blue-600' },
    { name: 'Best Score', value: user?.bestScore || 0, icon: TrophyIcon, color: 'text-yellow-600' },
    { name: 'Average Score', value: user?.averageScore?.toFixed(1) || '0.0', icon: UserIcon, color: 'text-green-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Newswordy!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Guess the most common words in news headlines from different time periods. 
          Test your knowledge of current events and compete with others!
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Game Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center mb-6">
          <Cog6ToothIcon className="w-6 h-6 text-gray-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Game Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Time Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-2" />
              Time Period
            </label>
            <select
              value={selectedTimePeriod}
              onChange={(e) => setSelectedTimePeriod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {Object.entries(TIME_PERIOD_NAMES).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Max Guesses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Guesses
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxGuesses}
              onChange={(e) => setMaxGuesses(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Scoreboard Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scoreboard Size
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={scoreboardSize}
              onChange={(e) => setScoreboardSize(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Start Game Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleStartGame}
            disabled={loading}
            className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating Game...
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5 mr-2" />
                Start New Game
              </>
            )}
          </button>
        </div>
      </div>

      {/* How to Play */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">1. Choose a Time Period</h4>
            <p className="text-gray-600 text-sm">
              Select from past day, week, month, or year to determine which news headlines to analyze.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">2. Guess Common Words</h4>
            <p className="text-gray-600 text-sm">
              Type words that you think appear frequently in news headlines from that period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">3. Score Points</h4>
            <p className="text-gray-600 text-sm">
              Earn points based on how common your guessed words are. Higher frequency = more points!
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">4. Beat Your Best</h4>
            <p className="text-gray-600 text-sm">
              Try to achieve the highest score possible and compete on the leaderboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
