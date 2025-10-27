import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./routes/userRouter.js";
import partyRouter from "./routes/party.js";
import WatchParty from "./models/WatchParty.js"; // make sure you import this

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/party", partyRouter);

app.get("/test", (req, res) => {
  res.json({ message: "ok" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join_party", async ({ joinCode, userId, name }) => {
    try {
      socket.join(joinCode);
      console.log(`${name} joined ${joinCode}`);

      await WatchParty.updateOne(
        { joinCode },
        { $addToSet: { participants: { userId, name } } }
      );

      const party = await WatchParty.findOne({ joinCode });
      const participants = party?.participants || [];

      const room = io.sockets.adapter.rooms.get(joinCode);
      const activeCount = room ? room.size : 0;

      io.to(joinCode).emit("participants_update", {
        count: activeCount,
        participants,
      });
    } catch (err) {
      console.error("Join Party Error:", err);
    }
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

  socket.on("leave_party", async ({ joinCode, userId }) => {
    try {
      socket.leave(joinCode);

      await WatchParty.updateOne(
        { joinCode },
        { $pull: { participants: { userId } } }
      );

      const party = await WatchParty.findOne({ joinCode });
      const participants = party?.participants || [];

      const room = io.sockets.adapter.rooms.get(joinCode);
      const activeCount = room ? room.size : 0;

      io.to(joinCode).emit("participants_update", {
        count: activeCount,
        participants,
      });

      console.log(`User ${userId} left ${joinCode}`);
    } catch (err) {
      console.error("Leave Party Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(" Disconnected:", socket.id);
  });
});

mongoose
  .connect("mongodb://localhost:27017/movieSync")
  .then(() => console.log(" MongoDB Connected"))
  .catch((e) => console.log(" DB Connection Error:", e));

server.listen(3000, () => console.log(" Server running on port 3000"));
