const {Error: MError} = require("mongoose")

class AppError extends Error{
    isOperational = true
    constructor(message, statusCode = 500) {
        super(message);
        function checkStatus(code) {
            if (`${code}`.startsWith('5')) return "error"
            else return "fail"
        }
        this.statusCode = statusCode
        this.status = checkStatus(statusCode)

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError