const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller'); 
const { validateToken } = require('./authentication.routes');
const { validateUserData } = require('../middleware/user.validator');

router.get('/', validateToken, userController.getAllUsers);
router.get('/profile', validateToken, userController.getOwnProfile);
router.get('/:id', validateToken, userController.getUserProfileById);
router.put('/:id', validateToken, validateUserData, userController.updateUser);

module.exports = router;