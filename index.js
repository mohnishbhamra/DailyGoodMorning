require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cron = require('node-cron');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to get Sikh religious information for today
async function getSikhReligiousInfo() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const prompt = `Today is ${dateStr}. Please check if today is significant in Sikhism. Specifically check if today is:
1. Birthday (Parkash Purab) of any of the 10 Sikh Gurus
2. Martyrdom day (Shaheedi Divas) of any Sikh Guru
3. Sangrand (first day of a month in the Nanakshahi calendar)
4. Bandi Chhor Divas
5. Any other important Sikh religious day

If today is significant, provide a brief description (2-3 sentences) about the significance. If today is not a special Sikh religious day, just say "No significant Sikh religious observance today."

Keep the response concise and respectful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error fetching Sikh religious info:', error);
    return 'Unable to fetch religious information at this time.';
  }
}

// Function to send good morning message
async function sendGoodMorningMessage() {
  try {
    console.log('Sending good morning message...');
    
    const religiousInfo = await getSikhReligiousInfo();
    
    const goodMorningMessage = `🌅 **Good Morning! Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!** 🙏

${religiousInfo}

Have a blessed day! ✨`;

    // Send message to all guilds the bot is in
    const sendPromises = [];
    
    for (const guild of client.guilds.cache.values()) {
      const promise = (async () => {
        try {
          // Find a suitable channel to send the message
          // Priority: #general, #good-morning, first text channel
          let channel = guild.channels.cache.find(ch => 
            ch.name === 'general' && ch.isTextBased()
          );
          
          if (!channel) {
            channel = guild.channels.cache.find(ch => 
              ch.name === 'good-morning' && ch.isTextBased()
            );
          }
          
          if (!channel) {
            channel = guild.channels.cache.find(ch => ch.isTextBased());
          }
          
          if (channel) {
            await channel.send(goodMorningMessage);
            console.log(`Message sent to guild: ${guild.name}`);
          } else {
            console.log(`No suitable channel found in guild: ${guild.name}`);
          }
        } catch (error) {
          console.error(`Error sending message to guild ${guild.name}:`, error);
        }
      })();
      
      sendPromises.push(promise);
    }
    
    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.error('Error in sendGoodMorningMessage:', error);
  }
}

// Bot ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot is in ${client.guilds.cache.size} server(s)`);
  
  // Schedule cron job for 6:00 AM IST (00:30 UTC - IST is UTC+5:30)
  // Note: GitHub Actions will handle the scheduling, but this is for local testing
  cron.schedule('30 0 * * *', () => {
    console.log('Cron job triggered at 6:00 AM IST');
    sendGoodMorningMessage().catch(error => {
      console.error('Error in cron job:', error);
    });
  }, {
    timezone: "UTC"
  });
  
  console.log('Scheduled job set for 6:00 AM IST (00:30 UTC)');
  
  // If running in GitHub Actions mode (one-time execution)
  if (process.env.RUN_ONCE === 'true') {
    console.log('Running in one-time execution mode');
    sendGoodMorningMessage().then(() => {
      console.log('Message sent, exiting...');
      process.exit(0);
    }).catch(error => {
      console.error('Error in one-time execution:', error);
      process.exit(1);
    });
  }
});

// Handle errors
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);
