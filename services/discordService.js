const { Client, GatewayIntentBits } = require('discord.js');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ]
});

let isReady = false;

/**
 * Initialize the Discord client
 * @returns {Promise<void>}
 */
async function initialize() {
  return new Promise((resolve, reject) => {
    client.once('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`);
      isReady = true;
      resolve();
    });

    client.on('error', error => {
      console.error('Discord client error:', error);
      reject(error);
    });

    client.login(process.env.DISCORD_BOT_TOKEN).catch(reject);
  });
}

/**
 * Send a message to a specific user by their ID
 * @param {string} userId - The Discord user ID to send the message to
 * @param {string} message - The message content to send
 * @returns {Promise<void>}
 */
async function sendMessageToUser(userId, message) {
  if (!isReady) {
    throw new Error('Discord client is not ready yet');
  }

  try {
    const user = await client.users.fetch(userId);
    await user.send(message);
    console.log(`Message sent to user: ${user.tag}`);
  } catch (error) {
    console.error(`Error sending message to user ${userId}:`, error);
    throw error;
  }
}

/**
 * Destroy the Discord client and clean up resources
 */
function destroyClient() {
  if (client) {
    console.log('Destroying Discord client...');
    client.destroy();
    isReady = false;
  }
}

module.exports = {
  initialize,
  sendMessageToUser,
  destroyClient
};
