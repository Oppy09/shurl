const { model } = require("mongoose")
const linkSchema = require("../schemas/link")
const {baseUrl} = require("../utils/constants")


const Link = model('Link', linkSchema)
module.exports = Link