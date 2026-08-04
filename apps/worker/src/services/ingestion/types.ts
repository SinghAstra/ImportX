export interface CollectedFile {
  relativePath: string;
  extension: string;
  size: number;
  hash: string;
}

export interface ScanStats {
  totalFiles: number;
  supportedFiles: number;
  ignoredFiles: number;
  totalFolders: number;
  totalSize: bigint;
  collectedFiles: CollectedFile[];
}
