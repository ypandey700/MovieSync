import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./routes/userRouter.js";
import partyRouter from "./routes/party.js";
import recommendationRouter from "./routes/recommendationRouter.js";
import contentSeeder from "./routes/contentSeeder.js";
import testRecommendations from "./routes/testRecommendations.js";
import aiSuggestionsRouter from "./routes/aiSuggestionsRouter.js";
import WatchParty from "./models/WatchParty.js";
import { generateOtp } from "./lib/otp-generator.js";

dotenv.config();

const app = express();

// CORS configuration - allow frontend origin with credentials
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/party", partyRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/content", contentSeeder);
app.use("/api/test", testRecommendations);
app.use("/api/ai", aiSuggestionsRouter);


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
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movieSync")
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.error("DB error:", e));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));