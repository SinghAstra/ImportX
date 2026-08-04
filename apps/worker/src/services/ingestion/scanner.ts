import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { IGNORED_DIRECTORIES, SUPPORTED_EXTENSIONS } from "./constants";
import { ScanStats } from "./types";

export async function scanWorkspace(
  basePath: string,
  currentPath: string,
  stats: ScanStats
) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);

    const relativePath = path.relative(basePath, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        stats.ignoredFiles += 1;

        continue;
      }

      stats.totalFolders += 1;

      await scanWorkspace(basePath, fullPath, stats);
    } else if (entry.isFile()) {
      stats.totalFiles += 1;

      const fileStat = await fs.stat(fullPath);

      const ext = path.extname(entry.name).toLowerCase();

      const fileSize = fileStat.size;

      if (!SUPPORTED_EXTENSIONS.has(ext)) {
        stats.ignoredFiles += 1;

        continue;
      }

      stats.supportedFiles += 1;

      stats.totalSize += BigInt(fileSize);

      const rawBuffer = await fs.readFile(fullPath);

      const normalizedContent = rawBuffer
        .toString("utf-8")
        .replace(/\r\n/g, "\n");

      const hash = crypto
        .createHash("sha256")
        .update(normalizedContent)
        .digest("hex");

      stats.collectedFiles.push({
        relativePath,
        extension: ext,
        size: fileSize,
        hash,
      });
    }
  }
}
