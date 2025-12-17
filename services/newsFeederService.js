const Parser = require('rss-parser');
const geminiService = require('./geminiService');

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
      national: 'https://www.thehindu.com/news/national/feeder/default.rss',
      bangalore: 'https://www.thehindu.com/news/cities/bangalore/feeder/default.rss'
    };

    // Configuration for each news category - just add new categories here
    this.categoryConfig = {
      business: { feedKey: 'business', displayName: 'Business' },
      national: { feedKey: 'national', displayName: 'National' },
      bangalore: { feedKey: 'bangalore', displayName: 'Bangalore' }
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
   * Generic method to get news by category
   * @param {string} category - News category key (must exist in feeds object)
   * @param {number} limit - Number of news items to fetch (default: 10)
   * @returns {Promise<Array>} - Array of news items
   */
  async getNewsByCategory(category, limit = 10) {
    const feedUrl = this.feeds[category];
    if (!feedUrl) {
      throw new Error(`Unknown news category: ${category}. Available categories: ${Object.keys(this.feeds).join(', ')}`);
    }

    try {
      const news = await this.fetchFeed(feedUrl);
      return news.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error.message);
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

  /**
   * Get news summary for a specific category (RSS feed based)
   * @param {string} category - News category ('business', 'national', 'bangalore')
   * @param {Object} options - Options for news delivery
   * @param {boolean} options.summarize - Whether to summarize news using AI (default: true)
   * @param {number} options.limit - Number of news items to fetch (default: 10)
   * @returns {Promise<string>} - Formatted or summarized news ready to send
   */
  async getNewsSummary(category, options = {}) {
    const { summarize = true, limit = 10 } = options;
    
    const config = this.categoryConfig[category.toLowerCase()];
    if (!config) {
      throw new Error(`Unknown news category: ${category}. Available categories: ${Object.keys(this.categoryConfig).join(', ')}`);
    }
    
    try {
      console.log(`Fetching ${config.displayName} news from RSS feed...`);
      const news = await this.getNewsByCategory(config.feedKey, limit);
      
      if (!news || news.length === 0) {
        console.log(`No ${config.displayName} news available`);
        return `⚠️ No ${config.displayName} news available at the moment.`;
      }
      
      if (summarize) {
        try {
          console.log(`Summarizing ${config.displayName} news with AI...`);
          const newsForAI = this.formatNewsForSummarization(news);
          const summary = await geminiService.summarizeNews(newsForAI, config.displayName, news.length);
          
          console.log(`${config.displayName} news summarized successfully`);
          return summary;
        } catch (aiError) {
          console.error('AI summarization failed, falling back to raw news:', aiError.message);
          console.log(`Using raw ${config.displayName} news as fallback...`);
          const formattedNews = this.formatNewsForDisplay(news, config.displayName);
          return `⚠️ AI summarization unavailable. Sending raw news:\n\n${formattedNews}`;
        }
      } else {
        console.log(`Formatting raw ${config.displayName} news...`);
        return this.formatNewsForDisplay(news, config.displayName);
      }
    } catch (error) {
      console.error(`Error fetching ${config.displayName} news:`, error);
      return `❌ Error fetching ${config.displayName} news. Please try again later.`;
    }
  }
}

module.exports = new NewsFeederService();
