const AppError = require("../utils/app-error");

const handleCastErrorDB = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400)
}
const handleDuplicateFieldsDB = (err) => {
    if (err.keyValue) {
        let error = Object.entries(err.keyValues).map(([key, value]) => [key, `${value} is already in use!`])
        return new AppError(JSON.stringify(error), 400)
    }
    return err
}
const handleValidationErrorDB = (err) => {
    if (err.errors) {
        let errors = Object.values(err.errors).map(({path, message}) => [path, message])
        return new AppError(JSON.stringify(errors), 400)
    }
    return err
}
const handleJWTError = (err) => {
    return new AppError(err.message, 401)
}
const sendErrorDev = (err, res) => {
    console.log(err)
    res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message,
        err: err
    })
}

const sendErroProd = (err, res) => {
    console.log(err)
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    else {
        res.status(500).json({
            status: 'error',
            message: err.message || "An unknown error occurred"
        })
    }
}

const errorController = (err, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res)
    }
    else {
        let error = {...err}
        if (err.name === "CastError") error = handleCastErrorDB(error)
        if (err.code === 11000) error = handleDuplicateFieldsDB(error)
        if (err.name === "ValidationError") error = handleValidationErrorDB(error)
        if (err.name in ["JsonWebTokenError", "TokenExpiredError"]) error = handleJWTError(error)
        sendErroProd(error, res)
    }
}

module.exports = errorController