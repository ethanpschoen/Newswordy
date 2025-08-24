"""
Scheduler for running the news scraper at regular intervals
"""

import schedule
import time
import logging
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

def setup_schedule():
    """Set up the scheduling for different jobs"""
    
    # Run scraping every 6 hours
    schedule.every(6).hours.do(run_scraping_job)

    # Run scraping at specific times (morning and evening)
    schedule.every().day.at("06:00").do(run_scraping_job)
    schedule.every().day.at("18:00").do(run_scraping_job)
    
    logger.info("Scheduler setup completed")
    logger.info("Jobs scheduled:")
    logger.info("- Scraping: Every 6 hours, 6:00 AM, 6:00 PM")

def run_scheduler():
    """Run the scheduler continuously"""
    logger.info("Starting scheduler...")
    
    # Run initial jobs
    logger.info("Running initial scraping job...")
    run_scraping_job()
    
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
