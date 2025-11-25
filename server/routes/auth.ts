import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import { generatePseudonym } from "../utils/pseudonym";

const router = Router();

const signToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT secret missing");
  return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already used" });

    let pseudonym = generatePseudonym();
    // ensure unique pseudonym
    while (await UserModel.findOne({ pseudonym })) {
      pseudonym = generatePseudonym();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ email, passwordHash, pseudonym });

    const token = signToken(user._id.toString());
    res
      .cookie("token", token, { httpOnly: true, sameSite: "lax" })
      .json({ id: user._id, pseudonym: user.pseudonym, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user._id.toString());
    res
      .cookie("token", token, { httpOnly: true, sameSite: "lax" })
      .json({ id: user._id, pseudonym: user.pseudonym, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Unauthenticated" });
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT secret missing");
    const payload = jwt.verify(token, secret) as { id: string };
    const user = await UserModel.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Unauthenticated" });
    res.json({ id: user._id, pseudonym: user.pseudonym });
  } catch (err) {
    res.status(401).json({ message: "Unauthenticated" });
  }
});

export default router;
