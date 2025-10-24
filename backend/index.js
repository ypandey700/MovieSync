import express from  "express"
import mongoose  from "mongoose"
import userRouter from "./routes/userRouter.js"
import dotenv from "dotenv";


dotenv.config(); 

const app = express();



app.use(express.json())

mongoose.connect("mongodb://localhost:27017/movieSync",).then(() => console.log("Databse Cnnnected ")).catch((e) => console.log("error", e))

app.use("/user",userRouter)

app.listen(3000, () => {
  console.log("Server Listening on port 3000 ")
}); 
