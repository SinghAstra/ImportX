import { Router } from "express";
import { jobController } from "../controllers/job.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/:id/logs", authMiddleware, jobController.getJobLogs);

router.get("/:id/events", jobController.streamJobTelemetry);

export { router as jobRouter };
