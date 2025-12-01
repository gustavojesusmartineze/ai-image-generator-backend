const request = require('supertest');
const express = require('express');
const { generateIcons } = require('../controllers/iconController');

// Mock dependencies
jest.mock('../services/geminiService', () => ({
    expandPrompt: jest.fn().mockResolvedValue(['Item 1', 'Item 2', 'Item 3', 'Item 4'])
}));

jest.mock('../services/replicateService', () => ({
    generateImage: jest.fn().mockResolvedValue('http://mock-url.com/image.png')
}));

const app = express();
app.use(express.json());
app.post('/api/generate-icons', generateIcons);

describe('Icon Controller', () => {
    beforeEach(() => {
        // application loggin errors
        // uncomment if you want to see the logs
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Test all valid styles
    [1, 2, 3, 4, 5].forEach(styleId => {
        it(`should generate icons successfully for style ${styleId}`, async () => {
            const res = await request(app)
                .post('/api/generate-icons')
                .send({
                    prompt: `Test Prompt Style ${styleId}`,
                    styleId: styleId
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.icons).toHaveLength(4);
            expect(res.body.styleId).toBe(styleId);
        });
    });

    it('should return 400 if prompt is missing', async () => {
        const res = await request(app)
            .post('/api/generate-icons')
            .send({
                styleId: 1
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should return 400 if styleId is invalid', async () => {
        const res = await request(app)
            .post('/api/generate-icons')
            .send({
                prompt: 'Test Prompt',
                styleId: 999
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    // Error Handling Tests
    it('should handle upstream API errors (Gemini)', async () => {
        // Temporarily mock failure
        const { expandPrompt } = require('../services/geminiService');
        expandPrompt.mockRejectedValueOnce(new Error('Gemini API Error'));

        const res = await request(app)
            .post('/api/generate-icons')
            .send({
                prompt: 'Gemini Error Prompt',
                styleId: 1
            });

        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toContain('Gemini API Error');
    });

    it('should handle upstream API errors (Replicate)', async () => {
        const { generateImage } = require('../services/replicateService');
        generateImage.mockRejectedValueOnce(new Error('Replicate API Error'));

        const res = await request(app)
            .post('/api/generate-icons')
            .send({
                prompt: 'Replicate Error Prompt',
                styleId: 1
            });

        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toContain('Replicate API Error');
    });

    it('should handle rate limit errors', async () => {
        const { expandPrompt } = require('../services/geminiService');
        expandPrompt.mockRejectedValueOnce(new Error('429 Too Many Requests'));

        const res = await request(app)
            .post('/api/generate-icons')
            .send({
                prompt: 'Rate Limit Prompt',
                styleId: 1
            });

        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toContain('429');
    });
});
