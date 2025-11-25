import { Router } from "express";
import ProblemPost from "../models/ProblemPost";
import Swipe from "../models/Swipe";
import Match from "../models/Match";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const allowedCategories = ["financial", "relationship", "career", "daily", "other"];
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Missing fields" });
    }
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }
    if (title.length > 80 || description.length > 500) {
      return res
        .status(400)
        .json({ message: "Title or description exceeds allowed length" });
    }
    const post = await ProblemPost.create({
      owner: req.user!._id,
      title,
      description,
      category
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Unable to create problem" });
  }
});

router.get("/swipe-deck", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!._id;
    const swiped = await Swipe.find({ swiper: userId }).select("problem");
    const swipedIds = swiped.map((s) => s.problem);

    const posts = await ProblemPost.find({
      owner: { $ne: userId },
      _id: { $nin: swipedIds },
      isOpen: true
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Unable to load swipe deck" });
  }
});

router.patch("/:id/close", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await ProblemPost.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    post.isOpen = false;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Unable to close problem" });
  }
});

// Swipe endpoint handles matching logic
router.post("/:id/swipe", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body as { direction: "left" | "right" };
    if (!direction || (direction !== "left" && direction !== "right")) {
      return res.status(400).json({ message: "Direction must be left or right" });
    }

    const problem = await ProblemPost.findById(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    if (problem.owner.toString() === req.user!._id.toString()) {
      return res.status(400).json({ message: "Cannot swipe your own problem" });
    }
    if (!problem.isOpen && direction === "right") {
      return res.status(400).json({ message: "Problem is closed to new matches" });
    }

    await Swipe.findOneAndUpdate(
      { swiper: req.user!._id, problem: id },
      { direction },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // If swiped right and problem open, create a match if not present
    if (direction === "right" && problem.isOpen) {
      let match = await Match.findOne({
        problem: problem._id,
        owner: problem.owner,
        helper: req.user!._id,
        isActive: true
      });
      if (!match) {
        match = await Match.create({
          problem: problem._id,
          owner: problem.owner,
          helper: req.user!._id
        });
      }
      return res.json({ message: "Matched", match });
    }

    res.json({ message: "Swipe recorded" });
  } catch (err) {
    res.status(500).json({ message: "Swipe failed" });
  }
});

export default router;
