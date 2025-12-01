const express = require('express');
const router = express.Router();
const { generateIcons } = require('../controllers/iconController');

router.post('/generate-icons', generateIcons);

module.exports = router;
