import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import Report from "../models/Report";
import Match from "../models/Match";
import Message from "../models/Message";
import User from "../models/User";
import ProblemPost from "../models/ProblemPost";
import Swipe from "../models/Swipe";

const router = Router();

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

router.use(authMiddleware, requireAdmin);

// List all submitted reports for review
router.get("/reports", async (_req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("reporter", "pseudonym")
      .populate("targetProblem", "title owner")
      .populate({
        path: "targetMessage",
        populate: { path: "sender", select: "pseudonym" }
      });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Unable to load reports" });
  }
});

// Update report status/resolution note
router.patch("/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body as {
      status?: "open" | "resolved";
      resolutionNote?: string;
    };
    if (status && status !== "open" && status !== "resolved") {
      return res.status(400).json({ message: "Invalid status" });
    }
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (status) report.status = status;
    if (resolutionNote !== undefined) report.resolutionNote = resolutionNote;
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Unable to update report" });
  }
});

// List all matches for moderation
router.get("/matches", async (_req, res) => {
  try {
    const matches = await Match.find()
      .populate("problem", "title")
      .populate("owner", "pseudonym")
      .populate("helper", "pseudonym")
      .sort({ createdAt: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: "Unable to load matches" });
  }
});

// Force-close/unmatch a conversation
router.patch("/matches/:id/close", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    match.isActive = false;
    await match.save();
    await Message.deleteMany({ match: match._id });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: "Unable to close match" });
  }
});

// List users with basic info
router.get("/users", async (_req, res) => {
  try {
    const users = await User.find({}, "pseudonym email isAdmin createdAt").sort({
      createdAt: -1
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Unable to load users" });
  }
});

// Delete a user and related records
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const problems = await ProblemPost.find({ owner: id });
    const problemIds = problems.map((p) => p._id);
    const matches = await Match.find({ $or: [{ owner: id }, { helper: id }] });
    const matchIds = matches.map((m) => m._id);

    const messages = await Message.find({ match: { $in: matchIds } });
    const messageIds = messages.map((m) => m._id);

    await Promise.all([
      Message.deleteMany({ _id: { $in: messageIds } }),
      Match.deleteMany({ _id: { $in: matchIds } }),
      Swipe.deleteMany({ swiper: id }),
      ProblemPost.deleteMany({ _id: { $in: problemIds } }),
      Report.deleteMany({
        $or: [
          { reporter: id },
          { targetProblem: { $in: problemIds } },
          { targetMessage: { $in: messageIds } }
        ]
      })
    ]);

    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Unable to delete user" });
  }
});

export default router;
