import { decodeToken } from "../utils/jwt.js";
export const authMiddleware = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decoded = decodeToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }
  req.user = decoded;
  next();
};
