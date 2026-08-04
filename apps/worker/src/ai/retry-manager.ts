import { redisConnection } from "@repo/shared/server";
import { ENGINE_CONFIG, REDIS_KEYS } from "./constants.js";
import { classifyError } from "./error-classifier.js";
import { recordRetry } from "./metrics.js";

interface RetryOperationResult<T> {
  readonly data: T;
  readonly keyIndex: number;
}

/**
 * Higher-order runner enforcing perfect console alignment metrics on structural execution loops.
 */
export async function executeWithRetry<T>(
  operation: (attempt: number) => Promise<RetryOperationResult<T>>,
  runId: number,
  totalTaskStartTime: number
): Promise<RetryOperationResult<T>> {
  let attempts = 0;

  let lastAttemptedKeyIndex = 0;

  while (attempts < ENGINE_CONFIG.RETRY.maxRetries) {
    attempts++;

    if (attempts > 1) {
      await recordRetry();

      const retryActive = await redisConnection
        .get(REDIS_KEYS.ACTIVE_COUNT)
        .then((v) => (v ? parseInt(v, 10) : 0));

      const retryQueue = await redisConnection.llen(REDIS_KEYS.QUEUE_LIST);

      const retryTimeSec = ((Date.now() - totalTaskStartTime) / 1000).toFixed(
        2
      );

      console.log(
        `[Run ${runId}] 🔄 RETRY | Key Index: ${lastAttemptedKeyIndex} | Result: "Attempt ${attempts}/${ENGINE_CONFIG.RETRY.maxRetries}" | Active Slots: ${retryActive}/${ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS} | Queue Size: ${retryQueue} | Time: ${retryTimeSec}s`
      );
    }

    try {
      return await operation(attempts);
    } catch (error: unknown) {
      const contextError = error as {
        originalError: unknown;
        keyIndex: number;
      };

      lastAttemptedKeyIndex = contextError.keyIndex ?? 0;

      const actualException = contextError.originalError || error;

      const classification = classifyError(actualException);

      const errActive = await redisConnection
        .get(REDIS_KEYS.ACTIVE_COUNT)
        .then((v) => (v ? parseInt(v, 10) : 0));

      const errQueue = await redisConnection.llen(REDIS_KEYS.QUEUE_LIST);

      const errTimeSec = ((Date.now() - totalTaskStartTime) / 1000).toFixed(2);

      console.log(
        `[Run ${runId}] ⚠️ FAILURE | Key Index: ${lastAttemptedKeyIndex} | Result: "${classification.label}" | Active Slots: ${errActive}/${ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS} | Queue Size: ${errQueue} | Time: ${errTimeSec}s`
      );

      if (
        classification.isPermanent ||
        attempts >= ENGINE_CONFIG.RETRY.maxRetries
      ) {
        throw contextError;
      }

      const exponentialDelay =
        ENGINE_CONFIG.RETRY.backoffBaseMs * Math.pow(2, attempts - 1);

      const finalWait = Math.min(
        ENGINE_CONFIG.RETRY.maxBackoffMs,
        exponentialDelay
      );

      await new Promise((resolve) => setTimeout(resolve, finalWait));
    }
  }

  throw new Error("RETRY_CRITICAL_EXHAUSTION");
}
