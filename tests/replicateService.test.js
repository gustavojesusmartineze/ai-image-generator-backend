// Mock Replicate
const mockRun = jest.fn();
jest.mock('replicate', () => {
    return jest.fn().mockImplementation(() => ({
        run: mockRun
    }));
});

const { generateImage } = require('../services/replicateService');

describe('Replicate Service', () => {
    beforeEach(() => {
        process.env.REPLICATE_API_TOKEN = 'test-token';
        process.env.MOCK_MODE = 'false';
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should generate image successfully', async () => {
        const mockImageUrl = 'http://example.com/generated-image.png';
        mockRun.mockResolvedValue([mockImageUrl]);

        const result = await generateImage('A cute cat icon');

        expect(result).toBe(mockImageUrl);
        expect(mockRun).toHaveBeenCalledWith(
            'black-forest-labs/flux-schnell',
            expect.objectContaining({
                input: expect.objectContaining({
                    prompt: 'A cute cat icon',
                    go_fast: true,
                    num_outputs: 1,
                    aspect_ratio: '1:1',
                    output_format: 'png',
                    output_quality: 80
                })
            })
        );
    });

    it('should use mock mode when env var is set', async () => {
        process.env.MOCK_MODE = 'true';

        const result = await generateImage('Test Prompt');

        expect(result).toContain('placehold.co');
        expect(result).toContain('Test%20Prompt');
        expect(mockRun).not.toHaveBeenCalled();
    });

    it('should throw error when API token is missing', async () => {
        delete process.env.REPLICATE_API_TOKEN;

        await expect(generateImage('Test Prompt')).rejects.toThrow('Replicate API Token is missing');
    });

    it('should handle Replicate API errors', async () => {
        mockRun.mockRejectedValue(new Error('Replicate API Error'));

        await expect(generateImage('Test Prompt')).rejects.toThrow('Failed to generate image');
    });

    it('should handle network errors gracefully', async () => {
        mockRun.mockRejectedValue(new Error('Network timeout'));

        await expect(generateImage('Test Prompt')).rejects.toThrow('Failed to generate image');
    });
});
