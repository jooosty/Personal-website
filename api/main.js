const express = require('express')
const cors = require('cors')
const app = express()
const port = 5000

app.use(cors())

data = {
    name: 'Joost Krebbers',
    hobbies: ['Racing', 'Coding', 'Gaming'],
    age: 21,
    occupation: ['Student', 'Software Developer'],
    learning_goals: ['Learn how to effectively use CSS', 'Learn how to animate using CSS', 'Be more creative in designing'],
    location: 'Purmerend, The Netherlands',
    course: ['MBO Software Development', 'HBO Game Development', "HBO-ICT studio App development"],
    languages: ['C#', 'JavaScript', 'Python', 'HTML', 'PHP']
}

// Define API endpoints

// Endpoint to get all data at once
app.get('/api/data', (req, res) => {
    res.json(data);
})


// Endpoint to get name
app.get('/api/name', (req, res) => {
    res.json({ name: data.name });
})

// Endpoint to get hobbies
app.get('/api/hobbies', (req, res) => {
    res.json({ hobbies: data.hobbies });
})

// Endpoint to get age
app.get('/api/age', (req, res) => {
    res.json({ age: data.age });
})

// Endpoint to get occupation
app.get('/api/occupation', (req, res) => {
    res.json({ occupation: data.occupation });
})

// Endpoint to get learning goals
app.get('/api/learning_goals', (req, res) => {
    res.json({ learning_goals: data.learning_goals });
})


// Endpoint to get location
app.get('/api/location', (req, res) => {
    res.json({ location: data.location });
})

// Endpoint to get course
app.get('/api/course', (req, res) => {
    res.json({ course: data.course });
})

// Endpoint to get languages
app.get('/api/languages', (req, res) => {
    res.json({ languages: data.languages });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})