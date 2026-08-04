/**
 * Global configurations and shared Redis state layout schemas.
 * Replaces all local variable duplicates across the entire pipeline.
 */
export const ENGINE_CONFIG = {
  MAX_CONCURRENT_REQUESTS: 8,
  DEFAULT_REQUEST_TIMEOUT_MS: 30000,
  COOL_DOWN_DURATION_MS: 30000,
  RETRY: {
    backoffBaseMs: 1000,
    maxBackoffMs: 5 * 60 * 1000,
    maxRetries: 10,
  },
} as const;

export const REDIS_KEYS = {
  ACTIVE_COUNT: "groq:active_requests",
  QUEUE_LIST: "groq:queue_list",
  TOTAL: "groq:metrics:total",
  SUCCESS: "groq:metrics:success",
  FAILURE: "groq:metrics:failure",
  RETRIES: "groq:metrics:retries",
  LATENCY_TOTAL: "groq:metrics:latency_total",
  PEAK_QUEUE: "groq:metrics:peak_queue",
  COOL_DOWN_COUNT: "groq:metrics:cool_down_count",
} as const;

/**
 * Returns a private channel name string for a sleeping queue token context.
 */
export function getQueueChannelKey(workerToken: string): string {
  return `groq:queue_channel:${workerToken}`;
}

/**
 * Returns a shared cluster key tracking individual token index cooldowns.
 */
export function getCoolDownKeyPath(keyIndex: number): string {
  return `groq:cool_down:${keyIndex}`;
}

/**
 * Returns a telemetry key for a specific API token index signature.
 */
export function getKeyUsageMetricKey(keyIndex: number): string {
  return `groq:metrics:key_usage:${keyIndex}`;
}
