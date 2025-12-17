require('dotenv').config();
const discordService = require('./services/discordService');
const greetService = require('./services/greetService');
const newsFeederService = require('./services/newsFeederService');

/**
 * Send greeting messages with religious information
 * @param {string} userId - Discord user ID
 */
async function greet(userId) {
  const greetingMessages = await greetService.generateGreetingMessages();

  console.log('Sending Hindi message...');
  await discordService.sendMessageToUser(userId, greetingMessages.hindi);

  console.log('Sending English message...');
  await discordService.sendMessageToUser(userId, greetingMessages.english);
}

/**
 * Send news from RSS feed for a specific category
 * @param {string} userId - Discord user ID
 * @param {string} category - News category ('business', 'national', 'bangalore')
 * @param {Object} options - Options for news delivery
 * @param {boolean} options.summarize - Whether to summarize news using AI (default: true)
 * @param {number} options.limit - Number of news items to fetch (default: 10)
 */
async function sendNewsFromRSSFeed(userId, category, options = {}) {
  try {
    const newsSummary = await newsFeederService.getNewsSummary(category, options);
    await discordService.sendMessageToUser(userId, newsSummary);
    
    // Add delay after sending to avoid Discord rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`Error sending ${category} news:`, error);
    await discordService.sendMessageToUser(userId, `❌ Error processing ${category} news. Please try again later.`);
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

    // Send greetings flavour 1
    await greet(masterUserId);
    
    // Send greetings flavour 2
    await greet(masterUserId);
    
    // Send RSS feed news - you can choose to summarize or send raw
    // Option 1: Send summarized news (default)
    await sendNewsFromRSSFeed(masterUserId, 'business', { summarize: true, limit: 10 });
    await sendNewsFromRSSFeed(masterUserId, 'national', { summarize: true, limit: 10 });
    await sendNewsFromRSSFeed(masterUserId, 'bangalore', { summarize: true, limit: 10 });
    
    // Wait a bit before destroying client to ensure all messages are sent
    await new Promise(resolve => setTimeout(resolve, 2000));

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
