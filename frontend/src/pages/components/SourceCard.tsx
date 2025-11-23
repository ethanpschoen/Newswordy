import { Box, Card, Typography, Stack, IconButton } from '@mui/material'
import { CompareArrows as CompareIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { NewsSource, NewsSourceConfig } from '../../types'

interface Props {
  source: NewsSource
  onRemove?: () => void
  onMoveToOther?: () => void
  groupLabel: string
  groupColor: string
}

const SourceCard: React.FC<Props> = ({ source, onRemove, onMoveToOther, groupLabel, groupColor }) => {
  const config = NewsSourceConfig[source]
  return (
    <Card
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        border: `2px solid ${groupColor}`,
        bgcolor: `${groupColor}15`,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s',
        },
      }}
    >
      <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {config.logo}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {config.name}
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.5}>
        {onMoveToOther && (
          <IconButton
            size="small"
            onClick={onMoveToOther}
            title={`Move to ${groupLabel === 'Group A' ? 'Group B' : 'Group A'}`}
          >
            <CompareIcon fontSize="small" />
          </IconButton>
        )}
        {onRemove && (
          <IconButton size="small" onClick={onRemove} title="Remove from group">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </Card>
  )
}

export default SourceCard
