const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get Sikh religious information for today
 * @returns {Promise<string>} Information about today's Sikh religious significance
 */
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

module.exports = {
  getSikhReligiousInfo
};
