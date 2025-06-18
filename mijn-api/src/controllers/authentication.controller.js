const logger = require('../util/logger');
const authService = require('../services/authentication.service');

const authController = {
  login: (req, res, next) => {
    const userCredentials = req.body;
    logger.debug('login', userCredentials);

    authService.login(userCredentials, (err, result) => {
      if (err) return next(err);
      res.status(result.status).json(result);
    });
  },

register: (req, res, next) => {
  const user = req.body;

  // Validatie
  if (!user.emailAdress || !user.firstName || !user.lastName || !user.password) {
    return res.status(400).json({
      status: 400,
      message: 'Verplicht veld ontbreekt'
    });
  }

  if (typeof user.password !== 'string') {
    return res.status(400).json({
      status: 400,
      message: 'Wachtwoord moet een string zijn'
    });
  }

  authService.register(user, (err, result) => {
    if (err) return next(err);

    res.status(201).json({
      status: 201,
      message: 'Gebruiker succesvol geregistreerd',
       data: {
        id: result.id,           
        emailAdress: result.emailAdress,
        firstName: result.firstName,
        lastName: result.lastName
      }
    });
  });
}
};

module.exports = authController;
