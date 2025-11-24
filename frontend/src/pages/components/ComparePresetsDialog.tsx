import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Paper,
  Box,
  Typography,
  Button,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ComparePreset, NewsSourceConfig } from '../../types'

type ComparePresetsDialogProps = {
  open: boolean
  onClose: () => void
  presets: ComparePreset[]
  onApplyPreset: (preset: ComparePreset) => void
}

const ComparePresetsDialog: React.FC<ComparePresetsDialogProps> = ({ open, onClose, presets, onApplyPreset }) => {
  const handleApply = (preset: ComparePreset) => {
    onApplyPreset(preset)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Jumpstart with Preset Matchups
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: theme => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use these curated examples to quickly fill each group, then tweak as needed.
        </Typography>
        <Grid container spacing={2}>
          {presets.map(preset => (
            <Grid size={{ xs: 12, md: 4 }} key={preset.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {preset.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preset.description}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary.main">
                    {preset.groupALabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preset.groupASources.map(source => NewsSourceConfig[source].name).join(', ')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="secondary.main">
                    {preset.groupBLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preset.groupBSources.map(source => NewsSourceConfig[source].name).join(', ')}
                  </Typography>
                </Box>
                <Button variant="contained" fullWidth onClick={() => handleApply(preset)}>
                  Use This Preset
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default ComparePresetsDialog

