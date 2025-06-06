"use strict"

const body_parser = require("body-parser")
const cors = require("cors")
const express = require("express")

const app = express()
app.use(body_parser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static("public"))
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`)
})

// solution

// I think I would have designed this project considerably differently.

// The throwaway database.
let db = []

// This takes a username and creates a new user. It always creates a new user. This was my experience with the FCC example, anyway. At least it allows for a hundred users named "bob".
app.post("/api/users", (req, res) => {
   const _id = String(db.length)
   const username = String(req.body.username)
   db.push({"username": username,
      "_id": _id,
      "exercises": []
   })
   res.json({"username": username, "_id": _id})
})

// This will display a list of all users. This seems like a questionable thing to allow the end-user to do.
app.get("/api/users", (req, res) => {
   const users = []
   for (const user of db) {
      users.push({"_id": user._id, "username": user.username})
   }
   res.json(users)
})

// This logs a workout session. It's clumsy. The FCC example _id is a 24-digit hex key. What normal person is going to remember that? Especially for something as benign as an exercise tracker? The description can be anything -- sorting by exercise will not be implemented. Duration can take a decimal, but it's still casts to a Number, so "1.b" and "one" don't work. The date is strictly yyyy-mm-dd (or just nothing, apparently). I'm fine with that, except that I usually leave the delimiters out when I write stuff. I did notice that I was able to add dates that haven't happened yet. I wonder why the input types in the forms were all "text" rather than "number" and "date". And why is the name for _id ":_id"? That colon just complicates things. And why are the fields required before hitting submit? I feel like the HTML page is crap.
app.post("/api/users/:_id/exercises", (req, res) => {
   const _id = req.params._id.match(/^\d+$/) ? req.params._id : null
   if (_id == null) {throw new Error("_id is not a number")}
   const description = String(req.body.description)
   const duration = req.body.duration.match(/^\d+$/) ? Number(req.body.duration) : null
   if (duration == null) {throw new Error("duration is not a number")}
   /*
   For some reason, FCC's tests don't like my regex. Guess we'll just hope for the best.
   
   const date = req.body.date.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(req.body.date).toDateString() : new Date().toDateString()
   */
   const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
   const user = db[Number(_id)]
   user.exercises.push({"description": description,
      "duration": duration,
      "date": date
   })
   res.json({"username": user.username,
      "description": description,
      "duration": duration,
      "date": date,
      "_id": user._id
   })
})

/* This one is weird. I could not get the route to work as intended. It's supposed to look something like this, an array of routes:

["/api/users/:_id/logs",
"/api/users/:_id/logs\?:from",
"/api/users/:_id/logs\?:from&:to",
"/api/users/:_id/logs\?:from&:to&:limit"]

... but, in spite of the Express Playground Router (https://bjohansebas.github.io/playground-router/) confirming that it (well, each route) works, this thing keeps throwing an error:

TypeError: Unexpected ? at 20, expected END: https://git.new/pathToRegexpError

The landing page is irrelevant though, since I'm using \? -- escaping the ? and  not using it as a regex special character. And, again, it's working on the previously mentioned test page with Express v5 selected. Unless *that* page is incorrect...

Anyway, this will display a certain user's exercises between two points in time.

In testing the query, the object created didn't return the values/keys in order, so I couldn't depend on the index of the resulting array. And I'm not terribly satisfied with my solution. 
*/
app.get("/api/users/:_id/logs", (req, res) => {
   /*
   This worked for me, but the FCC tests failed. I really don't like hacking out an answer. This was a hack. Now, I get to break it on my end so that tests pass. This is not the correct way to learn software development -- or anything.

   const _id = req.params._id
   const keys = Object.keys(req.query)
   console.log(`keys: ${keys}`)
   if (keys.length > 3) {throw new Error("bad query, check the URL")}
   let from = ""
   let to = ""
   let limit = 0
   let dates = []
   let numbers = []
   for (const el of keys) {
      if (el.match(/^\d+$/)) {numbers.push(Number(el))}
      else if (el.match(/^\d{4}-\d{2}-\d{2}$/)) {dates.push(new Date(el))}
      else {throw new Error("bad query, date or limit is in a wrong format")}
   }

   if (dates.length) {
      if (dates.length > 2) {throw new Error("bad query, too many dates")}
      else if (dates.length == 1) {from = dates.pop()}
      else {
         // If the user entered these backwards, they're being forcefully sorted. 
         dates.sort((a, b) => a.getTime() - b.getTime())
         from = dates[0].toDateString()
         to = dates[1].toDateString()}
   }

   if (numbers.length) {
      if (numbers.length > 1) {throw new Error("bad query, only one limit allowed")}
      else if (numbers.length >= dates.length) {throw new Error("bad query, limit apparently only allowed when both from *and* to are given")}
      else {limit = numbers.pop()}
   }

   // No, I can't trust that exercises were added chronologically. I probably should have used a canned database solution, like MongoDB.
   user.exercises.sort((a, b) => (new Date(a.date).getTime()) - (new Date(b.date).getTime()))
   */

   const _id = req.params._id
   let from = req.query.from ? req.query.from : ""
   let to = req.query.to ? req.query.to : ""
   let limit = req.query.limit ? req.query.limit : 0

   const user = db[_id]
   let result = {}
   result.username = user.username
   result._id = user._id

   let log = []

   for (const exercise of user.exercises) {
      if (from) {
         if ((new Date(exercise.date).getTime()) < (new Date(from).getTime())) {continue}
      }
      if (to) {
         if ((new Date(exercise.date).getTime()) > (new Date(to).getTime())) {break}
      }
      if (limit) {
         if (log.length == limit) {break}
      }
      log.push(exercise)
   }

   result.log = log
   result.count = log.length
   res.json(result)
})

const app_port = 3000
app.listen(app_port, () => {
  console.log(`this application is listening on port ${app_port}`)
})
