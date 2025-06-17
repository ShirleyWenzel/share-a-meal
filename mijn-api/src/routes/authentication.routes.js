//
// Authentication routes
//
const assert = require('assert')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../util/config').secretkey
const routes = require('express').Router()
const AuthController = require('../controllers/authentication.controller.js')
const logger = require('../util/logger')
const { validateUserData } = require('../middleware/user.validator');

//
//
//


function validateLogin(req, res, next) {
  const { emailAdress, password } = req.body;

  if (typeof emailAdress !== 'string') {
    return next({
      status: 400,
      message: 'emailAdress moet een string zijn',
      data: {}
    });
  }

  if (typeof password !== 'string') {
    return next({
      status: 400,
      message: 'password moet een string zijn',
      data: {}
    });
  }

  next(); // ✅ validatie geslaagd
}

//
//
//
function validateToken(req, res, next) {
    logger.info('validateToken called')
    logger.trace('Headers:', req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization
    if (!authHeader) {
        logger.warn('Authorization header missing!')
        next({
            status: 401,
            message: 'Authorization header missing!',
            data: {}
        })
    } else {
        // Strip the word 'Bearer ' from the headervalue
        const token = authHeader.substring(7, authHeader.length)

        jwt.verify(token, jwtSecretKey, (err, payload) => {
            if (err) {
                logger.warn('Not authorized')
                next({
                    status: 401,
                    message: 'Not authorized!',
                    data: {}
                })
            }
            if (payload) {
                logger.debug('token is valid', payload)
                /**
                 * User heeft toegang.
                 * BELANGRIJK! Voeg UserId uit payload toe aan request,
                 * zodat die voor ieder volgend endpoint beschikbaar is.
                 * Je hebt dan altijd toegang tot de userId van de ingelogde gebruiker.
                 */
                req.userId = payload.userId
                next()
            }
        })
    }
}

function validateRegistration(req, res, next) {
  try {
    assert(typeof req.body.emailAdress === 'string', 'Email is verplicht');
    assert(typeof req.body.password === 'string', 'Wachtwoord is verplicht');
    assert(typeof req.body.firstName === 'string', 'Voornaam is verplicht');
    assert(typeof req.body.lastName === 'string', 'Achternaam is verplicht');
    next();
  } catch (err) {
    next({ status: 400, message: err.message });
  }
}


routes.post('/login', validateLogin, AuthController.login)
routes.post('/register', validateRegistration, validateUserData, AuthController.register);

module.exports = { routes, validateToken }
