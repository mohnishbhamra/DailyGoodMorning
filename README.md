# DailyGoodMorning 🌅

A Discord bot that sends daily good morning wishes with information about Sikh religious observances. The bot uses Google's Gemini AI to check if the current day has significance in Sikhism, including:

- Parkash Purab (birthdays) of the 10 Sikh Gurus
- Shaheedi Divas (martyrdom days) of Sikh Gurus
- Sangrand (first day of Nanakshahi calendar month)
- Bandi Chhor Divas
- Other important Sikh religious days

## Features

- 🤖 **Discord Bot**: Automatically posts to Discord channels
- 🧠 **AI-Powered**: Uses Gemini AI to fetch relevant Sikh religious information
- ⏰ **Automated**: Runs daily at 6:00 AM IST via GitHub Actions
- 🙏 **Respectful**: Provides concise, respectful information about Sikh observances

## Setup Instructions

### Prerequisites

- Node.js 20 or higher
- A Discord Bot Token
- A Google Gemini API Key

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under "TOKEN", click "Copy" to copy your bot token
5. Enable the following Privileged Gateway Intents:
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT
6. Go to "OAuth2" → "URL Generator"
7. Select scopes: `bot`
8. Select bot permissions: `Send Messages`, `View Channels`
9. Copy the generated URL and open it in your browser to invite the bot to your server

### 2. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 3. Local Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/mohnishbhamra/DailyGoodMorning.git
   cd DailyGoodMorning
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your tokens:
   ```env
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   RUN_ONCE=false
   ```

5. Run the bot:
   ```bash
   npm start
   ```

### 4. GitHub Actions Setup (Automated Daily Execution)

To enable automated daily messages at 6:00 AM IST:

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following repository secrets:
   - `DISCORD_BOT_TOKEN`: Your Discord bot token
   - `GEMINI_API_KEY`: Your Gemini API key

The GitHub Actions workflow will automatically run every day at 6:00 AM IST (00:30 UTC).

### Manual Trigger

You can manually trigger the workflow from the Actions tab:

1. Go to the "Actions" tab in your GitHub repository
2. Select "Daily Good Morning Wish" workflow
3. Click "Run workflow"

## How It Works

1. **Scheduled Execution**: GitHub Actions triggers the workflow daily at 6:00 AM IST
2. **AI Query**: The bot asks Gemini AI about today's significance in Sikhism
3. **Message Composition**: A good morning message is created with the religious information
4. **Discord Distribution**: The message is sent to all Discord servers where the bot is installed

## Channel Selection

The bot will send messages to channels in this priority order:
1. `#general` channel (if exists)
2. `#good-morning` channel (if exists)
3. First available text channel

## Message Format

```
🌅 **Good Morning! Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!** 🙏

[Information about today's Sikh religious significance, if any]

Have a blessed day! ✨
```

## Configuration

- **Timezone**: The bot is configured for IST (Indian Standard Time)
- **Schedule**: Daily at 6:00 AM IST (00:30 UTC)
- **AI Model**: Google Gemini 1.5 Flash

## Troubleshooting

### Bot doesn't send messages
- Ensure the bot has "Send Messages" and "View Channels" permissions
- Check that the bot is properly invited to your Discord server
- Verify that your tokens are correctly set in GitHub Secrets

### GitHub Actions fails
- Check the Actions tab for error logs
- Ensure secrets are properly configured
- Verify that the repository has Actions enabled

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Acknowledgments

- Discord.js for the Discord API wrapper
- Google Generative AI for the Gemini API
- The Sikh community for inspiration

---

**Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!** 🙏
