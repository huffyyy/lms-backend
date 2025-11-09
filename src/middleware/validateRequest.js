import { ZodError } from "zod";

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => err.message);
        return res.status(400).json({
          error: "Invalid Request",
          details: errorMessages,
        });
      }

      console.error("Unexpected error in validateRequest:", error);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  };
};
