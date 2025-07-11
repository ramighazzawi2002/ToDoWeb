import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
dotenv.config();
export const generateToken = (user, expiration) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not defined");
    }
    const payload = {
        id: user._id,
    };
    return jsonwebtoken.sign(payload, secret, {
        expiresIn: expiration,
    });
};
export const decodeToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not defined");
    }
    try {
        return jsonwebtoken.verify(token, secret);
    }
    catch (error) {
        console.error("Token verification error:", error);
        return null;
    }
};
