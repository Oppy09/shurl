const express = require("express")
// const userController = require("../controllers/userController")
const { protect } = require("../controllers/authController")
const meRouter = require("./meRouter")

const userRouter = express.Router()


userRouter.use("/me", protect, meRouter)

module.exports = userRouter