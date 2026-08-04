import { cruise, IReporterOutput, ICruiseResult } from "dependency-cruiser";
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
    `🔍 [Cruiser] Starting AST analysis on workspace: ${workspacePath}`
  );

  await trackProgress({
    jobId,
    repositoryId: repoId,
    status: JOB_STATUS.RUNNING,
    message: "Analyzing codebase AST (Abstract Syntax Tree)...",
  });

  console.log(`⏳ [Cruiser] Executing dependency-cruiser...`);

  const cruiseResult = (await cruise([workspacePath], {
    exclude: { path: ["node_modules", ".git", "dist", "build"] },
  })) as IReporterOutput;

  const output = cruiseResult.output as ICruiseResult;

  const modules = output.modules;

  console.log(
    `✅ [Cruiser] Analysis complete. Found ${modules.length} modules.`
  );

  await trackProgress({
    jobId,
    repositoryId: repoId,
    status: JOB_STATUS.RUNNING,
    message: `AST analysis complete. Preparing to save ${modules.length} nodes...`,
  });

  console.log(`🧹 [Cruiser DB] Cleaning up previous graph data for repo...`);

  // 2. Clean up previous runs safely without a transaction
  await prisma.graphEdge.deleteMany({ where: { repositoryId: repoId } });

  await prisma.graphNode.deleteMany({ where: { repositoryId: repoId } });

  console.log(`💾 [Cruiser DB] Inserting Graph Nodes iteratively...`);

  const nodeDbIds = new Map<string, string>();

  // 3. Insert Nodes (Iteratively to avoid transaction limits)
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];

    const node = await prisma.graphNode.create({
      data: {
        repositoryId: repoId,
        filePath: mod.source,
        isExternal: mod.coreModule || false,
      },
    });

    nodeDbIds.set(mod.source, node.id);

    // Log progress periodically on massive repos
    if ((i + 1) % 500 === 0) {
      console.log(`⏳ [Cruiser DB] Saved ${i + 1}/${modules.length} nodes...`);
    }
  }

  await trackProgress({
    jobId,
    repositoryId: repoId,
    status: JOB_STATUS.RUNNING,
    message: `Saved ${modules.length} nodes. Calculating edges...`,
  });

  // 4. Prepare Edges
  console.log(`🧮 [Cruiser] Mapping edge relationships...`);

  const edgesToInsert = [];

  for (const mod of modules) {
    const sourceId = nodeDbIds.get(mod.source);

    if (!sourceId) continue;

    for (const dep of mod.dependencies) {
      const targetId = nodeDbIds.get(dep.resolved);

      if (!targetId) continue;

      edgesToInsert.push({
        repositoryId: repoId,
        sourceId,
        targetId,
        type: dep.dependencyTypes?.[0] || "import",
      });
    }
  }

  console.log(
    `💾 [Cruiser DB] Inserting ${edgesToInsert.length} Graph Edges in batches of ${EDGE_BATCH_SIZE}...`
  );

  await trackProgress({
    jobId,
    repositoryId: repoId,
    status: JOB_STATUS.RUNNING,
    message: `Saving ${edgesToInsert.length} edges in safe batches...`,
  });

  // 5. Insert Edges in Micro-Batches
  let insertedEdgesCount = 0;

  for (let i = 0; i < edgesToInsert.length; i += EDGE_BATCH_SIZE) {
    const batch = edgesToInsert.slice(i, i + EDGE_BATCH_SIZE);

    await prisma.graphEdge.createMany({
      data: batch,
      skipDuplicates: true,
    });

    insertedEdgesCount += batch.length;

    // Log progress every 1000 edges so we don't spam the console too much
    if (
      insertedEdgesCount % 1000 === 0 ||
      insertedEdgesCount === edgesToInsert.length
    ) {
      console.log(
        `⏳ [Cruiser DB] Saved batch: ${insertedEdgesCount}/${edgesToInsert.length} edges.`
      );
    }

    // Artificial delay to prevent connection pool exhaustion on Supabase free-tier
    if (i + EDGE_BATCH_SIZE < edgesToInsert.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log(`✅ [Cruiser DB] Graph generation and storage complete!`);
}
