import express from "express";
import WatchParty from "../models/WatchParty.js";
import User from "../models/User.js";

const router = express.Router();

function generateJoinCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post("/create", async (req, res) => {
  try {
    const { userId, contentId, content } = req.body;

    if (!userId || !contentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    let joinCode;
    let isUnique = false;
    while (!isUnique) {
      joinCode = generateJoinCode();
      const exists = await WatchParty.findOne({ joinCode });
      if (!exists) isUnique = true;
    }

    const watchParty = await WatchParty.create({
      hostId: userId,
      participants: [],
      joinCode,
      chat_messages: [],
      currentTime: 0,
      status: "paused",
      contentId,
      content,
    });

    res.status(201).json({
      message: "Watch party created successfully",
      watchParty,
    });
  } catch (err) {
    console.error("Error creating watch party:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/join/:joincode", async (req, res) => {
  try {
    const { joincode } = req.params;
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const watchParty = await WatchParty.findOne({ joinCode: joincode });
    if (!watchParty) {
      return res.status(404).json({ message: "Watch party not found" });
    }

    const alreadyJoined = watchParty.participants.some(
      (p) => p.userId === userId
    );

    if (!alreadyJoined) {
      watchParty.participants.push({
        userId,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
      await watchParty.save();
    }

    res.status(200).json({
      message: "Joined party successfully",
      watchParty,
    });
  } catch (err) {
    console.error("Error joining party:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
