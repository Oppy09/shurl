const User = require("../model/userModel")
const AppError = require("../utils/app-error")
const catchAsync = require("../utils/catch-async")

const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const validator = require("validator")
const crypto = require("crypto")


const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date (
            Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN_DAYS) * 24 * 3600 * 1000
        ),
        httpOnly: true
    }
    if (process.env.NODE_ENV == "production") cookieOptions.secure = true

    res.cookie("jwt", token, cookieOptions)

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                email: user.email,
            }
        }
    })
}

const signup = catchAsync(async (req, res) => {
    const {first_name, last_name, username, email, password, confirm_password} = req.body
    const body = {first_name, last_name, username, email, password, confirm_password}

    const newUser = await User.create(body)

    createSendToken(newUser, 200, res)
})

const login = catchAsync(async (req, res) => {
    const {email, password} = req.body

    if (!(email && password)) {
        throw new AppError("Please provide email and password!", 400)
    }
    const user = await User.findOne({email}).select("+password")

    if (!user || !(await user.isCorrectPassword(password, user.password))) {
        throw new AppError("email or password incorrect!", 401)
    }

    createSendToken(user, 200, res)
})

const protect = catchAsync(async (req, res, next) => {
    const {authorization: auth} = req.headers
    if (!auth || auth.split(" ").length != 2 || !(auth.split(" ")[0] === "Bearer")) {
        throw new AppError("unauthorized", 401)
    }
    const token = auth.split(" ")[1]
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
        throw new AppError("The user belonging to this token no longer exists!", 401)
    }
    if (user.isPasswordChangedAfter(decoded.iat)) {
        throw new AppError("User recently changed password! Please log in again", 401)
    }

    req.user_id = decoded.id

    next()
})

const resetPassword = catchAsync(async (req, res, next) => {
    const { password, confirm_password } = req.body
    const token = req.query.token | "";
    const hashedToken = crypto.createHash("sha256").update(token).digest

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetTokenEAt: {$gt: Date.now()}})
    if (!user) {
        throw new AppError("tooken invalid, expired or used", 401)
    }

    user.password = password
    user.confirm_password = confirm_password
    user.passwordResetToken = undefined
    user.passwordResetTokenEAt = undefined

    await user.save({validateModifiedOnly: true})

    res.status(200).json({
        status: "success",
        message: "Password successfully updated!"
    })
})

const forgotPassword = catchAsync(async (req, res) => {
    const {email} = req.body

    if (!email || !validator.isEmail(email)) {
        throw new AppError("Please provide a valid email address", 400)
    }
    const user = await User.findOne({email})
    if (!user) {
        throw new AppError("No account with this email found", 404)
    }

    const token = user.generateResetToken()

    user.save({validateModifiedOnly: true})

    try {
        let resp = await sendEmail({
            email,
            subject: "Shurl - Password Reset",
            message: token.token,
        })
    }
    catch(err) {
        next(err)
    }

    res.status(200).json({
        status: 200,
        message: "password reset link sent to email!"
    })
})

module.exports = { signup, login, protect, resetPassword, forgotPassword}