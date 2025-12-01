const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

const expandPrompt = async (prompt, colors) => {
    if (process.env.MOCK_MODE === 'true') {
        console.log('Mock Mode: Expanding prompt locally');
        return [
            `${prompt} - Variation 1`,
            `${prompt} - Variation 2`,
            `${prompt} - Variation 3`,
            `${prompt} - Variation 4`,
        ];
    }

    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API Key is missing');
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = "You are a creative assistant. Your task is to take a single topic (e.g., 'Toys') and generate 4 distinct, specific icons related to that topic (e.g., 'Teddy Bear', 'Toy Car', 'Rubber Duck', 'Yo-Yo'). Return ONLY a JSON array of strings. Do not include markdown formatting or backticks.";

        let userMessage = `Topic: ${prompt} `;
        if (colors) {
            userMessage += `\nBrand Colors: ${colors}. Please describe the items in a way that incorporates these colors naturally.`;
        }

        const result = await model.generateContent(`${systemPrompt} \n\n${userMessage} `);
        const response = await result.response;
        const text = response.text();

        // Basic cleanup to ensure it's valid JSON
        const cleanContent = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Failed to expand prompt');
    }
};

module.exports = { expandPrompt };
