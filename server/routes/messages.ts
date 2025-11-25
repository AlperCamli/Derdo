import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import Message from "../models/Message";
import Match from "../models/Match";

const router = Router();

router.get("/:matchId/messages", authMiddleware, async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findById(matchId);
  if (!match) return res.status(404).json({ message: "Match not found" });
  const userId = req.user!._id.toString();
  if (
    match.owner.toString() !== userId &&
    match.helper.toString() !== userId
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const messages = await Message.find({ match: matchId })
    .sort({ createdAt: 1 })
    .populate("sender", "pseudonym");
  res.json(messages);
});

router.post("/:matchId/messages", authMiddleware, async (req, res) => {
  const { matchId } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "Content required" });
  const match = await Match.findById(matchId);
  if (!match) return res.status(404).json({ message: "Match not found" });
  const userId = req.user!._id.toString();
  if (
    match.owner.toString() !== userId &&
    match.helper.toString() !== userId
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const message = await Message.create({
    match: matchId,
    sender: req.user!._id,
    content
  });
  res.status(201).json(message);
});

export default router;
