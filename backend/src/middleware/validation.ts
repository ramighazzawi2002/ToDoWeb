import { Request, Response, NextFunction } from "express";
import vine, { errors } from "@vinejs/vine";

export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validator = vine.compile(schema);
      req.body = await validator.validate(req.body);
      next();
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(422).json({
          message: "Validation failed",
          errors: error.messages,
        });
      }

      return res.status(500).json({
        message: "Internal server error during validation",
      });
    }
  };
};
