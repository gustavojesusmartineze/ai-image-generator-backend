const request = require('supertest');
const express = require('express');
const apiRouter = require('../routes/api');

// Mock the controller
jest.mock('../controllers/iconController', () => ({
    generateIcons: jest.fn((req, res) => {
        res.json({ success: true, icons: [] });
    })
}));

const { generateIcons } = require('../controllers/iconController');

describe('API Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api', apiRouter);
        jest.clearAllMocks();
    });

    it('should register POST /api/generate-icons route', async () => {
        const res = await request(app)
            .post('/api/generate-icons')
            .send({ prompt: 'Test', styleId: 1 });

        expect(res.statusCode).toBe(200);
        expect(generateIcons).toHaveBeenCalled();
    });

    it('should call generateIcons controller', async () => {
        await request(app)
            .post('/api/generate-icons')
            .send({ prompt: 'Test', styleId: 1 });

        expect(generateIcons).toHaveBeenCalledTimes(1);
        const callArgs = generateIcons.mock.calls[0];
        expect(callArgs[0].body).toEqual({ prompt: 'Test', styleId: 1 });
    });

    it('should handle JSON request body', async () => {
        const requestBody = {
            prompt: 'Fruit',
            styleId: 2,
            colors: '#FF5733'
        };

        await request(app)
            .post('/api/generate-icons')
            .send(requestBody);

        const callArgs = generateIcons.mock.calls[0];
        expect(callArgs[0].body).toEqual(requestBody);
    });

    it('should return 404 for undefined routes', async () => {
        const res = await request(app)
            .get('/api/undefined-route');

        expect(res.statusCode).toBe(404);
    });

    it('should only accept POST requests on /generate-icons', async () => {
        const getRes = await request(app).get('/api/generate-icons');
        expect(getRes.statusCode).toBe(404);

        const putRes = await request(app).put('/api/generate-icons');
        expect(putRes.statusCode).toBe(404);

        const deleteRes = await request(app).delete('/api/generate-icons');
        expect(deleteRes.statusCode).toBe(404);
    });
});
