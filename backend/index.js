import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./routes/userRouter.js";
import partyRouter from "./routes/party.js";
import WatchParty from "./models/WatchParty.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/party", partyRouter);


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});


const broadcastParticipants = async (joinCode) => {
  try {
    const party = await WatchParty.findOne({ joinCode });
    const participants = party?.participants || [];

    const room = io.sockets.adapter.rooms.get(joinCode);
    const activeCount = room ? room.size : 0;

    io.to(joinCode).emit("participants_update", activeCount);
    io.to(joinCode).emit("participantUpdate", participants);
  } catch (e) {
    console.error("broadcastParticipants error:", e);
  }
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinParty", async ({ joinCode, user }) => {
    try {
      socket.join(joinCode);
      console.log(`${user.name} joined ${joinCode}`);

      await WatchParty.updateOne(
        { joinCode },
        { $addToSet: { participants: { userId: user._id, name: user.name, avatarUrl: user.avatarUrl } } },
        { upsert: true }
      );

      const party = await WatchParty.findOne({ joinCode });
      socket.emit("partyJoined", {
        participants: party?.participants || [],
        chat_messages: party?.chat_messages || [],
      });

      await broadcastParticipants(joinCode);
    } catch (err) {
      console.error("joinParty error:", err);
    }
  });

  socket.on("chatMessage", async ({ joinCode, msg }) => {
    try {
      await WatchParty.updateOne(
        { joinCode },
        { $push: { chat_messages: msg } }
      );
      io.to(joinCode).emit("chatMessage", msg);
    } catch (err) {
      console.error("chatMessage error:", err);
    }
  });

  socket.on("videoControl", ({ joinCode, action, time }) => {
    socket.to(joinCode).emit("videoControl", { action, time });
  });

  const leaveHandler = async ({ joinCode, userId }) => {
    try {
      socket.leave(joinCode);
      await WatchParty.updateOne(
        { joinCode },
        { $pull: { participants: { userId } } }
      );
      await broadcastParticipants(joinCode);
      console.log(`User ${userId} left ${joinCode}`);
    } catch (err) {
      console.error("leaveParty error:", err);
    }
  };

  socket.on("leaveParty", leaveHandler);
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/movieSync")
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.error("DB error:", e));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));