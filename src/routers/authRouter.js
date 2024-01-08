const express = require('express')
const authController = require('../controllers/authController')

const authRouter = express.Router()

authRouter.route('/signup').post(authController.signup)
authRouter.route('/login').post(authController.login)
authRouter.route('/reset-password').patch(authController.resetPassword)
authRouter.route('/forgot-password').post(authController.forgotPassword)

module.exports = authRouter