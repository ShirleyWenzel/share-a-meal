const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meals.controller');
const { validateToken } = require('./authentication.routes');
const { validateCreateMeal } = require('../middleware/meal.validator');

router.post('/', validateToken, validateCreateMeal, mealController.createMeal);

module.exports = router;
