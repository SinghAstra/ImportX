import { sendSuccess } from "@/utils/api-response";
import { AppError } from "@/utils/AppError";
import { logError } from "@/utils/error";
import { logger } from "@/utils/logger";
import { Request, Response, Router } from "express";
import { seoService } from "./seo.service";

const router = Router();

// Endpoint: GET /api/seo/analyze?keyword=marketing
router.get("/analyze", async (req: Request, res: Response, next) => {
  try {
    logger.route("GET", "/api/seo/analyze");
    // 1. Extract the input from the URL
    const keyword = req.query.keyword as string;

    // 2. Validation
    if (!keyword) {
      throw new AppError("Keyword is required", 400, "BAD_REQUEST");
    }

    // 3. Call the Service Class
    const data = await seoService.getKeywordAnalysis(keyword);

    // 4. Send the JSON response back to the Frontend
    return sendSuccess(res, data);
  } catch (error) {
    logError(error);
    next(error);
  }
});

export const seoRouter = router;
