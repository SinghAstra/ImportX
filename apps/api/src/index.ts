import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { AppError } from "./errors/api-errors.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { jobRouter } from "./routes/job.routes.js";
import { repoRouter } from "./routes/repo.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (_, res) => {
  console.log("Health check endpoint accessed");

  res.json({ status: "healthy" });
});

app.use("/api/auth", authRouter);

app.use("/api/repo", repoRouter);

app.use("/api/jobs", jobRouter);

app.use((req, _res, next) => {
  next(new AppError(404, "ROUTE_NOT_FOUND", `Cannot ${req.method} ${req.url}`));
});

app.use(globalErrorHandler);

app.listen(env.PORT, () => {
  console.log(`API Server running successfully`, {
    port: env.PORT,
    env: env.NODE_ENV,
  });
});
