# DailyGoodMorning 🌅

A Discord bot that sends daily good morning wishes with information about Sikh religious observances. The bot uses Google's Gemini AI to check if the current day has significance in Sikhism, including:

- Parkash Purab (birthdays) of the 10 Sikh Gurus
- Shaheedi Divas (martyrdom days) of Sikh Gurus
- Sangrand (first day of Nanakshahi calendar month)
- Bandi Chhor Divas
- Other important Sikh religious days

## Features

- 🤖 **Discord Bot**: Sends daily direct messages to a specified user
- 🧠 **AI-Powered**: Uses Gemini AI to fetch relevant Sikh religious information
- ⏰ **Automated**: Runs daily at 6:00 AM IST via GitHub Actions
- 🙏 **Respectful**: Provides concise, respectful information about Sikh observances
- 📦 **Modular**: Clean service-based architecture for easy maintenance

## Project Structure

```
DailyGoodMorning/
├── services/
│   ├── discordService.js    # Discord client management
│   └── geminiService.js      # Gemini AI integration
├── sendGoodmorning.js        # Main entry point
├── .env.example              # Environment variable template
└── .github/workflows/
    └── daily-wish.yml        # GitHub Actions workflow
```

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

### 2. Get Your Discord User ID

1. Open Discord and go to User Settings
2. Go to "Advanced" and enable "Developer Mode"
3. Right-click on your username/profile and select "Copy ID"
4. This is your `DISCORD_MASTER_ID`

### 3. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 4. Local Setup

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

4. Edit `.env` and add your credentials:
   ```env
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   DISCORD_MASTER_ID=your_discord_user_id_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Run the bot:
   ```bash
   npm start
   ```

### 5. GitHub Actions Setup (Automated Daily Execution)

To enable automated daily messages at 6:00 AM IST:

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following repository secrets:
   - `DISCORD_BOT_TOKEN`: Your Discord bot token
   - `DISCORD_MASTER_ID`: Your Discord user ID
   - `GEMINI_API_KEY`: Your Gemini API key

The GitHub Actions workflow will automatically run every day at 6:00 AM IST (00:30 UTC).

### Manual Trigger

You can manually trigger the workflow from the Actions tab:

1. Go to the "Actions" tab in your GitHub repository
2. Select "Daily Good Morning Wish" workflow
3. Click "Run workflow"

## How It Works

1. **Scheduled Execution**: GitHub Actions triggers the workflow daily at 6:00 AM IST
2. **Discord Client Initialization**: The Discord bot client is initialized and logged in
3. **AI Query**: The bot asks Gemini AI about today's significance in Sikhism
4. **Message Composition**: A good morning message is created with the religious information
5. **Direct Message**: The message is sent directly to the specified Discord user (DISCORD_MASTER_ID)
6. **Cleanup**: The Discord client is properly destroyed to ensure the process exits

## Service Architecture

### discordService.js
- **initialize()**: Initializes and logs in the Discord client
- **sendMessageToUser(userId, message)**: Sends a direct message to a specific user
- **destroyClient()**: Properly destroys the Discord client connection

### geminiService.js
- **getSikhReligiousInfo()**: Queries Gemini AI for today's Sikh religious significance

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
- **Message Delivery**: Direct message to specified user

## Troubleshooting

### Bot doesn't send messages
- Ensure you have the correct Discord user ID set in DISCORD_MASTER_ID
- Check that the bot has permission to send direct messages to you
- Verify that your Discord privacy settings allow DMs from server members
- Ensure your tokens are correctly set in GitHub Secrets

### How to find your Discord User ID
- Enable Developer Mode in Discord settings (User Settings → Advanced → Developer Mode)
- Right-click on your username/profile and select "Copy ID"

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
