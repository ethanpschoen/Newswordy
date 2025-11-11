import { Box, Typography, Card, Stack, CardContent } from "@mui/material"
import { Button } from "@mui/material"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import { GameState, TIME_PERIOD_NAMES } from "../../types"

interface Props {
  isTestMode: boolean
  gameState: GameState
}

const GameInfo = ({ isTestMode, gameState }: Props) => {
  const navigate = useNavigate()

  return (
    <Card>
      <CardContent sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* Navigation and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              onClick={() => navigate('/')}
              variant="outlined"
              size="small"
              startIcon={<ArrowLeftIcon className="w-4 h-4" />}
              sx={{ textTransform: 'none' }}
            >
              Back to Home
            </Button>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Newswordy
            </Typography>
          </Box>
                    
          {/* Time Period Info */}
          <Box sx={{ 
            p: 1.5, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Selected Time Period
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
              {isTestMode ? 'September 2nd - September 8th' : TIME_PERIOD_NAMES[gameState.time_period as keyof typeof TIME_PERIOD_NAMES]}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default GameInfo