const express = require("express")
const {getLinksByUser} = require("../controllers/linkController")

const meRouter = express.Router()


meRouter.route("/links").get(getLinksByUser)

module.exports = meRouter