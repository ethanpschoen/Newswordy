"""
Main news scraper for collecting headlines from various news sources
"""

import requests
import feedparser
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time
import logging
from typing import List, Dict, Optional, Tuple
from urllib.parse import urljoin, urlparse
import re

from config import NEWS_SOURCES, SCRAPING_CONFIG
from database import DatabaseManager
from word_processor import WordProcessor

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NewsScraper:
    """Main scraper class for collecting news headlines"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': SCRAPING_CONFIG['user_agent']
        })
        self.db_manager = DatabaseManager()
        self.word_processor = WordProcessor()
    
    def get_rss_feed(self, rss_url: str) -> List[Dict]:
        """Parse RSS feed and extract article information"""
        try:
            logger.info(f"Fetching RSS feed: {rss_url}")
            
            response = self.session.get(rss_url, timeout=SCRAPING_CONFIG['timeout'])
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            articles = []
            
            for entry in feed.entries[:SCRAPING_CONFIG['max_articles_per_source']]:
                article = {
                    'title': entry.get('title', ''),
                    'link': entry.get('link', ''),
                    'published': self._parse_date(entry.get('published', '')),
                    'summary': entry.get('summary', '')
                }
                articles.append(article)
            
            logger.info(f"Extracted {len(articles)} articles from RSS feed")
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching RSS feed {rss_url}: {e}")
            return []
    
    def scrape_website_headlines(self, source_config: Dict) -> List[Dict]:
        """Scrape headlines directly from website"""
        try:
            logger.info(f"Scraping website: {source_config['url']}")
            
            response = self.session.get(source_config['url'], timeout=SCRAPING_CONFIG['timeout'])
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Try different selectors for headlines
            for selector in source_config['headline_selectors']:
                headlines = soup.select(selector)
                if headlines:
                    logger.info(f"Found {len(headlines)} headlines with selector: {selector}")
                    break
            
            if not headlines:
                logger.warning(f"No headlines found for {source_config['name']}")
                return []
            
            # Extract article information
            for headline in headlines[:SCRAPING_CONFIG['max_articles_per_source']]:
                title = headline.get_text(strip=True)
                if not title:
                    continue
                
                # Try to find the article link
                link = self._extract_article_link(headline, source_config['url'])
                
                article = {
                    'title': title,
                    'link': link,
                    'published': None,  # Will be None for direct scraping
                    'summary': ''
                }
                articles.append(article)
            
            logger.info(f"Extracted {len(articles)} articles from website")
            return articles
            
        except Exception as e:
            logger.error(f"Error scraping website {source_config['url']}: {e}")
            return []
    
    def _extract_article_link(self, headline_element, base_url: str) -> str:
        """Extract article link from headline element"""
        # Look for link in the headline element or its parent
        link_element = headline_element.find('a') or headline_element.parent.find('a')
        
        if link_element and link_element.get('href'):
            href = link_element.get('href')
            # Convert relative URLs to absolute
            if href.startswith('/'):
                return urljoin(base_url, href)
            elif href.startswith('http'):
                return href
            else:
                return urljoin(base_url, href)
        
        return ""
    
    def _parse_date(self, date_string: str) -> Optional[datetime]:
        """Parse date string from RSS feed"""
        if not date_string:
            return None
        
        try:
            # Try common date formats
            date_formats = [
                '%a, %d %b %Y %H:%M:%S %z',
                '%a, %d %b %Y %H:%M:%S %Z',
                '%Y-%m-%dT%H:%M:%S%z',
                '%Y-%m-%dT%H:%M:%SZ',
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%d'
            ]
            
            for fmt in date_formats:
                try:
                    return datetime.strptime(date_string, fmt)
                except ValueError:
                    continue
            
            # If all formats fail, try to extract date using regex
            date_match = re.search(r'(\d{4}-\d{2}-\d{2})', date_string)
            if date_match:
                return datetime.strptime(date_match.group(1), '%Y-%m-%d')
            
            logger.warning(f"Could not parse date: {date_string}")
            return None
            
        except Exception as e:
            logger.error(f"Error parsing date {date_string}: {e}")
            return None
    
    def scrape_source(self, source_key: str, source_config: Dict) -> List[Dict]:
        """Scrape articles from a single source"""
        start_time = datetime.utcnow()
        articles = []
        
        try:
            logger.info(f"Starting to scrape {source_config['name']}")
            
            # Try RSS feed first
            if source_config.get('rss_feed'):
                articles = self.get_rss_feed(source_config['rss_feed'])
            
            # If RSS feed is empty or doesn't exist, try direct scraping
            if not articles:
                articles = self.scrape_website_headlines(source_config)
            
            # Save articles to database
            saved_count = 0
            for article in articles:
                try:
                    self.db_manager.save_article(
                        source=source_key,
                        headline=article['title'],
                        url=article['link'],
                        published_date=article['published'],
                        content=article.get('summary', '')
                    )
                    saved_count += 1
                except Exception as e:
                    logger.error(f"Error saving article: {e}")
            
            end_time = datetime.utcnow()
            
            # Log scraping activity
            self.db_manager.log_scraping_activity(
                source=source_key,
                status='success' if saved_count > 0 else 'error',
                articles_scraped=saved_count,
                start_time=start_time,
                end_time=end_time
            )
            
            logger.info(f"Successfully scraped {saved_count} articles from {source_config['name']}")
            return articles
            
        except Exception as e:
            end_time = datetime.utcnow()
            
            # Log error
            self.db_manager.log_scraping_activity(
                source=source_key,
                status='error',
                error_message=str(e),
                start_time=start_time,
                end_time=end_time
            )
            
            logger.error(f"Error scraping {source_config['name']}: {e}")
            return []
    
    def scrape_all_sources(self) -> Dict[str, List[Dict]]:
        """Scrape all enabled news sources"""
        results = {}
        
        for source_key, source_config in NEWS_SOURCES.items():
            if not source_config.get('enabled', True):
                logger.info(f"Skipping disabled source: {source_config['name']}")
                continue
            
            logger.info(f"Scraping source: {source_config['name']}")
            
            # Add delay between requests
            time.sleep(SCRAPING_CONFIG['request_delay'])
            
            articles = self.scrape_source(source_key, source_config)
            results[source_key] = articles
        
        return results
    
    def update_word_frequencies(self, time_period: str, start_date: datetime, end_date: datetime):
        """Update word frequencies for a specific time period"""
        try:
            logger.info(f"Updating word frequencies for {time_period}")
            
            # Get articles from database for the time period
            articles = self.db_manager.get_articles_by_date_range(start_date, end_date)
            
            if not articles:
                logger.warning(f"No articles found for time period {time_period}")
                return
            
            # Extract headlines
            headlines = [article.headline for article in articles if article.headline]
            
            # Process headlines to get word frequencies
            word_frequencies = self.word_processor.analyze_headlines(
                headlines, 
                min_frequency=2, 
                top_n=100
            )
            
            # Save word frequencies to database
            self.db_manager.save_word_frequencies(
                word_frequencies, 
                time_period, 
                start_date, 
                end_date
            )
            
            logger.info(f"Updated word frequencies for {time_period}: {len(word_frequencies)} words")
            
        except Exception as e:
            logger.error(f"Error updating word frequencies for {time_period}: {e}")
    
    def run_daily_scrape(self):
        """Run daily scraping and update word frequencies"""
        logger.info("Starting daily scraping process")
        
        # Scrape all sources
        results = self.scrape_all_sources()
        
        # Calculate time periods
        now = datetime.utcnow()
        
        # Update word frequencies for different time periods
        time_periods = {
            'past_day': (now - timedelta(days=1), now),
            'past_week': (now - timedelta(days=7), now),
            'past_month': (now - timedelta(days=30), now),
            'past_year': (now - timedelta(days=365), now)
        }
        
        for period_name, (start_date, end_date) in time_periods.items():
            self.update_word_frequencies(period_name, start_date, end_date)
        
        logger.info("Daily scraping process completed")

def main():
    """Main function to run the scraper"""
    scraper = NewsScraper()
    
    # Run daily scrape
    scraper.run_daily_scrape()

if __name__ == "__main__":
    main()
