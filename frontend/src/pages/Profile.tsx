import React, { useState, useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { userAPI } from '../services/api'
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  EmojiEvents as TrophyIcon,
  Person as UserIcon
} from '@mui/icons-material'

interface Stat {
  name: string
  value: number
  icon: any
  color: string
}

const Profile: React.FC = () => {
  const { user } = useAuth0();

  const getUserStats = async () => {
    const account = await userAPI.getSingleUser(user?.sub || '')
    const history = account.data

    const userStats: Stat[] = [
      { name: 'Total Games', value: history?.total_games || 0, icon: PlayIcon, color: 'primary.main' },
      { name: 'Best Score', value: history?.best_score || 0, icon: TrophyIcon, color: 'warning.main' },
      { name: 'Average Score', value: history?.average_score?.toFixed(1) || '0.0', icon: UserIcon, color: 'success.main' },
    ]

    setStats(userStats)
  }

  useMemo(getUserStats, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const [stats, setStats] = useState<Stat[]>([])

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
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
    </Container>
  )
}

export default Profile
