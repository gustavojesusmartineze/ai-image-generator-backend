const { generateImage } = require('../services/replicateService');
const NodeCache = require('node-cache');

// Cache for 1 hour
const promptCache = new NodeCache({ stdTTL: 3600 });

const STYLES = {
    1: "A cute, flat vector icon of {ITEM}. Thick dark purple outlines with a pastel color palette featuring . Minimalist design, clean lines, isolated on a plain white background, high quality vector art icon.",
    2: "A round sticker-style vector icon illustration of {ITEM}. The {ITEM} is centered inside a pale circle. Scattered  stars and small dots in the background behind the {ITEM}. Clean vector outlines, flat colors, playful and whimsical aesthetic, white background icon.",
    3: "A playful, hand-drawn vector icon illustration of {ITEM} launching through fluffy white clouds. The background is an abstract organic teal shape. Accented with small stars. Doodle aesthetic, bold outlines, vibrant colors, isolated on white icon.",
    4: "A 3D rendered icon of {ITEM}. Smooth, glossy plastic texture with soft gradients. Vibrant colors body with a bright flame. No outlines. Isometric view, soft studio lighting, modern 3D emoji style, high fidelity, isolated on white icon.",
    5: "A minimalist flat circle icon. A white silhouette of {ITEM} utilizing negative space, set against a solid color circular background. Clean, simple UI glyph style, single color background, vector graphics icon."
};

const generateIcons = async (req, res) => {
    try {
        const { prompt, styleId, colors } = req.body;

        if (!prompt || !styleId) {
            return res.status(400).json({ error: 'Prompt and Style ID are required' });
        }

        const styleTemplate = STYLES[styleId];
        if (!styleTemplate) {
            return res.status(400).json({ error: 'Invalid Style ID' });
        }

        // 1. Expand Prompt (with Cache)
        const cacheKey = `expand_${prompt}_${colors || 'no_color'}`;
        let items = promptCache.get(cacheKey);

        if (!items) {
            console.log(`Cache miss for prompt: ${prompt} with colors: ${colors}`);
        } else {
            console.log(`Cache hit for prompt: ${prompt}`);
        }

    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

module.exports = { generateIcons };
