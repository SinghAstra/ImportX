import { logError } from "@repo/shared";
import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function cloneRepository(
  workspacePath: string,
  githubUrl: string
) {
  await fs.mkdir(path.dirname(workspacePath), { recursive: true });

  await fs.rm(workspacePath, { recursive: true, force: true }).catch(() => {});

  try {
    console.log(`⏳ [Git] Cloning ${githubUrl}... (This may take a minute)`);

    await execAsync(`git clone --depth 1 ${githubUrl} ${workspacePath}`, {
      timeout: 300000, // Increased to 5 minutes (300,000 ms)
      maxBuffer: 1024 * 1024 * 50, // Increased buffer to 50MB to prevent overflow crashes
    });

    console.log(
      `✅ [Git] Successfully cloned: ${githubUrl} into ${workspacePath}`
    );
  } catch (error) {
    console.error(`💥 [Git] Failed to clone ${githubUrl}:`);

    logError(error);

    throw error;
  }
}
