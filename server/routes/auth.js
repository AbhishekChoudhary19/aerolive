const express = require('express');
const router = express.Router();
const { register, login, getMe, saveFlight } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/save-flight', protect, saveFlight);

module.exports = router;
