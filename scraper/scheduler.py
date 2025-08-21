"""
Scheduler for running the news scraper at regular intervals
"""

import schedule
import time
import logging
from datetime import datetime
from news_scraper import NewsScraper

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper_scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def run_scraping_job():
    """Run the daily scraping job"""
    try:
        logger.info("Starting scheduled scraping job")
        scraper = NewsScraper()
        scraper.run_daily_scrape()
        logger.info("Scheduled scraping job completed successfully")
    except Exception as e:
        logger.error(f"Error in scheduled scraping job: {e}")

def run_word_frequency_update():
    """Run word frequency update for all time periods"""
    try:
        logger.info("Starting word frequency update job")
        scraper = NewsScraper()
        
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        
        # Update word frequencies for different time periods
        time_periods = {
            'past_day': (now - timedelta(days=1), now),
            'past_week': (now - timedelta(days=7), now),
            'past_month': (now - timedelta(days=30), now),
            'past_year': (now - timedelta(days=365), now),
            'last_week': (now - timedelta(days=14), now - timedelta(days=7)),
            'last_month': (now - timedelta(days=60), now - timedelta(days=30)),
            'last_year': (now - timedelta(days=730), now - timedelta(days=365))
        }
        
        for period_name, (start_date, end_date) in time_periods.items():
            scraper.update_word_frequencies(period_name, start_date, end_date)
        
        logger.info("Word frequency update job completed successfully")
    except Exception as e:
        logger.error(f"Error in word frequency update job: {e}")

def setup_schedule():
    """Set up the scheduling for different jobs"""
    
    # Run scraping every 6 hours
    schedule.every(6).hours.do(run_scraping_job)
    
    # Run word frequency updates every 12 hours
    schedule.every(12).hours.do(run_word_frequency_update)
    
    # Run scraping at specific times (morning and evening)
    schedule.every().day.at("06:00").do(run_scraping_job)
    schedule.every().day.at("18:00").do(run_scraping_job)
    
    # Run word frequency update daily at midnight
    schedule.every().day.at("00:00").do(run_word_frequency_update)
    
    logger.info("Scheduler setup completed")
    logger.info("Jobs scheduled:")
    logger.info("- Scraping: Every 6 hours, 6:00 AM, 6:00 PM")
    logger.info("- Word frequency update: Every 12 hours, 12:00 AM")

def run_scheduler():
    """Run the scheduler continuously"""
    logger.info("Starting scheduler...")
    
    # Run initial jobs
    logger.info("Running initial scraping job...")
    run_scraping_job()
    
    logger.info("Running initial word frequency update...")
    run_word_frequency_update()
    
    # Set up schedule
    setup_schedule()
    
    # Keep the scheduler running
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user")
            break
        except Exception as e:
            logger.error(f"Error in scheduler: {e}")
            time.sleep(300)  # Wait 5 minutes before retrying

if __name__ == "__main__":
    run_scheduler()
