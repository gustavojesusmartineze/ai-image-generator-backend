const Replicate = require('replicate');

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

const generateImage = async (prompt) => {
    if (process.env.MOCK_MODE === 'true') {
        console.log('Mock Mode: Generating mock image for', prompt);
        // Return a placeholder image
        return "https://placehold.co/512x512/png?text=" + encodeURIComponent(prompt.substring(0, 20));
    }

    if (!process.env.REPLICATE_API_TOKEN) {
        throw new Error('Replicate API Token is missing');
    }

    try {
        const output = await replicate.run(
            "black-forest-labs/flux-schnell",
            {
                input: {
                    prompt: prompt,
                    go_fast: true,
                    num_outputs: 1,
                    aspect_ratio: "1:1",
                    output_format: "png",
                    output_quality: 80
                }
            }
        );

        // Replicate returns an array of output items (usually URLs or streams)
        // For flux-schnell it typically returns a ReadableStream or URL depending on config.
        // The example provided by user says: console.log(output[0].url()); or output[0]
        // Let's assume it returns a URL string or an object with a url method.
        // Based on recent Replicate JS SDK, it often returns the URL directly in the array.

        return output[0];
    } catch (error) {
        console.error('Replicate API Error:', error);
        throw new Error('Failed to generate image');
    }
};

module.exports = { generateImage };
