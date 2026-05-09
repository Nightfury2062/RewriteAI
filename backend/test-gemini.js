require('dotenv').config();
const { generateRewriteStream } = require('./src/services/geminiService');

(async () => {
  console.log('Testing Gemini Stream...');
  try {
    const stream = generateRewriteStream('Rewrite this text to be formal: "hey dude what is up"');
    for await (const chunk of stream) {
      console.log('CHUNK:', chunk);
    }
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
  }
})();
