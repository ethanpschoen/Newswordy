"""
Database models and connection for the Newswordy scraper
"""

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import logging
from config import DATABASE_CONFIG

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database engine
def get_database_url():
    """Get database URL from environment or config"""
    if DATABASE_CONFIG['connection_string']:
        return DATABASE_CONFIG['connection_string']
    
    return f"postgresql://{DATABASE_CONFIG['user']}:{DATABASE_CONFIG['password']}@{DATABASE_CONFIG['host']}:{DATABASE_CONFIG['port']}/{DATABASE_CONFIG['database']}"

try:
    engine = create_engine(get_database_url())
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    raise

class Article(Base):
    """Model for storing scraped articles"""
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(50), nullable=False, index=True)
    headline = Column(Text, nullable=False)
    url = Column(String(500), nullable=False)
    published_date = Column(DateTime, nullable=True)
    scraped_date = Column(DateTime, default=datetime.utcnow)
    content = Column(Text, nullable=True)
    
    # Create index on source and published_date for efficient queries
    __table_args__ = (
        Index('idx_source_date', 'source', 'published_date'),
    )

class WordFrequency(Base):
    """Model for storing word frequencies by time period"""
    __tablename__ = "word_frequencies"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    word = Column(String(100), nullable=False, index=True)
    frequency = Column(Integer, nullable=False, default=0)
    time_period = Column(String(50), nullable=False, index=True)
    start_date = Column(DateTime, nullable=False, index=True)
    end_date = Column(DateTime, nullable=False, index=True)
    created_date = Column(DateTime, default=datetime.utcnow)
    
    # Create unique index on word and time_period
    __table_args__ = (
        Index('idx_word_period', 'word', 'time_period', unique=True),
    )

class ScrapingLog(Base):
    """Model for logging scraping activities"""
    __tablename__ = "scraping_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    source = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)  # success, error, partial
    articles_scraped = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)

def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except SQLAlchemyError as e:
        logger.error(f"Failed to create tables: {e}")
        raise

def get_db_session():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class DatabaseManager:
    """Database manager for handling database operations"""
    
    def __init__(self):
        self.session = SessionLocal()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.session.close()
    
    def save_article(self, source: str, headline: str, url: str, 
                    published_date: datetime = None, content: str = None):
        """Save an article to the database"""
        try:
            article = Article(
                source=source,
                headline=headline,
                url=url,
                published_date=published_date,
                content=content
            )
            self.session.add(article)
            self.session.commit()
            return article.id
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Failed to save article: {e}")
            raise
    
    def save_word_frequencies(self, word_freq_data: dict, time_period: str, 
                            start_date: datetime, end_date: datetime):
        """Save word frequencies for a time period"""
        try:
            for word, frequency in word_freq_data.items():
                # Check if word frequency already exists for this period
                existing = self.session.query(WordFrequency).filter(
                    WordFrequency.word == word,
                    WordFrequency.time_period == time_period
                ).first()
                
                if existing:
                    existing.frequency = frequency
                    existing.start_date = start_date
                    existing.end_date = end_date
                else:
                    word_freq = WordFrequency(
                        word=word,
                        frequency=frequency,
                        time_period=time_period,
                        start_date=start_date,
                        end_date=end_date
                    )
                    self.session.add(word_freq)
            
            self.session.commit()
            logger.info(f"Saved {len(word_freq_data)} word frequencies for {time_period}")
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Failed to save word frequencies: {e}")
            raise
    
    def get_articles_by_date_range(self, start_date: datetime, end_date: datetime, 
                                 source: str = None):
        """Get articles within a date range"""
        query = self.session.query(Article).filter(
            Article.published_date >= start_date,
            Article.published_date <= end_date
        )
        
        if source:
            query = query.filter(Article.source == source)
        
        return query.all()
    
    def get_word_frequencies(self, time_period: str, limit: int = 100):
        """Get word frequencies for a time period, ordered by frequency"""
        return self.session.query(WordFrequency).filter(
            WordFrequency.time_period == time_period
        ).order_by(WordFrequency.frequency.desc()).limit(limit).all()
    
    def log_scraping_activity(self, source: str, status: str, articles_scraped: int = 0,
                            error_message: str = None, start_time: datetime = None,
                            end_time: datetime = None):
        """Log scraping activity"""
        try:
            duration = None
            if start_time and end_time:
                duration = (end_time - start_time).total_seconds()
            
            log_entry = ScrapingLog(
                source=source,
                status=status,
                articles_scraped=articles_scraped,
                error_message=error_message,
                start_time=start_time or datetime.utcnow(),
                end_time=end_time,
                duration_seconds=duration
            )
            
            self.session.add(log_entry)
            self.session.commit()
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Failed to log scraping activity: {e}")
            raise

# Initialize database tables
if __name__ == "__main__":
    create_tables()
