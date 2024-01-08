function catchAsync(fn) {
    return async (req, res, next) => {
        fn(req, res, next).catch(err => next(err))
    }
}

module.exports = catchAsync