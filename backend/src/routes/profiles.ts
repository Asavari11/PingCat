import { Router } from "express";
import { User } from "../models/User";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "_id username email photo_url created_at").sort({ created_at: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

export default router;
