const express = require('express');
const mongoose = require('mongoose')
const app = express();



app.use(express.json())

mongoose.connect("mongodb://localhost:27017/movieSync",).then(() => console.log("Databse Cnnnected ")).catch((e) => console.log("error", e))


app.listen(3000, () => {
  console.log("Server Listening on port 3000 ")
}); 
