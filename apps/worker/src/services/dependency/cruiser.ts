import madge from "madge";
import { prisma } from "@repo/db";
import { trackProgress } from "@repo/shared/server";
import { JOB_STATUS, logError } from "@repo/shared";
import path from "path";
import fs from "fs";

const EDGE_BATCH_SIZE = 100;

const BATCH_DELAY_MS = 50;

const BARE_IMPORT_REGEX = /(?:from|import)\s+['"]((?!\.|\/)[^'"]+)['"]/g;

export async function extractAndStoreGraph(
  workspacePath: string,
  repoId: string,
  jobId: string
) {
  console.log(
    `🔍 [Madge] Starting AST analysis on workspace: ${workspacePath}`
  );

  await trackProgress({
    jobId,
    repositoryId: repoId,
    status: JOB_STATUS.RUNNING,
    message: "Analyzing codebase AST with Madge...",
  });

  console.log(`⏳ [Madge] Executing Madge...`);

  const madgeResult = await madge(workspacePath, {
    baseDir: workspacePath,
    excludeRegExp: [/\.git/, /dist/, /build/, /\.next/],
    fileExtensions: ["js", "jsx", "ts", "tsx"],
  });

  const graphObj = madgeResult.obj();

  for (const sourceFile of Object.keys(graphObj)) {
    try {
      const fullPath = path.join(workspacePath, sourceFile);

      const fileContent = fs.readFileSync(fullPath, "utf-8");

      let match;

      while ((match = BARE_IMPORT_REGEX.exec(fileContent)) !== null) {
        let packageName = match[1];

        if (packageName.startsWith("@")) {
          const parts = packageName.split("/");

          packageName = `${parts[0]}/${parts[1]}`;
        } else {
          packageName = packageName.split("/")[0];
        }

        if (!graphObj[sourceFile].includes(packageName)) {
          graphObj[sourceFile].push(packageName);
        }
      }
    } catch (error) {
      logError(error);
    }
  }

  const uniqueFiles = new Set<string>();

  for (const [source, targets] of Object.entries(graphObj)) {
    uniqueFiles.add(source);

    targets.forEach((target) => uniqueFiles.add(target));
  }

  const filesArray = Array.from(uniqueFiles);

  console.log(
    `✅ [Madge] Analysis complete. Found ${filesArray.length} unique files/modules.`
  );

  await trackProgress({
    jobId,
    repositoryId: repoId,
    status: JOB_STATUS.RUNNING,
    message: `AST analysis complete. Preparing to save ${filesArray.length} nodes...`,
  });

  console.log(`🧹 [Madge DB] Cleaning up previous graph data for repo...`);

  await prisma.graphEdge.deleteMany({ where: { repositoryId: repoId } });

  await prisma.graphNode.deleteMany({ where: { repositoryId: repoId } });

  console.log(`💾 [Madge DB] Inserting ${filesArray.length} Graph Nodes...`);

  const nodesToInsert = filesArray.map((filePath) => ({
    repositoryId: repoId,
    filePath: filePath,
    isExternal: !filePath.includes("."),
  }));

  await prisma.graphNode.createMany({
    data: nodesToInsert,
    skipDuplicates: true,
  });

  console.log(`🔍 [Madge DB] Fetching generated Node IDs...`);

  const insertedNodes = await prisma.graphNode.findMany({
    where: { repositoryId: repoId },
    select: { id: true, filePath: true },
  });

  const nodeDbIds = new Map<string, string>();

  for (const node of insertedNodes) {
    nodeDbIds.set(node.filePath, node.id);
  }

  console.log(`🧮 [Madge] Mapping edge relationships...`);

  const edgesToInsert = [];

  for (const [source, targets] of Object.entries(graphObj)) {
    const sourceId = nodeDbIds.get(source);

    if (!sourceId) continue;

    for (const target of targets) {
      const targetId = nodeDbIds.get(target);

      if (!targetId) continue;

      edgesToInsert.push({
        repositoryId: repoId,
        sourceId,
        targetId,
        type: "import",
      });
    }
  }

  await trackProgress({
    jobId,
    repositoryId: repoId,
    status: JOB_STATUS.RUNNING,
    message: `Saving ${edgesToInsert.length} edges in safe batches...`,
  });

  console.log(`💾 [Madge DB] Inserting ${edgesToInsert.length} edges...`);

  let insertedEdgesCount = 0;

  for (let i = 0; i < edgesToInsert.length; i += EDGE_BATCH_SIZE) {
    const batch = edgesToInsert.slice(i, i + EDGE_BATCH_SIZE);

    await prisma.graphEdge.createMany({
      data: batch,
      skipDuplicates: true,
    });

    insertedEdgesCount += batch.length;

    if (
      insertedEdgesCount % 1000 === 0 ||
      insertedEdgesCount === edgesToInsert.length
    ) {
      console.log(
        `⏳ [Madge DB] Saved batch: ${insertedEdgesCount}/${edgesToInsert.length} edges.`
      );
    }

    if (i + EDGE_BATCH_SIZE < edgesToInsert.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log(`✅ [Madge DB] Graph generation and storage complete!`);
}
