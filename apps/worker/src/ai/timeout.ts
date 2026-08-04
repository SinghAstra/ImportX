/**
 * Races an asynchronous operation promise against a client-side execution timer.
 * Rejects cleanly with a contextual Error instance if the window closes.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error("REQUEST_TIMEOUT: AI took too long to respond.")),
        timeoutMs
      )
    ),
  ]);
}
