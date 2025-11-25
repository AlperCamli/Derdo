import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import Report from "../models/Report";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { targetProblemId, targetMessageId, reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Reason required" });
    if (!targetProblemId && !targetMessageId) {
      return res
        .status(400)
        .json({ message: "Provide a problem or message to report" });
    }
    const report = await Report.create({
      reporter: req.user!._id,
      targetProblem: targetProblemId,
      targetMessage: targetMessageId,
      reason
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: "Unable to submit report" });
  }
});

export default router;
