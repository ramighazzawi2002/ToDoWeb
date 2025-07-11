import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";

export const generateToken = (
  user: { _id: mongoose.Types.ObjectId },
  expiration: string
) => {
  const payload = {
    id: user._id,
  };
  return jsonwebtoken.sign(payload, "test", {
    expiresIn: expiration,
  });
};

export const decodeToken = (token: string) => {
  try {
    return jsonwebtoken.verify(token, "test");
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};
