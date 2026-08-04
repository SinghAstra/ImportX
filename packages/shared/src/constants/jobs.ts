export const QUEUE_NAMES = {
  REPOSITORY_INGESTION: "repository-ingestion-queue",
  FILE_SUMMARIZATION: "file-summarization-queue",
} as const;

export const JOB_NAMES = {
  ANALYZE_REPO: "analyze-repo-job",
  SUMMARIZE_FILE: "summarize-file-job",
} as const;
