import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

await connectDB();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "This is the home page",
    database: "Connected",
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Management API is running..",
    database: "Connected",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
