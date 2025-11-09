import express from "express";
import { validateRequest } from "../middleware/validateRequest.js";
import { signInSchema, signUpSchema } from "../utils/schema.js";
import { signUpAction } from "../controllers/authController.js";
import { signInAction } from "../controllers/authController.js";

const authRoute = express.Router();

authRoute.post("/sign-up", validateRequest(signUpSchema), signUpAction);
authRoute.post("/sign-in", validateRequest(signInSchema), signInAction);

export default authRoute;
