import { logError } from "@/utils/error";
import { logger } from "@/utils/logger";
import { Request, Response, Router } from "express";
import { seoService } from "./seo.service";

const router = Router();

// Endpoint: GET /api/seo/analyze?keyword=marketing
router.get("/analyze", async (req: Request, res: Response) => {
  try {
    logger.route("GET", "/api/seo/analyze");
    // 1. Extract the input from the URL
    const keyword = req.query.keyword as string;

    // 2. Validation
    if (!keyword) {
      res.status(400).json({
        status: "error",
        message: "Query parameter 'keyword' is required",
      });
      return;
    }

    // 3. Call the Service Class
    const data = await seoService.getKeywordAnalysis(keyword);

    // 4. Send the JSON response back to the Frontend
    res.json({
      status: "success",
      data,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      status: "error",
      message: "Failed to process keyword data.",
    });
  }
});

export const seoRouter = router;
