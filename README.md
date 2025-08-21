# Newswordy

A web game similar to Google Feud where users guess the most common words in news article headlines for different time periods.

## Game Concept

Players select a time range (past day, week, month, year, etc.) and try to guess the most frequently occurring words in news headlines from that period. Points are awarded based on how common the guessed words are, similar to Google Feud mechanics.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Scraping**: Python with BeautifulSoup/Scrapy
- **Deployment**: Vercel (frontend) + Railway (backend)
- **Authentication**: Auth0

## Project Structure

```
newswordy/
├── frontend/          # React application
├── backend/           # Node.js API server
├── scraper/           # Python news scraping scripts
├── database/          # Database schemas and migrations
└── deployment/        # Deployment configurations
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
5. Start the backend API
6. Start the frontend development server

## Features

- [ ] News headline scraping from major sources
- [ ] Word frequency analysis by time period
- [ ] Interactive word guessing game
- [ ] Real-time scoring system
- [ ] User authentication and profiles
- [ ] Global and personal leaderboards
- [ ] Customizable game settings

## Contributing

This is a personal project for learning and portfolio purposes.
