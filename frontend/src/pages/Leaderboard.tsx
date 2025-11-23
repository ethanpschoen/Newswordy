import React from 'react'
import { Color } from '../types'
import { Box, Typography } from '@mui/material'

const Leaderboard: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 12 }}>
      <Typography variant="h3" component="h3" sx={{ fontWeight: 'bold', mb: 4, color: Color.TEXT_PRIMARY }}>
        Leaderboard Page
      </Typography>
      <Typography variant="body1" sx={{ color: Color.TEXT_SECONDARY }}>
        Leaderboard functionality coming soon!
      </Typography>
    </Box>
  )
}

export default Leaderboard
