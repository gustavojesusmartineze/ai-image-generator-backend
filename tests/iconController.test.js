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