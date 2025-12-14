require('dotenv').config();
const discordService = require('./services/discordService');
const geminiService = require('./services/geminiService');
const newsFeederService = require('./services/newsFeederService');

/**
 * Send greeting messages with religious information
 * @param {string} userId - Discord user ID
 */
async function greet(userId) {
  console.log('Fetching Sikh religious information...');
  const religiousInfo = await geminiService.getSikhReligiousInfo();

  // have a good day in devnagri
  const hindiMessage = religiousInfo.hindi + '\n\n'+ 'आपका दिन शुभ हो!';
  // have a good day in english
  const englishMessage = religiousInfo.english + '\n\n' + 'Have a great day!';

  console.log('Sending Hindi message...');
  await discordService.sendMessageToUser(userId, hindiMessage);

  console.log('Sending English message...');
  await discordService.sendMessageToUser(userId, englishMessage);
}

/**
 * Send nation-level news
 * @param {string} userId - Discord user ID
 * @param {string} nation - Nation name (default: 'India')
 */
async function sendNationNews(userId, nation = 'India') {
  console.log(`Fetching ${nation} news...`);
  const news = await geminiService.getRegionalNews(nation);
  
  console.log(`Sending ${nation} news...`);
  await discordService.sendMessageToUser(userId, news);
}

/**
 * Send regional news
 * @param {string} userId - Discord user ID
 * @param {string} region - Region name
 */
async function sendRegionalNews(userId, region) {
  console.log(`Fetching ${region} news...`);
  const news = await geminiService.getRegionalNews(region);
  
  console.log(`Sending ${region} news...`);
  await discordService.sendMessageToUser(userId, news);
}

/**
 * Send business news from RSS feed
 * @param {string} userId - Discord user ID
 * @param {Object} options - Options for news delivery
 * @param {boolean} options.summarize - Whether to summarize news using AI (default: true)
 * @param {number} options.limit - Number of news items to fetch (default: 10)
 */
async function sendBusinessNews(userId, options = {}) {
  const { summarize = true, limit = 10 } = options;
  
  try {
    console.log('Fetching business news from RSS feed...');
    const businessNews = await newsFeederService.getBusinessNews(limit);
    
    if (!businessNews || businessNews.length === 0) {
      console.log('No business news available');
      await discordService.sendMessageToUser(userId, '⚠️ No business news available at the moment.');
      return;
    }
    
    if (summarize) {
      try {
        console.log('Summarizing business news with AI...');
        const newsForAI = newsFeederService.formatNewsForSummarization(businessNews);
        const summary = await geminiService.summarizeNews(newsForAI, 'Business', businessNews.length);
        
        console.log('Sending summarized business news...');
        await discordService.sendMessageToUser(userId, summary);
      } catch (aiError) {
        console.error('AI summarization failed, falling back to raw news:', aiError.message);
        console.log('Sending raw business news as fallback...');
        const formattedNews = newsFeederService.formatNewsForDisplay(businessNews, 'Business');
        await discordService.sendMessageToUser(userId, '⚠️ AI summarization unavailable. Sending raw news:\n\n' + formattedNews);
      }
    } else {
      console.log('Sending raw business news...');
      const formattedNews = newsFeederService.formatNewsForDisplay(businessNews, 'Business');
      await discordService.sendMessageToUser(userId, formattedNews);
    }
  } catch (error) {
    console.error('Error sending business news:', error);
    await discordService.sendMessageToUser(userId, '❌ Error fetching business news. Please try again later.');
  }
}

/**
 * Send national news from RSS feed
 * @param {string} userId - Discord user ID
 * @param {Object} options - Options for news delivery
 * @param {boolean} options.summarize - Whether to summarize news using AI (default: true)
 * @param {number} options.limit - Number of news items to fetch (default: 10)
 */
async function sendNationalNews(userId, options = {}) {
  const { summarize = true, limit = 10 } = options;
  
  try {
    console.log('Fetching national news from RSS feed...');
    const nationalNews = await newsFeederService.getNationalNews(limit);
    
    if (!nationalNews || nationalNews.length === 0) {
      console.log('No national news available');
      await discordService.sendMessageToUser(userId, '⚠️ No national news available at the moment.');
      return;
    }
    
    if (summarize) {
      try {
        console.log('Summarizing national news with AI...');
        const newsForAI = newsFeederService.formatNewsForSummarization(nationalNews);
        const summary = await geminiService.summarizeNews(newsForAI, 'National', nationalNews.length);
        
        console.log('Sending summarized national news...');
        await discordService.sendMessageToUser(userId, summary);
      } catch (aiError) {
        console.error('AI summarization failed, falling back to raw news:', aiError.message);
        console.log('Sending raw national news as fallback...');
        const formattedNews = newsFeederService.formatNewsForDisplay(nationalNews, 'National');
        await discordService.sendMessageToUser(userId, '⚠️ AI summarization unavailable. Sending raw news:\n\n' + formattedNews);
      }
    } else {
      console.log('Sending raw national news...');
      const formattedNews = newsFeederService.formatNewsForDisplay(nationalNews, 'National');
      await discordService.sendMessageToUser(userId, formattedNews);
    }
  } catch (error) {
    console.error('Error sending national news:', error);
    await discordService.sendMessageToUser(userId, '❌ Error fetching national news. Please try again later.');
  }
}

/**
 * Main function to send good morning message
 */
async function sendGoodMorning() {
  try {
    console.log('Initializing Discord client...');
    await discordService.initialize();

    const masterUserId = process.env.DISCORD_MASTER_ID;
    if (!masterUserId) {
      throw new Error('DISCORD_MASTER_ID environment variable is not set');
    }

    // Send greetings
    await greet(masterUserId);
    
    
    // Send RSS feed news - you can choose to summarize or send raw
    // Option 1: Send summarized news (default)
    await sendBusinessNews(masterUserId, { summarize: true, limit: 10 });
    await sendNationalNews(masterUserId, { summarize: true, limit: 10 });
    

    console.log('All messages sent successfully!');
  } catch (error) {
    console.error('Error in sendGoodMorning:', error);
    throw error;
  } finally {
    // Always destroy the client to ensure the process exits
    discordService.destroyClient();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the function
sendGoodMorning()
  .then(() => {
    console.log('Process complete, exiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
