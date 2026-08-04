import { validateApiEnv } from "@repo/env";
import dotenv from "dotenv";

dotenv.config();

export const env = validateApiEnv();
