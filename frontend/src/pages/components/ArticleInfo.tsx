import { Box, Card, CardContent, IconButton, Paper, Stack, Typography } from "@mui/material"
import {
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
	Close as CloseIcon
} from "@mui/icons-material"
import { NewsSourceConfig, ScoreboardEntry } from "../../types"

interface Props {
  selectedWordData: ScoreboardEntry | null
  currentPage: number
  setCurrentPage: (value: React.SetStateAction<number>) => void
  articlesPerPage: number
  closeArticlePanel: () => void
	scoreboardHeight?: number
}

const ArticleInfo = ({ selectedWordData, currentPage, articlesPerPage, setCurrentPage, closeArticlePanel, scoreboardHeight }: Props) => {
  return (
    <Card sx={scoreboardHeight ? { height: `${scoreboardHeight}px`, maxHeight: `${scoreboardHeight}px` } : {}}>
			<CardContent sx={{ py: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
				{selectedWordData ? (
					<>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
							<Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
								Articles for "{selectedWordData.word.toUpperCase()}"
							</Typography>
							<IconButton
								onClick={closeArticlePanel}
								size="small"
								sx={{ color: 'text.secondary' }}
							>
								<CloseIcon />
							</IconButton>
						</Box>
						<Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
							<Stack spacing={1.5} sx={{ flex: 1 }}>
								{selectedWordData.articles
									.slice(currentPage * articlesPerPage, (currentPage + 1) * articlesPerPage)
									.map((article, index) => (
									<Paper
										key={currentPage * articlesPerPage + index}
										elevation={1}
										sx={{ p: 1.5, '&:hover': { elevation: 3 } }}
									>
										<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
											{/* Source Icon */}
											<Box
												sx={{
													width: 24,
													height: 24,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													bgcolor: 'primary.light',
													borderRadius: '50%',
													overflow: 'hidden',
													flexShrink: 0
												}}
											>
												{NewsSourceConfig[article.source].logo}
											</Box>
											
											{/* Article Content */}
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Typography
													component="a"
													href={`${article.url}?utm_source=newswordy`}
													target="_blank"
													rel="noopener noreferrer"
													variant="body2"
													sx={{
														fontWeight: 'medium',
														color: 'text.primary',
														textDecoration: 'none',
														display: '-webkit-box',
														WebkitLineClamp: 3,
														WebkitBoxOrient: 'vertical',
														overflow: 'hidden',
														fontSize: '0.8rem',
														lineHeight: 1.3,
														'&:hover': {
															color: 'primary.main',
															textDecoration: 'underline'
														}
													}}
												>
													{article.headline}
												</Typography>
												<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
													{new Date(article.published_date).toLocaleDateString('en-US', {
														month: 'short',
														day: 'numeric',
														year: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})}
												</Typography>
												<Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
													{NewsSourceConfig[article.source].name}
												</Typography>
											</Box>
										</Box>
									</Paper>
								))}
							</Stack>
							
							{/* Pagination Controls */}
							{selectedWordData.articles.length > articlesPerPage && (
								<Box sx={{ 
									display: 'flex', 
									justifyContent: 'space-between', 
									alignItems: 'center', 
									mt: 2, 
									pt: 2, 
									borderTop: '1px solid',
									borderColor: 'divider',
									flexShrink: 0
								}}>
									<Typography variant="caption" color="text.secondary">
										Showing {currentPage * articlesPerPage + 1}-{Math.min((currentPage + 1) * articlesPerPage, selectedWordData.articles.length)} of {selectedWordData.articles.length}
									</Typography>
									<Box sx={{ display: 'flex', gap: 0.5 }}>
										<IconButton
											size="small"
											disabled={currentPage === 0}
											onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
											sx={{ 
												width: 24, 
												height: 24,
												border: '1px solid',
												borderColor: 'divider',
												'&:hover': {
													backgroundColor: 'action.hover'
												}
											}}
										>
											<ChevronLeftIcon fontSize="small" />
										</IconButton>
										<IconButton
											size="small"
											disabled={(currentPage + 1) * articlesPerPage >= selectedWordData.articles.length}
											onClick={() => setCurrentPage(prev => prev + 1)}
											sx={{ 
												width: 24, 
												height: 24,
												border: '1px solid',
												borderColor: 'divider',
												'&:hover': {
													backgroundColor: 'action.hover'
												}
											}}
										>
											<ChevronRightIcon fontSize="small" />
										</IconButton>
									</Box>
								</Box>
							)}
						</Box>
					</>
				) : (
					<Box sx={{ 
						textAlign: 'center', 
						py: 4, 
						display: 'flex', 
						alignItems: 'center', 
						justifyContent: 'center',
						minHeight: '200px'
					}}>
						<Typography variant="body1" color="text.secondary">
							Click on a guessed word to see related articles
						</Typography>
					</Box>
				)}
			</CardContent>
		</Card>
  )
}

export default ArticleInfo