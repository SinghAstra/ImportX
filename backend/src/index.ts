import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { env } from "@/config/env";
import { healthRouter } from "@/features/health/health.routes";
import { seoRouter } from "@/features/seo/seo.routes";
import { requireAuth } from "@/middleware/auth.middleware";
import { errorHandler } from "@/middleware/error.middleware";

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

app.use("/api/seo", requireAuth, seoRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
