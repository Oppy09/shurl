const mongoose = require("mongoose")
const dotenv = require("dotenv")
const path = require("path")
dotenv.config({path: path.join(__dirname, '/../config.env')})

const app = require("./app")

const CS = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(CS).then(c => {
    console.log('DB connection successful')
})


const port = 8000
app.listen(port, () => {
    console.log(`App running on port ${port}`)
})