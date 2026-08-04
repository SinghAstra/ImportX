"use client";

import { repoKeys } from "@/features/repo/query-keys";
import { JOB_STATUS, logError, TelemetryEvent } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export interface TerminalMessage {
  message: string;
  timestamp: string;
}

export function useJobLiveStream(
  jobId: string,
  repositoryId: string,
  accessToken: string | undefined
) {
  const queryClient = useQueryClient();

  const [liveMessages, setLiveMessages] = useState<TerminalMessage[]>([]);

  const [prevJobId, setPrevJobId] = useState(jobId);

  if (jobId !== prevJobId) {
    setPrevJobId(jobId);

    setLiveMessages([]);
  }

  useEffect(() => {
    if (!jobId || !accessToken) return;

    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/events?token=${accessToken}`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as TelemetryEvent;

        if (payload.message) {
          setLiveMessages((prev) => [
            ...prev,
            { message: payload.message, timestamp: payload.timestamp },
          ]);
        }

        if (payload.status) {
          if (
            payload.status === JOB_STATUS.COMPLETED ||
            payload.status === JOB_STATUS.FAILED ||
            payload.status === JOB_STATUS.CANCELLED
          ) {
            eventSource.close();

            void Promise.all([
              queryClient.invalidateQueries({
                queryKey: repoKeys.detail(repositoryId),
              }),
              queryClient.invalidateQueries({
                queryKey: repoKeys.lists(),
              }),
            ]);
          }
        }
      } catch (error) {
        logError(error);
      }
    };

    eventSource.onerror = (error) => {
      logError(error);

      eventSource.close();
    };

    return () => eventSource.close();
  }, [jobId, repositoryId, accessToken, queryClient]);

  return { liveMessages };
}
