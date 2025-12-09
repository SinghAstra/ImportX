import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { env } from "@/config/env";
import { healthRouter } from "@/features/health/health.routes";

dotenv.config();

const app = express();
const PORT = env.PORT;

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/health", healthRouter);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Synap Backend is Running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
