export const repoKeys = {
  all: ["repos"] as const,
  lists: () => [...repoKeys.all, "list"] as const,
  details: () => [...repoKeys.all, "detail"] as const,
  detail: (id: string) => [...repoKeys.details(), id] as const,
  files: (id: string) => [...repoKeys.detail(id), "files"] as const,
  jobs: (repoId: string) => [...repoKeys.detail(repoId), "jobs"] as const,
  jobLogs: (repoId: string, jobId: string) =>
    [...repoKeys.jobs(repoId), jobId, "logs"] as const,
} as const;
