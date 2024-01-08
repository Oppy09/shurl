const baseUrl = process.env.NODE_ENV == "development" ? process.env.DEV_URL : process.env.PROD_URL
module.exports = { baseUrl }