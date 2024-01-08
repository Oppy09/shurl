const express = require("express")
const linkController = require("../controllers/linkController")
const linkRouter = express.Router()

linkRouter.route("/").post(linkController.createLink)
linkRouter.route("/:id").get(linkController.getLinkByID)

module.exports = linkRouter