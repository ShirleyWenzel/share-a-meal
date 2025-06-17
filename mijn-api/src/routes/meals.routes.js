const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meals.controller');
const { validateToken } = require('./authentication.routes');
const { validateCreateMeal, validateMealUpdate } = require('../middleware/meal.validator');


router.post('/', validateToken, validateCreateMeal, mealController.createMeal);
router.put('/:id', validateToken, validateMealUpdate, mealController.updateMeal);

module.exports = router;
