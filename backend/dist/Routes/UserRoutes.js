import express from "express";
import { SignUp, SignIn, LogOut, RefreshToken } from "../Controllers/User.js";
import { validateRequest } from "../middleware/validation.js";
import { UserSignUpSchema, UserSignInSchema } from "../Schema/User.js";
const router = express.Router();
// POST /api/users/signup - Create a new user
router.post("/signup", validateRequest(UserSignUpSchema), SignUp);
router.post("/signin", validateRequest(UserSignInSchema), SignIn);
// POST /api/users/refresh-token - Refresh user authentication token
router.post("/refresh-token", RefreshToken);
router.post("/logout", LogOut);
export default router;
