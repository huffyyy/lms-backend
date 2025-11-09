import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getOverviews } from "../controllers/overviewController.js";

const overviewRoutes = express.Router();

overviewRoutes.get("/overviews", verifyToken, getOverviews);

export default overviewRoutes;
