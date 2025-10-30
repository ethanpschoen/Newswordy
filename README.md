# Newswordy

A web game similar to Google Feud where users guess the most common words in news article headlines for different time periods.

## Game Concept

Players select a time range (past day, week, month, year, etc.) and try to guess the most frequently occurring words in news headlines from that period. Points are awarded based on how common the guessed words are, similar to Google Feud mechanics.

## Tech Stack

- **Frontend**: React + Node.js + Express + TypeScript + Tailwind CSS
- **Database**: Supabase using PostgreSQL
- **Scraping**: Python with BeautifulSoup/Scrapy
- **Deployment**: Vercel
- **Authentication**: Auth0

## Project Structure

```
newswordy/
├── frontend/          # React application
└── scraper/           # Python news scraping scripts
```

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL (or Supabase account)
- Git

### Quick Start
1. Clone the repository
2. Set up environment variables
3. Install dependencies for each component
4. Run the scraper to collect initial data
6. Start the frontend development server

## Features

- [x] News headline scraping from major sources
- [x] Word frequency analysis by time period
- [x] Interactive word guessing game
- [x] Real-time scoring system
- [x] User authentication and profiles
- [ ] Global and personal leaderboards
- [x] Customizable game settings

## Contributing

This is a personal project for learning and portfolio purposes.
