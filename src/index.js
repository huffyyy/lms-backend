import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import globalRoutes from "./routes/globalRoutes.js";
import authRoute from "./routes/authRoutes.js";
import connectDB from "./utils/database.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import courseRoute from "./routes/courseRoute.js";
import studentRoutes from "./routes/studentRoutes.js";
import overviewRoutes from "./routes/overviewRoutes.js";

const app = express();

dotenv.config();

connectDB();

const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({ text: "Hello World!!" });
});

app.use("/api", globalRoutes);
app.use("/api", paymentRoutes);
app.use("/api", authRoute);
app.use("/api", courseRoute);
app.use("/api", studentRoutes);
app.use("/api", overviewRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
