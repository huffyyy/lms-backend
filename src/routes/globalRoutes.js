import express from "express";
import { helloWorld } from "../controllers/globalController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { exampleSchema } from "../utils/schema.js";

const globalRoutes = express.Router();

globalRoutes.get("/hello-world", helloWorld);
globalRoutes.post(
  "/test-validate",
  validateRequest(exampleSchema),
  async (req, res) => {
    return res.json({ message: "success" });
  }
);

export default globalRoutes;
