import { logError } from "@repo/shared";
import { redisConnection } from "@repo/shared/server";
import Groq from "groq-sdk";
import { getCachedClient } from "./client-cache.js";
import { ENGINE_CONFIG, REDIS_KEYS } from "./constants.js";
import { classifyError } from "./error-classifier.js";
import { coolDownKey, getNextKey } from "./key-manager.js";
import { recordFailure, recordRequestStart, recordSuccess } from "./metrics.js";
import { acquire, release } from "./queue.js";
import { executeWithRetry } from "./retry-manager.js";
import { withTimeout } from "./timeout.js";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatCompletionMessage {
  role: ChatRole;
  content: string;
}

export interface AIRequestPayload {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
}

export async function executeAIRequest(
  runId: number,
  payload: AIRequestPayload
): Promise<Groq.Chat.Completions.ChatCompletion | null> {
  const totalTaskStartTime = Date.now();

  const initialActive = await redisConnection
    .get(REDIS_KEYS.ACTIVE_COUNT)
    .then((v) => (v ? parseInt(v, 10) : 0));

  const initialQueue = await redisConnection.llen(REDIS_KEYS.QUEUE_LIST);

  const startTimeSec = ((Date.now() - totalTaskStartTime) / 1000).toFixed(2);

  console.log(
    `[Run ${runId}] 📡 START | Key Index: TBD | Result: N/A | Active Slots: ${initialActive}/${ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS} | Queue Size: ${initialQueue} | Time: ${startTimeSec}s`
  );

  await acquire(runId, totalTaskStartTime);

  let finalResolvedKeyIndex = 0;

  try {
    const outcome = await executeWithRetry(
      async () => {
        const keyInfo = await getNextKey();

        finalResolvedKeyIndex = keyInfo.index;

        await recordRequestStart(keyInfo.index);

        const groq: Groq = getCachedClient(keyInfo.key, keyInfo.index);

        try {
          const res = await withTimeout(
            groq.chat.completions.create({
              model: payload.model,
              messages: payload.messages,
              temperature: payload.temperature ?? 0.1,
            }),
            ENGINE_CONFIG.DEFAULT_REQUEST_TIMEOUT_MS
          );

          return { data: res, keyIndex: keyInfo.index };
        } catch (error: unknown) {
          const classification = classifyError(error);

          if (classification.isRateLimit) {
            await coolDownKey(
              keyInfo.index,
              ENGINE_CONFIG.COOL_DOWN_DURATION_MS
            );
          }

          throw { originalError: error, keyIndex: keyInfo.index };
        }
      },
      runId,
      totalTaskStartTime
    );

    const totalExecutionTimeSec = (
      (Date.now() - totalTaskStartTime) /
      1000
    ).toFixed(2);

    await recordSuccess(Date.now() - totalTaskStartTime);

    const successActive = await redisConnection
      .get(REDIS_KEYS.ACTIVE_COUNT)
      .then((v) => (v ? parseInt(v, 10) : 0));

    const successQueue = await redisConnection.llen(REDIS_KEYS.QUEUE_LIST);

    const textSnippet =
      outcome.data.choices[0]?.message?.content?.trim().replace(/\n/g, " ") ||
      "";

    const displayResult =
      textSnippet.length > 40
        ? `${textSnippet.substring(0, 40)}...`
        : textSnippet;

    console.log(
      `[Run ${runId}] ✅ SUCCESS | Key Index: ${outcome.keyIndex} | Result: "${displayResult}" | Active Slots: ${successActive}/${ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS} | Queue Size: ${successQueue} | Time: ${totalExecutionTimeSec}s`
    );

    return outcome.data;
  } catch (error: unknown) {
    const totalExecutionTimeSec = (
      (Date.now() - totalTaskStartTime) /
      1000
    ).toFixed(2);

    await recordFailure(Date.now() - totalTaskStartTime);

    const contextError = error as {
      originalError?: unknown;
      keyIndex?: number;
    };

    const actualException = contextError.originalError || error;

    logError(actualException);

    const failureActive = await redisConnection
      .get(REDIS_KEYS.ACTIVE_COUNT)
      .then((v) => (v ? parseInt(v, 10) : 0));

    const failureQueue = await redisConnection.llen(REDIS_KEYS.QUEUE_LIST);

    const apiError = actualException as { message?: string };

    const errorMessage = apiError.message || String(actualException);

    console.log(
      `[Run ${runId}] 🚨 FATAL | Key Index: ${finalResolvedKeyIndex} | Result: "${errorMessage}" | Active Slots: ${failureActive}/${ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS} | Queue Size: ${failureQueue} | Time: ${totalExecutionTimeSec}s`
    );

    return null;
  } finally {
    await release();
  }
}
