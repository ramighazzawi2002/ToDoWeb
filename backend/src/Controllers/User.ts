// User Controller with middleware validation
import { Request, Response } from "express";
import UserModel from "../Models/User.js";
import bcrypt from "bcrypt";
import { generateToken, decodeToken } from "../utils/jwt.js";
import dotenv from "dotenv";
dotenv.config();
export const SignUp = async (req: Request, res: Response) => {
  // #swagger.tags = ['Users']
  /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'SignUp.',
            schema: { $ref: '#/definitions/UserSignUpSchema' }
    } */
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email, isDeleted: false });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
        errors: {
          email: ["Email is already registered"],
        },
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("SignUp error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

export const SignIn = async (req: Request, res: Response) => {
  // #swagger.tags = ['Users']
  /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Signin.',
            schema: { $ref: '#/definitions/UserSignInSchema' }
    } */
  try {
    const { email, password } = req.body;
    console.log("email:", email); // Debug log
    console.log("password:", password); // Debug log
    const user = await UserModel.findOne({ email, isDeleted: false }).select(
      "+password"
    );
    console.log("User found:", user); // Debug log
    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
        errors: {
          email: ["User not found with this email"],
        },
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
        errors: {
          password: ["Incorrect password"],
        },
      });
    }
    const token = generateToken({ _id: user._id }, "1h");
    const refreshToken = generateToken({ _id: user._id }, "1y");
    console.log("Generated token:", token); // Debug log
    console.log("Generated refresh token:", refreshToken); // Debug log
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? ("none" as const)
          : ("strict" as const),
    };
    console.log("Cookie options:", cookieOptions); // Debug log

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
    console.log("Cookies set successfully"); // Debug log
    res.status(200).json({
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("SignIn error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

export const LogOut = (req: Request, res: Response) => {
  // #swagger.tags = ['Users']
  try {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("LogOut error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

export const RefreshToken = async (req: Request, res: Response) => {
  // #swagger.tags = ['Users']
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Verify the current token first
    const decoded = decodeToken(refreshToken) as any;
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
    // Generate a new token
    const newToken = generateToken({ _id: decoded.id }, "1h");
    const newRefreshToken = generateToken({ _id: decoded.id }, "1y");

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? ("none" as const)
          : ("strict" as const),
    };

    res.cookie("token", newToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
    res.status(200).json({
      message: "Token refreshed successfully",
      data: {
        _id: decoded.id,
      },
    });
  } catch (error) {
    console.error("RefreshToken error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
