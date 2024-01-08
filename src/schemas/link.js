const {Schema} = require("mongoose")
const {baseUrl} = require("../utils/constants")

const linkSchema = new Schema({
    url: {
        type: String,
        required: [true, "Please provide a url"]
    },
    short_url: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    label: {
        type: String,
        required: [true, "Please provide a label"]
    },
    user_id: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})
linkSchema.virtual('short_url_complete').get(function() {
    return `${baseUrl}/${this.short_url}`
})

module.exports = linkSchema