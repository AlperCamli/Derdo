import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import Match from "../models/Match";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!._id;
    const matches = await Match.find({
      isActive: true,
      $or: [{ owner: userId }, { helper: userId }]
    })
      .populate("problem", "title category")
      .populate("owner", "pseudonym")
      .populate("helper", "pseudonym")
      .sort({ updatedAt: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch matches" });
  }
});

router.patch("/:id/close", authMiddleware, async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) return res.status(404).json({ message: "Not found" });
  const userId = req.user!._id.toString();
  if (
    match.owner.toString() !== userId &&
    match.helper.toString() !== userId
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  match.isActive = false;
  await match.save();
  res.json(match);
});

export default router;
