import madge from "madge";
import { prisma } from "@repo/db";
import { trackProgress } from "@repo/shared/server";
import { JOB_STATUS } from "@repo/shared";

const EDGE_BATCH_SIZE = 100;

const BATCH_DELAY_MS = 50;

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

  // 1. Run Madge
  console.log(`⏳ [Madge] Executing Madge...`);

  const madgeResult = await madge(workspacePath, {
    baseDir: workspacePath,
    // Strictly ignore massive folders so it doesn't hang
    excludeRegExp: [/node_modules/, /\.git/, /dist/, /build/, /\.next/],
    fileExtensions: ["js", "jsx", "ts", "tsx"],
  });

  // Returns { "source.ts": ["target1.ts", "target2.ts"] }
  const graphObj = madgeResult.obj();

  // 2. Extract unique nodes
  const uniqueFiles = new Set<string>();

  for (const [source, targets] of Object.entries(graphObj)) {
    uniqueFiles.add(source);

    targets.forEach((target) => uniqueFiles.add(target));
  }

  const filesArray = Array.from(uniqueFiles);

  console.log(
    `✅ [Madge] Analysis complete. Found ${filesArray.length} unique files.`
  );

  await trackProgress({
    jobId,
    repositoryId: repoId,
    status: JOB_STATUS.RUNNING,
    message: `AST analysis complete. Preparing to save ${filesArray.length} nodes...`,
  });

  // 3. Clean up previous runs
  console.log(`🧹 [Madge DB] Cleaning up previous graph data for repo...`);

  await prisma.graphEdge.deleteMany({ where: { repositoryId: repoId } });

  await prisma.graphNode.deleteMany({ where: { repositoryId: repoId } });

  // 4. Insert Nodes Iteratively
  console.log(`💾 [Madge DB] Inserting Graph Nodes...`);

  const nodeDbIds = new Map<string, string>();

  for (let i = 0; i < filesArray.length; i++) {
    const filePath = filesArray[i];

    // Madge resolves everything relative to baseDir, making it super clean
    const node = await prisma.graphNode.create({
      data: {
        repositoryId: repoId,
        filePath: filePath,
        isExternal: false, // Madge with our config skips external node_modules
      },
    });

    nodeDbIds.set(filePath, node.id);

    if ((i + 1) % 500 === 0) {
      console.log(`⏳ [Madge DB] Saved ${i + 1}/${filesArray.length} nodes...`);
    }
  }

  // 5. Prepare Edges
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
        type: "import", // Madge doesn't specify dynamic vs static by default
      });
    }
  }

  await trackProgress({
    jobId,
    repositoryId: repoId,
    status: JOB_STATUS.RUNNING,
    message: `Saving ${edgesToInsert.length} edges in safe batches...`,
  });

  // 6. Insert Edges in Micro-Batches
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
