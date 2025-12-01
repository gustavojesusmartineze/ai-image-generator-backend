// Mock GoogleGenerativeAI
const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        })
    }))
}));

const { expandPrompt } = require('../services/geminiService');

describe('Gemini Service', () => {
    beforeEach(() => {
        process.env.GEMINI_API_KEY = 'test-key';
        process.env.MOCK_MODE = 'false';
        jest.clearAllMocks();
    });

    it('should expand prompt successfully', async () => {
        const mockResponse = {
            response: {
                text: () => '["Item 1", "Item 2", "Item 3", "Item 4"]'
            }
        };
        mockGenerateContent.mockResolvedValue(mockResponse);

        const result = await expandPrompt('Test Topic');
        expect(result).toHaveLength(4);
        expect(result[0]).toBe('Item 1');
    });

    it('should use mock mode when env var is set', async () => {
        process.env.MOCK_MODE = 'true';
        const result = await expandPrompt('Test Topic');
        expect(result).toHaveLength(4);
        expect(result[0]).toContain('Test Topic');
    });
});
