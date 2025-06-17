const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller'); 
const { validateToken } = require('./authentication.routes');

router.get('/', validateToken, userController.getAllUsers);
router.get('/profile', validateToken, userController.getOwnProfile);

module.exports = router;