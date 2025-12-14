const Parser = require('rss-parser');

/**
 * Service to fetch and parse RSS news feeds
 */
class NewsFeederService {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'media', { keepArray: true }]
        ]
      }
    });
    
    this.feeds = {
      business: 'https://www.thehindu.com/business/feeder/default.rss',
      national: 'https://www.thehindu.com/news/national/feeder/default.rss'
    };
  }

  /**
   * Fetch and parse RSS feed
   * @param {string} feedUrl - RSS feed URL
   * @returns {Promise<Array>} - Array of news items
   */
  async fetchFeed(feedUrl) {
    try {
      console.log(`Fetching feed from: ${feedUrl}`);
      const feed = await this.parser.parseURL(feedUrl);
      
      return feed.items.map(item => ({
        title: item.title || '',
        description: item.contentSnippet || item.description || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        category: item.category || '',
        content: item.contentSnippet || item.description || ''
      }));
    } catch (error) {
      console.error(`Error fetching feed from ${feedUrl}:`, error.message);
      throw error;
    }
  }

  /**
   * Get business news from The Hindu
   * @param {number} limit - Number of news items to fetch (default: 10)
   * @returns {Promise<Array>} - Array of business news items
   */
  async getBusinessNews(limit = 10) {
    try {
      const news = await this.fetchFeed(this.feeds.business);
      return news.slice(0, limit);
    } catch (error) {
      console.error('Error fetching business news:', error.message);
      throw error;
    }
  }

  /**
   * Get national news from The Hindu
   * @param {number} limit - Number of news items to fetch (default: 10)
   * @returns {Promise<Array>} - Array of national news items
   */
  async getNationalNews(limit = 10) {
    try {
      const news = await this.fetchFeed(this.feeds.national);
      return news.slice(0, limit);
    } catch (error) {
      console.error('Error fetching national news:', error.message);
      throw error;
    }
  }

  /**
   * Format news items into readable text
   * @param {Array} newsItems - Array of news items
   * @param {string} category - Category name for the header
   * @returns {string} - Formatted news text
   */
  formatNewsForDisplay(newsItems, category) {
    let formattedNews = `📰 *${category} News* 📰\n\n`;
    
    newsItems.forEach((item, index) => {
      formattedNews += `${index + 1}. *${item.title}*\n`;
      if (item.description) {
        formattedNews += `   ${item.description}\n`;
      }
      formattedNews += `   🔗 ${item.link}\n`;
      formattedNews += `   📅 ${new Date(item.pubDate).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}\n\n`;
    });
    
    return formattedNews;
  }

  /**
   * Format news items for AI summarization (compact format)
   * @param {Array} newsItems - Array of news items
   * @returns {string} - Formatted news text for AI processing
   */
  formatNewsForSummarization(newsItems) {
    let newsText = '';
    
    newsItems.forEach((item, index) => {
      newsText += `News ${index + 1}:\n`;
      newsText += `Title: ${item.title}\n`;
      newsText += `Description: ${item.contentSnippet}\n`;
      newsText += `Category: ${item.category}\n`;
      newsText += `Published: ${item.pubDate}\n\n`;
    });
    
    return newsText;
  }
}

module.exports = new NewsFeederService();
