import { Box, Card, Typography, Stack, IconButton } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { NewsSource, NewsSourceConfig } from '../../types'
import NewsSourceLogo from '../../components/NewsSourceLogo'

interface Props {
  source: NewsSource
  handleAddToGroupA: (source: NewsSource) => void
  handleAddToGroupB: (source: NewsSource) => void
}

const AvailableSourceCard: React.FC<Props> = ({ source, handleAddToGroupA, handleAddToGroupB }) => {
  const config = NewsSourceConfig[source]
  return (
    <Card
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        border: '2px dashed',
        borderColor: 'grey.300',
        bgcolor: 'grey.50',
        '&:hover': {
          borderColor: '#23CE6B',
          bgcolor: 'rgba(35, 206, 107, 0.1)',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s',
        },
      }}
    >
      <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <NewsSourceLogo source={source} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {config.name}
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.5}>
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation()
            handleAddToGroupA(source)
          }}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
          title="Add to Group A"
        >
          <AddIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation()
            handleAddToGroupB(source)
          }}
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'secondary.dark',
            },
          }}
          title="Add to Group B"
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Card>
  )
}

export default AvailableSourceCard
