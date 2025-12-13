const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get Sikh religious information for today
 * @returns {Promise<string>} Information about today's Sikh religious significance
 */
async function getSikhReligiousInfo() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
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
      day: 'numeric' 
    });
    
    const prompt = `Today is ${dateStr}. Please check if today is significant in Sikhism. Specifically check if today is:
1. Birthday (Parkash Purab) of any of the 10 Sikh Gurus
2. Martyrdom day (Shaheedi Divas) of any Sikh Guru
3. Sangrand (first day of a month in the Nanakshahi calendar)
4. Bandi Chhor Divas
5. Any other important Sikh religious day

If today is significant, provide a brief description (2-3 sentences) about the significance. Start every message with say "Sat Sri Akal". If today is not a special Sikh religious day qoute a verse from sukhmani sahib and explain its teaching as people dont know exact gurmukhi(always convert gurmukhi manuscript to english or hindi), dont mention today is not a sikh special day or something like this, just in a subtle way add guru's verse/qoute from sukhmani sahib. Keep the response concise and respectful and write your content in 2 language Recommend 1.Hindi 2.English`;

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

module.exports = {
  getSikhReligiousInfo
};
