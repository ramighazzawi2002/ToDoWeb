import { Request, Response, NextFunction } from "express";
import { decodeToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      token?: any;
      user?: any;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
