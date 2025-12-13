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

    // have a good day in devnagri
    const hindiMessage = religiousInfo.hindi + '\n\n'+ 'आपका दिन शुभ हो!';
    // have a good day in english
    const englishMessage = religiousInfo.english + '\n\n' + 'Have a great day!';

    const masterUserId = process.env.DISCORD_MASTER_ID;
    if (!masterUserId) {
      throw new Error('DISCORD_MASTER_ID environment variable is not set');
    }

    console.log('Sending Hindi message...');
    await discordService.sendMessageToUser(masterUserId, hindiMessage);

    console.log('Sending English message...');
    await discordService.sendMessageToUser(masterUserId, englishMessage);

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
