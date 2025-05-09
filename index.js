"use strict"

const body_parser = require("body-parser")
const cors = require("cors")
const express = require("express")
const fs = require("node:fs")

const app = express()
app.use(body_parser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static("public"))
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`)
})

// solution

// There is apparently no error-checking required here. Even the FCC example page has none (try entering a bad _id) -- it just crashes with the Error object. So, I'm not going to concern myself with it. No security either. If I wanted to say that bob spent fifteen minutes "spanking monkeys", I could do that without hindrance. Maybe this is supposed to be strictly local (and offline).

// The throwaway database. I'm just going to assume that the db stays ordered, since the index is tied to the _id.
const db = [{"username":"bob","_id":0,"exercises":[]},
   {"username":"sally","_id":1,"exercises":[{"description":"jumping jacks","duration":"10","date":"Fri May 09 2025"}]},
   {"username":"fred","_id":2,"exercises":[]}
]

// This takes a username and creates a new user. It always creates a new user. This was my experience with the FCC example, anyway. At least it allows for a hundred users named "bob".
app.post("/api/users", (req, res) => {
   const new_index = db.length
   db.push({"username": req.body.username,
      "_id": new_index,
      "exercises": []
   })
   const {username, _id} = db[new_index]
   res.json({"username": username, "_id": _id})
})

// This logs a workout session. It's clumsy. The FCC example _id is a 24-digit hex key. What normal person is going to remember that? Especially for something as benign as an exercise tracker? The desctiption can be anything -- sorting by exercise will not be implemented. Duration can take a decimal, but it's still casts to a Number, so "1.b" and "one" don't work. The date is strictly yyyy-mm-dd. I'm fine with that, except that I usually leave the delimiters out when I write stuff. I did notice that I was able to add dates that haven't happened yet. I wonder why the input types in the forms were all "text" rather than "number" and "date". And why is the name for _id ":_id"? That colon just complicates things.
app.post("/api/users/:_id/exercises", (req, res) => {
   const {description, duration, date} = req.body
   const _id = req.body[":_id"]
   const username = db[_id].username
   const long_date = new Date(date).toDateString()
   db[_id]["exercises"].push({"description": description,
      "duration": duration,
      "date": long_date
   })
   res.json({"username": username,
      "description": description,
      "duration": duration,
      "date": long_date,
      "_id": _id
   })
})

// This will display a certain user's workouts between two points in time.
app.get(["/api/users/:_id/logs"], (req, res) => {

})

const app_port = 3000
app.listen(app_port, () => {
  console.log(`Your app is listening on port ${app_port}`)
})
