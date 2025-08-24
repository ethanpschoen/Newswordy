"""
Test script for the news scraper
"""

import os
import sys
from dotenv import load_dotenv

from news_scraper import NewsScraper
from word_processor import WordProcessor
from database import create_tables

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_database_connection():
    """Test database connection and create tables"""
    print("Testing database connection...")
    try:
        create_tables()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_word_processor():
    """Test word processing functionality"""
    print("\nTesting word processor...")
    try:
        processor = WordProcessor()
        
        # Test headlines
        test_headlines = [
            "Breaking News: President announces new policy on climate change",
            "Climate change policy receives mixed reactions from experts",
            "New climate policy aims to reduce emissions by 2030",
            "Experts debate effectiveness of climate change measures",
            "Climate activists welcome new environmental policy"
        ]
        
        word_freq = processor.analyze_headlines(test_headlines)
        
        print("✅ Word processor test successful")
        print(f"   Found {len(word_freq)} unique words")
        print(f"   Top words: {list(word_freq.items())[:5]}")
        return True
    except Exception as e:
        print(f"❌ Word processor test failed: {e}")
        return False

def test_single_source_scraping():
    """Test scraping from a single source"""
    print("\nTesting single source scraping...")
    try:
        scraper = NewsScraper()
        
        # Test with BBC (usually reliable)
        from config import NEWS_SOURCES
        bbc_config = NEWS_SOURCES['bbc']
        
        articles = scraper.scrape_source('bbc', bbc_config)
        
        print("✅ Single source scraping test successful")
        print(f"   Scraped {len(articles)} articles from BBC")
        
        if articles:
            print(f"   Sample headline: {articles[0]['title'][:50]}...")
        
        return True
    except Exception as e:
        print(f"❌ Single source scraping test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Running Newswordy scraper tests...\n")
    
    tests = [
        ("Database Connection", test_database_connection),
        ("Word Processor", test_word_processor),
        ("Single Source Scraping", test_single_source_scraping)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"Running {test_name} test...")
        if test_func():
            passed += 1
        print()
    
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The scraper is ready to use.")
    else:
        print("⚠️  Some tests failed. Please check the configuration and try again.")

if __name__ == "__main__":
    main()
