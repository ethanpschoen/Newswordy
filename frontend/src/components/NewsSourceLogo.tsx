import { Box, BoxProps } from '@mui/material'
import { NewsSource, NewsSourceConfig } from '../types'

interface NewsSourceLogoProps extends Omit<BoxProps, 'component'> {
  source: NewsSource
  size?: number | string
}

const NewsSourceLogo = ({ source, size, sx, ...boxProps }: NewsSourceLogoProps) => {
  const { name, logoSrc } = NewsSourceConfig[source]
  const resolvedSize = typeof size === 'number' ? `${size}px` : size

  return (
    <Box
      component="img"
      src={logoSrc}
      alt={`${name} logo`}
      loading="lazy"
      sx={{
        width: resolvedSize ?? '100%',
        height: resolvedSize ?? '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'block',
        ...sx,
      }}
      {...boxProps}
    />
  )
}

export default NewsSourceLogo

