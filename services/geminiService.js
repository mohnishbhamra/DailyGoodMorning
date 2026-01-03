const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

// Default fallback verses (first meaningful verses from Sukhmani Sahib)
const DEFAULT_VERSE_LINE1 = 'सिमरउ सिमरि सिमरि सुखु पावउ ॥ कलि कलेस तन माहि मिटावउ ॥';
const DEFAULT_VERSE_LINE2 = 'सिमरउ जासु बिसु्मभर एकै ॥ नामु जपत अगनत अनेकै ॥';

/**
 * Read Sukhmani Sahib text from file
 * @returns {Promise<string>} Full text of Sukhmani Sahib
 */
async function readSukhmaniSahib() {
  try {
    const filePath = path.join(__dirname, '..', 'assets', 'sukhmani_sahib.txt');
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading Sukhmani Sahib file:', error);
    return '';
  }
}

/**
 * Get a unique verse from Sukhmani Sahib based on day of year
 * @param {string} sukhmaniText - Full text of Sukhmani Sahib
 * @returns {Object} Selected verse lines and metadata
 */
function getVerseForToday(sukhmaniText) {
  // Split into lines and clean up
  const lines = sukhmaniText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Validate we have enough lines
  if (lines.length < 2) {
    return {
      line1: DEFAULT_VERSE_LINE1,
      line2: DEFAULT_VERSE_LINE2,
      pairNumber: 1,
      totalPairs: 1,
      dayOfYear: 1
    };
  }
  
  // Get day of year (1-365/366)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + 1;
  
  // Calculate total possible verse pairs (consecutive lines)
  const totalPairs = lines.length - 1;
  
  // Use modulus to select a unique pair for each day
  const pairIndex = (dayOfYear - 1) % totalPairs;
  
  // Get the two lines for today (bounds guaranteed by modulus operation)
  return {
    line1: lines[pairIndex],
    line2: lines[pairIndex + 1],
    pairNumber: pairIndex + 1,
    totalPairs: totalPairs,
    dayOfYear: dayOfYear
  };
}

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
            isSpecialDay: { type: "BOOLEAN" },
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
    
    // Read Sukhmani Sahib text
    const sukhmaniSahibText = await readSukhmaniSahib();
    
    // Get today's unique verse
    const todaysVerse = getVerseForToday(sukhmaniSahibText);
    
    // Validate verse content before using in prompt
    const verseLine1 = (todaysVerse.line1 || '').trim() || DEFAULT_VERSE_LINE1;
    const verseLine2 = (todaysVerse.line2 || '').trim() || DEFAULT_VERSE_LINE2;
    
    const prompt = `Today is ${dateStr}. 

STEP 1 - CHECK SPECIAL DAYS (HIGHEST PRIORITY):
Please carefully check if today is significant in Sikhism according to the Nanakshahi calendar. Check if today is:
1. Birthday (Parkash Purab) of any of the 10 Sikh Gurus
2. Martyrdom day (Shaheedi Divas) of any Sikh Guru or Sikh martyrs
3. Sangrand (first day of a month in the Nanakshahi calendar)
4. Bandi Chhor Divas (Diwali)
5. Vaisakhi (Khalsa foundation day)
6. Hola Mohalla
7. Any other important Sikh religious day or Gurpurab

STEP 2 - RESPONSE FORMAT:

**If today IS a special Sikh religious day:**
- Set isSpecialDay: true
- hindi: Provide a detailed explanation (4-5 sentences) about the significance of this day in Hindi. Include historical context, religious importance, and how it is celebrated.
- english: Provide a detailed explanation (4-5 sentences) about the significance of this day in English. Include historical context, religious importance, and how it is celebrated.
- DO NOT mention the date explicitly (no "today is" or specific dates)
- Focus on the spiritual and historical significance

**If today is NOT a special Sikh religious day:**
- Set isSpecialDay: false
- You MUST use these EXACT verse lines from Sukhmani Sahib:

  Line 1 (Gurmukhi): ${verseLine1}
  Line 2 (Gurmukhi): ${verseLine2}

- hindi:
  1. First, write these two lines in Hindi/Devanagari script (देवनागरी)
  2. Then provide the MEANING/TRANSLATION of these lines in Hindi (what do these lines mean?)
  3. Finally, explain the spiritual teaching and wisdom from these lines (4-5 sentences in Hindi)
  
- english:
  1. First, provide the English TRANSLATION of these two lines (what do these lines mean in English?)
  2. Then explain the spiritual teaching and wisdom from these lines (4-5 sentences in English)
  3. Explain how this teaching can be applied in daily life

CRITICAL INSTRUCTIONS:
- Special days take ABSOLUTE PRIORITY over Sukhmani Sahib verses
- When using Sukhmani Sahib verses, you MUST provide the MEANING/TRANSLATION of the lines, not just explanation
- Use the EXACT verse lines provided above if not a special day
- Keep tone respectful, spiritual, and uplifting
- Do not mention dates or "today" in the content`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(text);
    
    // Return without isSpecialDay flag (internal use only)
    return {
      hindi: parsedResponse.hindi,
      english: parsedResponse.english
    };
  } catch (error) {
    console.error('Error fetching Sikh religious info:', error);
    return { 
      hindi: 'आज की शिक्षा उपलब्ध नहीं है।',
      english: 'Today\'s message is not available.'
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
