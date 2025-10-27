"""
Configuration file for the Newswordy scraper
"""

import os
from dotenv import load_dotenv

# News sources configuration
NEWS_SOURCES = {
    'abc': {
        'name': 'ABC News',
        'url': 'https://abcnews.go.com/',
        'rss_feed': 'https://abcnews.go.com/abcnews/topstories',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '[data-testid="headline"]'],
        'article_selectors': ['article', '.story', '.content', '.article-content'],
        'enabled': True
    },
    'al_jazeera': {
        'name': 'Al Jazeera',
        'url': 'https://www.aljazeera.com/',
        'rss_feed': 'https://www.aljazeera.com/xml/rss/all.xml',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '.article-title'],
        'article_selectors': ['article', '.article', '.content', '.story'],
        'enabled': True
    },
    'axios': {
        'name': 'Axios',
        'url': 'https://www.axios.com/',
        'rss_feed': 'https://api.axios.com/feed/',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '[data-testid="headline"]'],
        'article_selectors': ['article', '.story', '.content', '.article'],
        'enabled': True
    },
    'bbc': {
        'name': 'BBC News',
        'url': 'https://www.bbc.com/news',
        'rss_feed': 'http://feeds.bbci.co.uk/news/rss.xml',
        'headline_selectors': ['h3.gs-c-promo-heading__title', '.gs-c-promo-heading__title', 'h1'],
        'article_selectors': ['.gs-c-promo', 'article', '.gs-c-promo-body'],
        'enabled': True
    },
    'cbs': {
        'name': 'CBS News',
        'url': 'https://www.cbsnews.com/',
        'rss_feed': 'https://www.cbsnews.com/latest/rss/main',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '.article-title'],
        'article_selectors': ['article', '.story', '.content', '.article'],
        'enabled': True
    },
    # TODO: they stopped updating feed, remove from game
    'cnn': {
        'name': 'CNN',
        'url': 'https://www.cnn.com',
        'rss_feed': 'http://rss.cnn.com/rss/edition.rss',
        'headline_selectors': ['h3.cd__headline', '.container__headline', 'h1.headline__text'],
        'article_selectors': ['article', '.card', '.container'],
        'enabled': False
    },
    'fox_news': {
        'name': 'Fox News',
        'url': 'https://www.foxnews.com/',
        'rss_feed': 'https://moxie.foxnews.com/google-publisher/latest.xml',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '.article-title'],
        'article_selectors': ['article', '.story', '.content', '.article'],
        'enabled': True
    },
    'guardian': {
        'name': 'The Guardian',
        'url': 'https://www.theguardian.com',
        'rss_feed': 'https://www.theguardian.com/world/rss',
        'headline_selectors': ['h3.fc-item__title', '.fc-item__title', 'h1'],
        'article_selectors': ['.fc-item', 'article', '.fc-item__container'],
        'enabled': True
    },
    'los_angeles_times': {
        'name': 'Los Angeles Times',
        'url': 'https://www.latimes.com/',
        'rss_feed': 'https://www.latimes.com/world-nation/rss2.0.xml',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '.article-title'],
        'article_selectors': ['article', '.story', '.content', '.article'],
        'enabled': True
    },
    'nbc_news': {
        'name': 'NBC News',
        'url': 'https://www.nbcnews.com/',
        'rss_feed': 'https://feeds.nbcnews.com/nbcnews/public/news',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '.article-title'],
        'article_selectors': ['article', '.story', '.content', '.article'],
        'enabled': True
    },
    'npr': {
        'name': 'NPR',
        'url': 'https://www.npr.org/',
        'rss_feed': 'https://feeds.npr.org/1001/rss.xml',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '.article-title'],
        'article_selectors': ['article', '.story', '.content', '.article'],
        'enabled': True
    },
    'nyt': {
        'name': 'The New York Times',
        'url': 'https://www.nytimes.com',
        'rss_feed': 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
        'headline_selectors': ['h3.css-1j836f9', '.css-1j836f9', 'h1'],
        'article_selectors': ['article', '.css-1l4w6pd', '.css-1l4w6pd'],
        'enabled': True
    },
    # TODO: Error fetching RSS feed https://www.politico.com/rss/politicopicks.xml: 403 Client Error: Forbidden for url: https://www.politico.com/rss/politicopicks.xml
    'politico': {
        'name': 'Politico',
        'url': 'https://www.politico.com/',
        'rss_feed': 'https://www.politico.com/rss/politicopicks.xml',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '.article-title'],
        'article_selectors': ['article', '.story', '.content', '.article'],
        'enabled': False
    },
    'wall_street_journal': {
        'name': 'The Wall Street Journal',
        'url': 'https://www.wsj.com/',
        'rss_feed': 'https://feeds.content.dowjones.io/public/rss/RSSWorldNews',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '.article-title'],
        'article_selectors': ['article', '.story', '.content', '.article'],
        'enabled': True
    },
    'washington_post': {
        'name': 'The Washington Post',
        'url': 'https://www.washingtonpost.com',
        'rss_feed': 'https://feeds.washingtonpost.com/rss/world',
        'headline_selectors': ['h3.font--headline', '.font--headline', 'h1'],
        'article_selectors': ['article', '.pb-feed-item', '.pb-feed-item__content'],
        'enabled': True
    },
    'yahoo': {
        'name': 'Yahoo News',
        'url': 'https://www.yahoo.com/',
        'rss_feed': 'https://www.yahoo.com/news/rss',
        'headline_selectors': ['h1', 'h2', 'h3', '.headline', '.title', '.article-title'],
        'article_selectors': ['article', '.story', '.content', '.article'],
        'enabled': True
    }
}

load_dotenv()

# Database configuration
DATABASE_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'connection_string': os.getenv('DATABASE_URL')
}

# Scraping configuration
SCRAPING_CONFIG = {
    'max_articles_per_source': 50,
    'request_delay': 1,  # seconds between requests
    'timeout': 30,  # seconds
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
}

# Word processing configuration
WORD_PROCESSING_CONFIG = {
    'min_word_length': 3,
    'max_word_length': 20,
    'common_words_to_exclude': [
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'
    ]
}

# Logging configuration
LOGGING_CONFIG = {
    'level': 'INFO',
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': 'scraper.log'
}
