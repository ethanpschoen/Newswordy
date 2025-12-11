import React, { useState, useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { userAPI } from '../services/api'
import { Box, Card, CardContent, Container, Divider, Grid, Typography } from '@mui/material'
import { PlayArrow as PlayIcon, EmojiEvents as TrophyIcon, Person as UserIcon } from '@mui/icons-material'
import GamesList from './components/GamesList'
import { AssociateGame, CompareAssociateGame, CompareGame, Game, GameMode, UserStat } from '../types'

/**
 * This is the profile page for the Newswordy app.
 * It allows the user to view their game history and stats.
 * The user can select a past game to revisit it.
 */
const Profile: React.FC = () => {
  const { user } = useAuth0()

  // Function to get the user's stats from the database
  const getUserStats = async () => {
    const account = await userAPI.getUser(user?.sub || '')
    const history = account.data

    const userStats: UserStat[] = [
      {
        name: 'Total Completed Games',
        value: history?.total_games || 0,
        icon: PlayIcon,
        color: 'primary.main',
      },
      {
        name: 'Best Score',
        value: history?.best_score || 0,
        icon: TrophyIcon,
        color: 'warning.main',
      },
      {
        name: 'Average Score',
        value: history?.average_score?.toFixed(1) || '0.0',
        icon: UserIcon,
        color: 'success.main',
      },
    ]

    setStats(userStats)

    // Get the user's game history from the database
    const games = await userAPI.getUserGames(user?.sub || '')
    const comparativeGames = await userAPI.getUserComparativeGames(user?.sub || '')
    const associateGames = await userAPI.getUserAssociateGames(user?.sub || '')
    const comparativeAssociateGames = await userAPI.getUserComparativeAssociatedGames(user?.sub || '')

    setGames(games.data || [])
    setComparativeGames(comparativeGames.data || [])
    setAssociateGames(associateGames.data || [])
    setComparativeAssociateGames(comparativeAssociateGames.data || [])
  }

  useMemo(getUserStats, []) // eslint-disable-line react-hooks/exhaustive-deps

  // State variables for the profile page
  const [stats, setStats] = useState<UserStat[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [comparativeGames, setComparativeGames] = useState<CompareGame[]>([])
  const [associateGames, setAssociateGames] = useState<AssociateGame[]>([])
  const [comparativeAssociateGames, setComparativeAssociateGames] = useState<CompareAssociateGame[]>([])

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map(stat => (
          <Grid size={{ xs: 12, md: 4 }} key={stat.name}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <stat.icon sx={{ fontSize: 40, color: stat.color }} />
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mt: 4, mb: 2 }} />

      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2, textAlign: 'center' }}>
        Game History
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 3 }}>
          <GamesList games={games} mode={GameMode.GAME} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <GamesList games={comparativeGames} mode={GameMode.COMPARE} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <GamesList games={associateGames} mode={GameMode.ASSOCIATE} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <GamesList games={comparativeAssociateGames} mode={GameMode.COMPARE_ASSOCIATE} />
        </Grid>
      </Grid>
    </Container>
  )
}

export default Profile
