"use strict"

const body_parser = require("body-parser")
const cors = require("cors")
const express = require("express")
const fs = require("node:fs")


const app = express()
app.use(body_parser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static("./public"))
app.get("/", (req, res) => {
  res.sendFile(__dirname + "./views/index.html")
})




const app_port = 3000
app.listen(app_port, () => {
  console.log(`Your app is listening on port ${app_port}`)
})
