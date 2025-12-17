const geminiService = require('./geminiService');

/**
 * Service to handle greeting messages
 */
class GreetService {
  /**
   * Generate greeting messages with religious information
   * @returns {Promise<Object>} Object containing hindi and english messages
   */
  async generateGreetingMessages() {
    console.log('Fetching Sikh religious information...');
    const religiousInfo = await geminiService.getSikhReligiousInfo();

    const hindiMessage = 'सत श्री अकाल।।\n' + religiousInfo.hindi + '\n\n' + 'आपका दिन शुभ हो!';
    const englishMessage = 'Sat Sri Akal.\n' + religiousInfo.english + '\n\n' + 'Have a great day!';

    return {
      hindi: hindiMessage,
      english: englishMessage
    };
  }
}

module.exports = new GreetService();
