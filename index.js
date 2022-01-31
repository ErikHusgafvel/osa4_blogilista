require('dotenv').config()
//const http = require('http')
const express = require('express')
const app = express()
const config = require('./utils/config')
const cors = require('cors')
const notesRouter = require('./controllers/blogs')
const mongoose = require('mongoose')

mongoose.connect(config.MONGODB_URI)

app.use(cors())
app.use(express.json())
app.use('/api/blogs', notesRouter)

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})