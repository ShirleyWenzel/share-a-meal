const logger = require('../util/logger')
const authService = require('../services/authentication.service')

const authController = {
    login: (req, res, next) => {
        const userCredentials = req.body
        logger.debug('login', userCredentials)
        authService.login(userCredentials, (err, result) => {
            if (err) return next(err)
            res.status(200).json(result)
        })
    },

    register: (req, res, next) => {
        const newUser = req.body
        authService.register(newUser, (err, result) => {
            if (err) return next(err)
            res.status(201).json({
                status: 201,
                message: 'Gebruiker geregistreerd',
                data: result
            })
        })
    }
}

module.exports = authController
