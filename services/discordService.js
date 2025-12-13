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
    
    // Add newline at the end for better message separation
    const messageWithNewline = message + '\n';
    
    // Discord message limit is 2000 characters
    const DISCORD_MESSAGE_LIMIT = 2000;
    
    // If message is within limit, send it directly
    if (messageWithNewline.length <= DISCORD_MESSAGE_LIMIT) {
      await user.send(messageWithNewline);
      console.log(`Message sent to user: ${user.tag}`);
      return;
    }
    
    // Split message into chunks if it exceeds the limit
    const chunks = [];
    let currentChunk = '';
    const lines = messageWithNewline.split('\n');
    
    for (const line of lines) {
      // If adding this line exceeds limit, save current chunk and start new one
      if ((currentChunk + line + '\n').length > DISCORD_MESSAGE_LIMIT) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        // If a single line is too long, split it further
        if (line.length > DISCORD_MESSAGE_LIMIT) {
          let remainingLine = line;
          while (remainingLine.length > 0) {
            chunks.push(remainingLine.substring(0, DISCORD_MESSAGE_LIMIT));
            remainingLine = remainingLine.substring(DISCORD_MESSAGE_LIMIT);
          }
          currentChunk = '';
        } else {
          currentChunk = line + '\n';
        }
      } else {
        currentChunk += line + '\n';
      }
    }
    
    // Add the last chunk if it exists
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    // Send all chunks with a small delay between them
    for (let i = 0; i < chunks.length; i++) {
      await user.send(chunks[i]);
      console.log(`Message chunk ${i + 1}/${chunks.length} sent to user: ${user.tag}`);
      // Small delay to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
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
