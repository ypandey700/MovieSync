import express from  "express"
import mongoose  from "mongoose"
import userRouter from "./routes/userRouter.js"
import party from "./routes/party.js"
import http from "http"
import {Server }from "socket.io"
import dotenv from "dotenv";
import cors from "cors"


dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.json())






app.use("/api/user",userRouter)
app.use("/api/party", party)



const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ['GET', 'POST']
  }
}); 

io.on("connection", (socket) => {
  console.log("New user join :", socket.id);

  socket.on("join_party", async ({ joinCode, userId, name }) => {
    socket.join(joinCode);
    console.log(`${name} joined ${joinCode}`);

    socket.to(joinCode).emit("user_joined", { userId, name });
  });

  socket.on("chat_message", async ({ joinCode, userId, userName, message }) => {
    const msg = {
      userId,
      userName,
      message,
      timestamp: new Date().toISOString(),
    };

    await WatchParty.updateOne({ joinCode }, { $push: { chat_messages: msg } });

    io.to(joinCode).emit("chat_message", msg);
  });

  socket.on("video_action", ({ joinCode, action, currentTime }) => {
    socket.to(joinCode).emit("video_action", { action, currentTime });
  });

  socket.on("leave_party", ({ joinCode, userId }) => {
    socket.leave(joinCode);
    socket.to(joinCode).emit("user_left", { userId });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});


mongoose.connect("mongodb://localhost:27017/movieSync",).then(() => console.log("Database Connected ")).catch((e) => console.log("error", e))

server.listen(3000, () => {
  console.log("Server Listening on port 3000 ")
}); 
