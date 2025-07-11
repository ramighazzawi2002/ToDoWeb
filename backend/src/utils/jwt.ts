import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
dotenv.config();
export const generateToken = (
  user: { _id: mongoose.Types.ObjectId },
  expiration: string
): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  const payload = {
    id: user._id,
  };

  return jsonwebtoken.sign(
    payload,
    secret as string,
    {
      expiresIn: expiration,
    } as jsonwebtoken.SignOptions
  );
};

export const decodeToken = (token: string) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  try {
    return jsonwebtoken.verify(token, secret);
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};
