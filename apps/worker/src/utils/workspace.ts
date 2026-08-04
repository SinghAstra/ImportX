import os from "node:os";
import path from "node:path";

export const PRODUCT_NAME = "import-x";

export function getWorkspacePath(repositoryId: string) {
  return path.join(os.tmpdir(), PRODUCT_NAME, repositoryId);
}
