import { Router } from "express";
import { signIn, signUp, signOut } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signUp);
router.post("/login", signIn);
router.post("/logout", requireAuth, signOut);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
