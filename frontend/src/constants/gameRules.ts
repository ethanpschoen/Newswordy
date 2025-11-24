export const STOP_WORD_EXAMPLES = [
  'the',
  'and',
  'for',
  'with',
  'from',
  'about',
  'into',
  'their',
  'your',
  'our',
] as const

export const WORD_RULES_HELPER_TEXT = 'Single words. Stop words like "the" are ignored.'

export const BASE_RULE_BULLETS = [
  'Single words only (punctuation trimmed, spaces removed).',
  `Stop words such as ${STOP_WORD_EXAMPLES.slice(0, 5).join(', ')} never appear on the board.`,
  'The chosen time period is fixed when the game is created.',
] as const

