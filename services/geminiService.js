const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Get Sikh religious information for today
 * @returns {Promise<string>} Information about today's Sikh religious significance
 */
async function getSikhReligiousInfo() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            hindi: { type: "STRING" },
            english: { type: "STRING" }
          }
        }
      }
    });
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
    
    const prompt = `Today is ${dateStr}. Please check if today is significant in Sikhism also check by NanakShahi calendar. Specifically check if today is:
1. Birthday (Parkash Purab) of any of the 10 Sikh Gurus
2. Martyrdom day (Shaheedi Divas) of any Sikh Guru
3. Sangrand (first day of a month in the Nanakshahi calendar)
4. Bandi Chhor Divas
5. Any other important Sikh religious day
Must start every message with say "Sat Sri Akal" and than any msg content in new line \n
Must not mention today date or something like today
If today is significant, provide a brief description (2-3 sentences) about the significance.
If today is not a special Sikh religious day qoute a verse from sukhmani sahib and explain its teaching as people dont know exact gurmukhi(always convert gurmukhi manuscript to english or hindi), dont mention today is not a sikh special day or something like this, just in a subtle way add guru's verse/qoute from sukhmani sahib.
Keep the response concise and respectful.
Must write your content in 2 language Recommend 1.Hindi 2.English`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(text);
    return parsedResponse;
  } catch (error) {
    console.error('Error fetching Sikh religious info:', error);
    return { 
      hindi: 'सत श्री अकाल।।',
      english: 'Sat Sri Akal.'
    };
  }
}

/**
 * Get news and updates for a specific region from the last 24 hours
 * @param {string} region - The region to get news for (e.g., 'India', 'Bengaluru')
 * @returns {Promise<Object>} News updates in Hindi and English
 */
async function getRegionalNews(region) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME
    });
    
    const now = new Date();
    const dateStr = now.toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
    
    const prompt = `Current date and time: ${dateStr}. Please provide a comprehensive summary of the top news and important events that happened in ${region} in the last 24 hours (yesterday till now). Focus on:
1. Weather and environmental news
2. Major Geopolitical developments
3. Major Stock market and investment related developments
4. Major political developments
5. Economic news and business updates


Provide a detailed summary (8-10 bullet points) covering the most important and relevant news. Keep the tone informative and neutral. Write the content in English only.

Format: Start with a bold heading mentioning the region and time period, followed by bullet points.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Error fetching news for ${region}:`, error);
    return `Unable to fetch news for ${region} at this time.`;
  }
}

/**
 * Summarize news articles using AI
 * @param {string} newsText - The raw news text to summarize
 * @param {string} category - The category of news (e.g., 'Business', 'National')
 * @param {number} numArticles - Number of articles in the feed
 * @returns {Promise<string>} Summarized news
 */
async function summarizeNews(newsText, category, numArticles) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME
    });
    
    const now = new Date();
    const dateStr = now.toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
    
    const prompt = `Current date and time: ${dateStr}

I have ${numArticles} ${category} news articles from The Hindu RSS feed. Please analyze and provide a well-structured summary.

News Articles:
${newsText}

Please provide:
1. A brief overview (2-3 sentences) of the major themes and trends
2. Top 5-7 most significant news stories with:
   - Clear headline
   - Key points (2-3 bullet points per story)
   - Why it matters
3. Any important market/economic implications (for business news)

Format your response in a clear, easy-to-read structure with appropriate emojis and formatting for Discord/messaging platforms. Start with "📰 *${category} News Summary*" as the heading.

Keep the tone professional yet accessible.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Error summarizing ${category} news:`, error);
    return `Unable to summarize ${category} news at this time.`;
  }
}

module.exports = {
  getSikhReligiousInfo,
  getRegionalNews,
  summarizeNews
};
