import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { BASE_RULE_BULLETS } from '../../constants/gameRules'
import { ExplainerMode } from '../../types'

const MODE_SUMMARY_LINES: Record<ExplainerMode, string> = {
  [ExplainerMode.CLASSIC]: 'Scores reward raw mention counts across the sources you picked.',
  [ExplainerMode.ASSOCIATE]: 'Scores reward raw co-mentions with your anchor word.',
  [ExplainerMode.COMPARE]: 'Each column highlights words that make up a bigger share of mentions in that group.',
  [ExplainerMode.COMPARE_ASSOCIATE]:
    'Percent-share differences are calculated only among headlines with your anchor word.',
}

const MODE_SPECIFIC_BULLETS: Record<ExplainerMode, string> = {
  [ExplainerMode.CLASSIC]:
    'Classic mode ranks words purely by how many times they are mentioned during the selected window.',
  [ExplainerMode.ASSOCIATE]:
    'Association mode counts the raw number of headlines containing both your anchor word and the guess.',
  [ExplainerMode.COMPARE]:
    'Comparison mode surfaces words whose percentage of total mentions is higher in one source group than the other.',
  [ExplainerMode.COMPARE_ASSOCIATE]:
    'Comparative association runs the same percentage comparison but only across headlines that include your anchor word.',
}

interface GameExplainerDialogProps {
  mode: ExplainerMode
  label?: string
  size?: 'small' | 'medium'
}

/**
 * Dialog component that explains how scoring works for different game modes.
 * Displays mode-specific scoring rules and general game mechanics.
 * Triggered by a button that can be placed anywhere in the UI.
 */
const GameExplainerDialog = ({ mode, label = 'Learn more', size = 'small' }: GameExplainerDialogProps) => {
  const [open, setOpen] = useState(false)
  const bullets = [...BASE_RULE_BULLETS, MODE_SPECIFIC_BULLETS[mode]]

  return (
    <>
      <Button
        size={size}
        variant="text"
        onClick={() => setOpen(true)}
        startIcon={<InfoOutlinedIcon fontSize="small" />}
        sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
      >
        {label}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pr: 5 }}>
          How scoring works
          <IconButton
            aria-label="Close"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body1">{MODE_SUMMARY_LINES[mode]}</Typography>
            <Box component="ul" sx={{ pl: 3, mb: 0, listStyleType: 'disc' }}>
              {bullets.map(bullet => (
                <Typography
                  key={bullet}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: 'list-item', listStyleType: 'disc', mb: 0.5 }}
                >
                  {bullet}
                </Typography>
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Got it</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default GameExplainerDialog
