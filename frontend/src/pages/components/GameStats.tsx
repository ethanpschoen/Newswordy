import { Card, CardContent, Paper, Stack, Typography } from "@mui/material"
import { Color, GameState } from "../../types"

interface Props {
  gameState: GameState
}

const GameStats = ({ gameState }: Props) => {
  return (
    <Card>
			<CardContent sx={{ py: 2 }}>
				<Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
					Game Statistics
				</Typography>
				<Stack spacing={1.5}>
					<Paper 
						elevation={1} 
						sx={{ 
							p: 1.5, 
							textAlign: 'center',
							background: `linear-gradient(135deg, ${Color.GRADIENT_BLUE_START} 0%, ${Color.GRADIENT_BLUE_END} 100%)`
						}}
					>
						<Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
							{gameState.score}
						</Typography>
						<Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium' }}>
							Total Score
						</Typography>
					</Paper>
					<Paper 
						elevation={1} 
						sx={{ 
							p: 1.5, 
							textAlign: 'center',
							background: `linear-gradient(135deg, ${Color.GRADIENT_GREEN_START} 0%, ${Color.GRADIENT_GREEN_END} 100%)`
						}}
					>
						<Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'success.main', mb: 0.5 }}>
							{gameState.guessed_words.size}
						</Typography>
						<Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
							Word{gameState.guessed_words.size === 1 ? null : 's'} Guessed
						</Typography>
					</Paper>
					<Paper 
						elevation={1} 
						sx={{ 
							p: 1.5, 
							textAlign: 'center',
							background: `linear-gradient(135deg, ${Color.GRADIENT_PURPLE_START} 0%, ${Color.GRADIENT_PURPLE_END} 100%)`
						}}
					>
						<Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 0.5 }}>
							{gameState.remaining_guesses}
						</Typography>
						<Typography variant="body2" color="secondary.main" sx={{ fontWeight: 'medium' }}>
							Wrong Guess{gameState.remaining_guesses === 1 ? null : 'es'} Left
						</Typography>
					</Paper>
				</Stack>
			</CardContent>
		</Card>
  )
}

export default GameStats