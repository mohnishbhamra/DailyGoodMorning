require('dotenv').config();
const discordService = require('./services/discordService');
const geminiService = require('./services/geminiService');

/**
 * Main function to send good morning message
 */
async function sendGoodMorning() {
  try {
    console.log('Initializing Discord client...');
    await discordService.initialize();

    console.log('Fetching Sikh religious information...');
    const religiousInfo = await geminiService.getSikhReligiousInfo();

    const goodMorningMessage = `🌅 **Good Morning! Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!** 🙏

${religiousInfo}

Have a blessed day! ✨`;

    const masterUserId = process.env.DISCORD_MASTER_ID;
    if (!masterUserId) {
      throw new Error('DISCORD_MASTER_ID environment variable is not set');
    }

    console.log('Sending good morning message...');
    await discordService.sendMessageToUser(masterUserId, goodMorningMessage);

    console.log('Message sent successfully!');
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
