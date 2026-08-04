import { redisConnection } from "@repo/shared/server";
import { getKeyUsageMetricKey, REDIS_KEYS } from "./constants.js";

export interface ClusterMetricsSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  retriesCount: number;
  averageLatencyMs: number;
  peakQueueLength: number;
  coolDownsCount: number;
  requestsPerKey: Record<number, number>;
}

export async function recordRequestStart(keyIndex: number): Promise<void> {
  await redisConnection.incr(REDIS_KEYS.TOTAL);

  await redisConnection.incr(getKeyUsageMetricKey(keyIndex));
}

export async function recordSuccess(latencyMs: number): Promise<void> {
  await redisConnection.incr(REDIS_KEYS.SUCCESS);

  await redisConnection.incrby(REDIS_KEYS.LATENCY_TOTAL, latencyMs);
}

export async function recordFailure(latencyMs: number): Promise<void> {
  await redisConnection.incr(REDIS_KEYS.FAILURE);

  await redisConnection.incrby(REDIS_KEYS.LATENCY_TOTAL, latencyMs);
}

export async function recordRetry(): Promise<void> {
  await redisConnection.incr(REDIS_KEYS.RETRIES);
}

export async function recordCoolDownTriggered(): Promise<void> {
  await redisConnection.incr(REDIS_KEYS.COOL_DOWN_COUNT);
}

export async function trackQueueLength(currentLength: number): Promise<void> {
  const currentPeakString = await redisConnection.get(REDIS_KEYS.PEAK_QUEUE);

  const currentPeak = currentPeakString ? parseInt(currentPeakString, 10) : 0;

  if (currentLength > currentPeak) {
    await redisConnection.set(REDIS_KEYS.PEAK_QUEUE, currentLength);
  }
}

export async function resetClusterMetrics(): Promise<void> {
  const keys = await redisConnection.keys("groq:metrics:*");

  if (keys.length > 0) {
    await redisConnection.del(...keys);
  }
}

export async function fetchClusterTelemetry(): Promise<ClusterMetricsSummary> {
  const [total, success, failure, retries, latency, peakQueue, coolDowns] =
    await Promise.all([
      redisConnection.get(REDIS_KEYS.TOTAL),
      redisConnection.get(REDIS_KEYS.SUCCESS),
      redisConnection.get(REDIS_KEYS.FAILURE),
      redisConnection.get(REDIS_KEYS.RETRIES),
      redisConnection.get(REDIS_KEYS.LATENCY_TOTAL),
      redisConnection.get(REDIS_KEYS.PEAK_QUEUE),
      redisConnection.get(REDIS_KEYS.COOL_DOWN_COUNT),
    ]);

  const totalReq = total ? parseInt(total, 10) : 0;

  const successReq = success ? parseInt(success, 10) : 0;

  const failReq = failure ? parseInt(failure, 10) : 0;

  const totalLatency = latency ? parseInt(latency, 10) : 0;

  const keyUsageKeys = await redisConnection.keys("groq:metrics:key_usage:*");

  const requestsPerKey: Record<number, number> = {};

  for (const keyPath of keyUsageKeys) {
    const indexPart = keyPath.split(":").pop();

    if (indexPart !== undefined) {
      const idx = parseInt(indexPart, 10);

      const val = await redisConnection.get(keyPath);

      requestsPerKey[idx] = val ? parseInt(val, 10) : 0;
    }
  }

  return {
    totalRequests: totalReq,
    successfulRequests: successReq,
    failedRequests: failReq,
    retriesCount: retries ? parseInt(retries, 10) : 0,
    averageLatencyMs: totalReq > 0 ? Math.round(totalLatency / totalReq) : 0,
    peakQueueLength: peakQueue ? parseInt(peakQueue, 10) : 0,
    coolDownsCount: coolDowns ? parseInt(coolDowns, 10) : 0,
    requestsPerKey,
  };
}
