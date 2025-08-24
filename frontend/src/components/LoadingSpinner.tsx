import React from 'react'
import { CircularProgress, Box } from '@mui/material'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 20
      case 'lg':
        return 40
      default:
        return 30
    }
  }

  return (
    <Box className={className}>
      <CircularProgress size={getSize()} />
    </Box>
  )
}

export default LoadingSpinner
