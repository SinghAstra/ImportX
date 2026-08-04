import { Router } from "express";
import { repositoryController } from "../controllers/repo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(authMiddleware);

router.post("/", repositoryController.ingest);

router.get("/:id/files", repositoryController.getFiles);

router.get("/:id", repositoryController.getRepository);

router.get("/", repositoryController.getRepositories);

router.post("/:id/resync", repositoryController.resync);

router.post("/:id/boost", repositoryController.boost);

router.delete("/bulk", repositoryController.deleteBulk);

router.delete("/:id", repositoryController.deleteSingle);

export { router as repoRouter };
