export const getJobTelemetryChannel = (repositoryId: string): string => {
  return `repo:telemetry:${repositoryId}`;
};
