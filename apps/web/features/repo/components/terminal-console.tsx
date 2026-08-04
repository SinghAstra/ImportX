"use client";

import { type TerminalMessage } from "@/features/jobs/hooks/use-job-live-stream";

interface TerminalConsoleProps {
  messages: TerminalMessage[];
}

export function TerminalConsole({ messages }: TerminalConsoleProps) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);

      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "--:--:--";
    }
  };

  return (
    <div className="font-mono text-sm bg-card/60 py-1 text-foreground rounded-lg border border-border shadow-2xl h-full overflow-y-auto space-y-1.5">
      {messages.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 leading-relaxed border-b border-border/60 px-2 py-0.5"
        >
          <span className="text-muted-foreground select-none shrink-0 font-medium opacity-80">
            [{formatTime(item.timestamp)}]
          </span>
          <span className="text-foreground text-left break-all">
            {item.message}
          </span>
        </div>
      ))}

      {messages.length === 0 && (
        <div className="flex items-start gap-3 leading-relaxed border-b border-border/60 px-2 py-0.5">
          <span className="text-muted-foreground select-none shrink-0 font-medium opacity-80">
            [SYSTEM]
          </span>
          <span className="text-foreground text-left break-all">
            Awaiting terminal connection...
          </span>
        </div>
      )}
    </div>
  );
}
