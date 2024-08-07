/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

class Gemini {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            // systemInstruction: `I will give you a word in ${baseLanguage}, translate it in English, German, Chinese, French, Vietnamese ${targetLanguages.join(', ')}. The output must be a JSON object following this rule: Language name (in lowercase): translated word`,
        });

        this.generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };
    }

    async translateWord(baseWord, baseLanguage, targetLanguages) {
        // console.log(baseWord, baseLanguage, targetLanguages);
        const prompt = `Translate "${baseWord}" from ${baseLanguage} to ${targetLanguages.join(', ')}. The output must be a stringified JSON object following this rule: Language name (in lowercase): translated word. Do not include any markdown or code block syntax in the response.`;

        const result = await this.model.generateContent(prompt)
        const response = await result.response
        return response.text();
    }
}

module.exports = Gemini;

// Example usage
// (Uncomment the below lines to test the class after replacing 'YOUR_API_KEY' with your actual API key)
// const gemini = new Gemini('YOUR_API_KEY');
// gemini.translateWord('Hello').then(result => console.log(result)).catch(error => console.error(error));
