const {Document, Types} = require("mongoose")
const Link = require("../model/linkModel")
const { nanoid } = require("nanoid")
const validator = require("validator")
const catchAsync = require("../utils/catch-async")
const AppError = require("../utils/app-error")

const createLink = catchAsync(async (req, res, next) => {
    const {url, label} = req.body
    if (!validator.isURL(url)) {
        return res.status(404).json({
            status: "fail",
            message: "Invalid URL"
        })
    }
    let body = {url, label, short_url: nanoid(10), user_id: req.user_id, created_at: Date.now()}
    let newLink = new Link(body)
    const savedLink = await newLink.save()
    res.status(200).json({
        status: "success",
        data: {
            link: savedLink

        }
    })
})
const getLinkByID = catchAsync(async (req, res) => {
    const {id} = req.params
    const link = await Link.find({_id: id})

    res.status(200).json({
        status: "success",
        data: {
            link
        }
    })
})

const getLinksByUser = catchAsync(async (req, res) => {
    const links = await Link.find({user_id: req.user_id}).select("-user_id")

    res.status(200).json({
        status: "success",
        data: {
            links
        }
    })
})
module.exports = {createLink, getLinkByID, getLinksByUser}