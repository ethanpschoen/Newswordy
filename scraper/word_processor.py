"""
Word processing module for analyzing headlines and extracting word frequencies
"""

import re
import string
from collections import Counter
from typing import List, Dict
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import logging
from config import WORD_PROCESSING_CONFIG

# Set up logging
logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class WordProcessor:
    """Class for processing headlines and extracting word frequencies"""
    
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.common_words = set(WORD_PROCESSING_CONFIG['common_words_to_exclude'])
        self.min_word_length = WORD_PROCESSING_CONFIG['min_word_length']
        self.max_word_length = WORD_PROCESSING_CONFIG['max_word_length']
        
        # Combine stop words and common words
        self.excluded_words = self.stop_words.union(self.common_words)
        
        # Common news-specific words to exclude
        self.news_words = {
            'new', 'news', 'breaking', 'update', 'latest', 'report', 'reports',
            'reported', 'says', 'said', 'according', 'official', 'officials', 'government',
            'announced', 'announcement', 'statement', 'comment', 'comments', 'response',
            'responded', 'saying', 'told', 'tells', 'telling', 'speaking', 'spoke', 'watch',
            'address', 'addressed', 'meeting', 'meet', 'met', 'conference', 'press', 'say',
        }
        
        # Add news-specific words to excluded words
        self.excluded_words = self.excluded_words.union(self.news_words)
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters but keep apostrophes and hyphens within words
        text = re.sub(r'[^\w\s\'-]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize_text(self, text: str) -> List[str]:
        """Tokenize text into words"""
        try:
            # Use NLTK tokenizer
            tokens = word_tokenize(text)
            
            # Filter out non-alphabetic tokens and normalize
            words = []
            for token in tokens:
                # Remove punctuation from start/end
                token = token.strip(string.punctuation)
                
                # Check if token is valid
                if (token and 
                    token.isalpha() and 
                    len(token) >= self.min_word_length and
                    len(token) <= self.max_word_length and
                    token.lower() not in self.excluded_words):
                    words.append(token.lower())
            
            return words
        except Exception as e:
            logger.error(f"Error tokenizing text: {e}")
            return []
    
    def process_headlines(self, headlines: List[str]) -> Dict[str, int]:
        """Process a list of headlines and return word frequencies"""
        word_counter = Counter()
        
        for headline in headlines:
            if not headline:
                continue
            
            # Clean the headline
            cleaned_headline = self.clean_text(headline)
            
            # Tokenize into words
            words = self.tokenize_text(cleaned_headline)
            
            # Add to counter
            word_counter.update(words)
        
        return dict(word_counter)
    
    def get_top_words(self, word_frequencies: Dict[str, int], top_n: int = 100) -> Dict[str, int]:
        """Get the top N most frequent words"""
        sorted_words = sorted(word_frequencies.items(), key=lambda x: x[1], reverse=True)
        return dict(sorted_words[:top_n])
    
    def filter_words_by_frequency(self, word_frequencies: Dict[str, int], 
                                min_frequency: int = 2) -> Dict[str, int]:
        """Filter words by minimum frequency"""
        return {word: freq for word, freq in word_frequencies.items() 
                if freq >= min_frequency}
    
    def analyze_headlines(self, headlines: List[str], 
                         min_frequency: int = 2, 
                         top_n: int = 100) -> Dict[str, int]:
        """Complete analysis of headlines"""
        logger.info(f"Processing {len(headlines)} headlines")
        
        # Process headlines
        word_frequencies = self.process_headlines(headlines)
        
        # Filter by minimum frequency
        filtered_frequencies = self.filter_words_by_frequency(word_frequencies, min_frequency)
        
        # Get top words
        top_words = self.get_top_words(filtered_frequencies, top_n)
        
        logger.info(f"Found {len(top_words)} unique words with frequency >= {min_frequency}")
        
        return top_words
    
    def get_word_statistics(self, word_frequencies: Dict[str, int]) -> Dict:
        """Get statistics about word frequencies"""
        if not word_frequencies:
            return {
                'total_words': 0,
                'unique_words': 0,
                'total_frequency': 0,
                'average_frequency': 0,
                'max_frequency': 0,
                'min_frequency': 0
            }
        
        frequencies = list(word_frequencies.values())
        
        return {
            'total_words': len(word_frequencies),
            'unique_words': len(set(word_frequencies.keys())),
            'total_frequency': sum(frequencies),
            'average_frequency': sum(frequencies) / len(frequencies),
            'max_frequency': max(frequencies),
            'min_frequency': min(frequencies)
        }

# Example usage
if __name__ == "__main__":
    processor = WordProcessor()
    
    # Test headlines
    test_headlines = [
        "Breaking News: President announces new policy on climate change",
        "Climate change policy receives mixed reactions from experts",
        "New climate policy aims to reduce emissions by 2030",
        "Experts debate effectiveness of climate change measures",
        "Climate activists welcome new environmental policy"
    ]
    
    # Analyze headlines
    word_freq = processor.analyze_headlines(test_headlines)
    
    print("Word frequencies:")
    for word, freq in word_freq.items():
        print(f"{word}: {freq}")
    
    # Get statistics
    stats = processor.get_word_statistics(word_freq)
    print(f"\nStatistics: {stats}")
