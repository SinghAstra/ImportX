import { redisConnection } from "@repo/shared/server";
import dotenv from "dotenv";
import { getCoolDownKeyPath } from "./constants.js";
import { recordCoolDownTriggered } from "./metrics.js";

dotenv.config();

const rawKeysString = process.env.GROQ_API_KEYS || "";

const apiKeysPool: readonly string[] = rawKeysString
  .split(",")
  .map((key) => key.trim())
  .filter((key) => key.length > 0);

if (apiKeysPool.length === 0) {
  throw new Error("GROQ_CONFIG_ERROR: No valid API keys detected.");
}

let currentRotationIndex = 0;

export interface RotatedKeyResult {
  readonly key: string;
  readonly index: number;
}

export function peekNextKeyIndex(): number {
  return currentRotationIndex;
}

export async function coolDownKey(
  index: number,
  durationMs: number
): Promise<void> {
  const redisKey = getCoolDownKeyPath(index);

  await redisConnection.set(redisKey, "COOL_DOWN_ACTIVE", "PX", durationMs);

  await recordCoolDownTriggered();

  console.log(
    `🔒 [Shared Key Registry] Index ${index} flagged as cool_down status across cluster.`
  );
}

export async function getNextKey(): Promise<RotatedKeyResult> {
  const poolLength = apiKeysPool.length;

  for (let i = 0; i < poolLength; i++) {
    const checkIndex = (currentRotationIndex + i) % poolLength;

    const key = apiKeysPool[checkIndex];

    const redisKey = getCoolDownKeyPath(checkIndex);

    const isCooledDown = await redisConnection.exists(redisKey);

    if (isCooledDown === 0 && key) {
      currentRotationIndex = (checkIndex + 1) % poolLength;

      return { key, index: checkIndex };
    }
  }

  const fallbackIndex = currentRotationIndex;

  currentRotationIndex = (currentRotationIndex + 1) % poolLength;

  console.log(
    `⚠️ [Shared Key Registry] All keys are cooling down globally. Falling back to Index ${fallbackIndex}.`
  );

  const fallbackKey = apiKeysPool[fallbackIndex];

  if (!fallbackKey)
    throw new Error(
      "GROQ_KEY_ERROR: Shared fallback tracking resolution failed."
    );

  return { key: fallbackKey, index: fallbackIndex };
}
