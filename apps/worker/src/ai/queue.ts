import { queueSubscriber, redisConnection } from "@repo/shared/server";
import crypto from "node:crypto";
import { ENGINE_CONFIG, getQueueChannelKey, REDIS_KEYS } from "./constants.js";
import { peekNextKeyIndex } from "./key-manager.js";
import { trackQueueLength } from "./metrics.js";

const pendingResolvers = new Map<string, () => void>();

queueSubscriber.on("message", (channel: string, message: string): void => {
  if (message === "RELEASE_RELEASE") {
    const resolve = pendingResolvers.get(channel);

    if (resolve) {
      resolve();

      pendingResolvers.delete(channel);

      queueSubscriber.unsubscribe(channel).catch(() => {});
    }
  }
});

export async function initializeDistributedQueue(): Promise<void> {
  try {
    await redisConnection.del(REDIS_KEYS.ACTIVE_COUNT);

    await redisConnection.del(REDIS_KEYS.QUEUE_LIST);

    console.log(
      "🧹 [Queue System] Cleaned stale distributed concurrency trackers successfully."
    );
  } catch (error: unknown) {
    console.error(
      "🚨 [Queue System] Failed to clear initialization counters:",
      error
    );
  }
}

export async function acquire(
  runId: number,
  totalTaskStartTime: number
): Promise<void> {
  const currentActive = await redisConnection.incr(REDIS_KEYS.ACTIVE_COUNT);

  const nextEstimatedIndex = peekNextKeyIndex();

  if (currentActive <= ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS) {
    const queueSize = await redisConnection.llen(REDIS_KEYS.QUEUE_LIST);

    const timeSec = ((Date.now() - totalTaskStartTime) / 1000).toFixed(2);

    console.log(
      `[Run ${runId}] 🟢 CLAIMED | Key Index: ${nextEstimatedIndex} | Active Slots: ${currentActive}/${ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS} | Queue Size: ${queueSize} | Time: ${timeSec}s`
    );

    return;
  }

  await redisConnection.decr(REDIS_KEYS.ACTIVE_COUNT);

  const uniqueWorkerToken = crypto.randomUUID();

  const privateChannel = getQueueChannelKey(uniqueWorkerToken);

  await redisConnection.rpush(REDIS_KEYS.QUEUE_LIST, uniqueWorkerToken);

  const currentQueueLength = await redisConnection.llen(REDIS_KEYS.QUEUE_LIST);

  await trackQueueLength(currentQueueLength);

  const queueTimeSec = ((Date.now() - totalTaskStartTime) / 1000).toFixed(2);

  console.log(
    `[Run ${runId}] 💤 QUEUED | Key Index: ${nextEstimatedIndex} | Active Slots: ${ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS}/${ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS} | Queue Size: ${currentQueueLength} | Time: ${queueTimeSec}s`
  );

  await queueSubscriber.subscribe(privateChannel);

  await new Promise<void>((resolve) => {
    pendingResolvers.set(privateChannel, resolve);
  });

  const postActive = await redisConnection
    .get(REDIS_KEYS.ACTIVE_COUNT)
    .then((v) => (v ? parseInt(v, 10) : 0));

  const postQueueSize = await redisConnection.llen(REDIS_KEYS.QUEUE_LIST);

  const releaseTimeSec = ((Date.now() - totalTaskStartTime) / 1000).toFixed(2);

  console.log(
    `[Run ${runId}] 🔓 RELEASED | Key Index: ${nextEstimatedIndex} | Active Slots: ${postActive}/${ENGINE_CONFIG.MAX_CONCURRENT_REQUESTS} | Queue Size: ${postQueueSize} | Time: ${releaseTimeSec}s`
  );
}

export async function release(): Promise<void> {
  const nextWaitingWorkerToken = await redisConnection.lpop(
    REDIS_KEYS.QUEUE_LIST
  );

  if (nextWaitingWorkerToken) {
    const privateChannel = getQueueChannelKey(nextWaitingWorkerToken);

    await redisConnection.publish(privateChannel, "RELEASE_RELEASE");

    return;
  }

  await redisConnection.decr(REDIS_KEYS.ACTIVE_COUNT);
}
