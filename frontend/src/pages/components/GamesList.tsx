import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Paper, Typography, Box, Chip, Stack } from '@mui/material'
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material'
import { Game, CompareGame, AssociateGame, CompareAssociateGame, GameMode, GAME_MODE_NAMES, Color } from '../../types'

interface Props {
  games: Game[] | CompareGame[] | AssociateGame[] | CompareAssociateGame[]
  mode: GameMode
}

const GamesList = ({ games, mode }: Props) => {
  const navigate = useNavigate()

  const handleGameClick = (gameId?: string) => {
    navigate(`/${mode}/${gameId}`)
  }

  const getGuessedWordsCount = (game: Game | CompareGame | AssociateGame | CompareAssociateGame): number => {
    if ('guessed_words' in game && Array.isArray(game.guessed_words)) {
      return game.guessed_words.length
    }
    if ('guessed_words_group_a' in game && 'guessed_words_group_b' in game) {
      return (game.guessed_words_group_a?.length || 0) + (game.guessed_words_group_b?.length || 0)
    }
    return 0
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            mb: 1.5,
            fontSize: '1rem',
          }}
        >
          {GAME_MODE_NAMES[mode]}
        </Typography>
        {games.length > 0 ? (
          <Stack spacing={1} sx={{ flex: 1, overflow: 'auto' }}>
            {games
              .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
              .map(game => {
                const guessedCount = getGuessedWordsCount(game)
                const dateStr = formatDate(game.created_at)

                return (
                  <Paper
                    key={game.id}
                    onClick={() => handleGameClick(game.id)}
                    elevation={1}
                    sx={{
                      p: 1.25,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.75,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        elevation: 3,
                        transform: 'translateY(-1px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {game.is_completed ? (
                          <CheckCircle sx={{ fontSize: 18, color: Color.SUCCESS }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ fontSize: 18, color: Color.GRAY_400 }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                          Score: {game.score}
                        </Typography>
                      </Box>
                      <Chip
                        label={game.is_completed ? 'Completed' : 'In Progress'}
                        size="small"
                        color={game.is_completed ? 'success' : 'primary'}
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 3.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {guessedCount} word{guessedCount !== 1 ? 's' : ''} found
                      </Typography>
                      {dateStr && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                          {dateStr}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                )
              })}
          </Stack>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              No games yet
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default GamesList
