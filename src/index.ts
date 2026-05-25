import { execSync } from "child_process";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { Project } from "ts-morph";

const REPO_URL = "https://github.com/SinghAstra/Sample-FeatureX";
const WORKSPACE_DIR = path.join(process.cwd(), "tmp-workspace");

const dependencyGraph: Record<string, string[]> = {};

function ensureWorkspace() {
  if (fs.existsSync(WORKSPACE_DIR)) {
    console.log("✅ Cache found: Using existing tmp-workspace.");
  } else {
    console.log("🚀 Cloning repository...");
    execSync(`git clone --depth 1 ${REPO_URL} ${WORKSPACE_DIR}`, {
      stdio: "ignore",
    });
  }
}

async function validateRepository(): Promise<string[]> {
  const allFiles = await glob("**/*", {
    cwd: WORKSPACE_DIR,
    nodir: true,
    ignore: [
      "node_modules/**",
      ".git/**",
      "package-lock.json",
      "*.md",
      "public/**",
    ],
  });
  const codeFiles = allFiles.filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));

  const codeRatio = (codeFiles.length / allFiles.length) * 100;
  console.log(`📊 Repo Composition: ${codeRatio.toFixed(1)}% Code Files.`);

  if (codeRatio < 50) {
    console.error("❌ Validation Failed: Repo is not primarily TS/JS.");
    process.exit(1);
  }
  return codeFiles;
}

function parseRepositoryFiles(codeFiles: string[]) {
  const project = new Project({
    tsConfigFilePath: path.join(WORKSPACE_DIR, "tsconfig.json"),
  });

  codeFiles.forEach((file) => {
    const absolutePath = path.join(WORKSPACE_DIR, file);
    const normalizedParent = file.replace(/\\/g, "/");

    if (!fs.existsSync(absolutePath)) return;

    const sourceFile = project.addSourceFileAtPath(absolutePath);
    const importDeclarations = sourceFile.getImportDeclarations();
    const dependencies: string[] = [];

    importDeclarations.forEach((declaration) => {
      const resolvedFile = declaration.getModuleSpecifierSourceFile();

      if (resolvedFile) {
        const resolvedAbsolutePath = resolvedFile.getFilePath();
        const relativeToWorkspace = path
          .relative(WORKSPACE_DIR, resolvedAbsolutePath)
          .replace(/\\/g, "/");
        dependencies.push(relativeToWorkspace);
      }
    });

    dependencyGraph[normalizedParent] = dependencies;
  });
}

function printDependencyTree() {
  console.log("\n🌳 Visualized Dependency Graph:");
  console.log("================================");

  for (const [parent, children] of Object.entries(dependencyGraph)) {
    console.log(parent);
    children.forEach((child, index) => {
      const isLast = index === children.length - 1;
      const connector = isLast ? "└── " : "├── ";
      console.log(`${connector}${child}`);
    });
  }
}

function calculateAndPrintGravity() {
  console.log("\n🪐 Gravity Leaderboard (Inbound Dependencies):");
  console.log("==============================================");

  const gravityScores: Record<string, number> = {};

  Object.keys(dependencyGraph).forEach((file) => {
    gravityScores[file] = 0;
  });

  Object.values(dependencyGraph).forEach((dependencies) => {
    dependencies.forEach((child) => {
      if (gravityScores[child] !== undefined) {
        gravityScores[child]++;
      } else {
        gravityScores[child] = 1;
      }
    });
  });

  const sortedGravity = Object.entries(gravityScores).sort(
    (a, b) => b[1] - a[1]
  );

  sortedGravity.forEach(([file, score]) => {
    console.log(`🏆 ${file} ──> Score: ${score}`);
  });
}

function traverseDepthFirst(
  currentFile: string,
  visited: Set<string> = new Set(),
  depth: number = 0
) {
  const indent = "  ".repeat(depth);

  if (visited.has(currentFile)) {
    console.log(`${indent}🛑 Cycle/Repeated Node Avoided: ${currentFile}`);
    return;
  }

  console.log(`${indent}└── ${currentFile}`);
  visited.add(currentFile);

  const children = dependencyGraph[currentFile] || [];
  children.forEach((child) => {
    traverseDepthFirst(child, visited, depth + 1);
  });
}

async function main() {
  ensureWorkspace();
  const codeFiles = await validateRepository();
  parseRepositoryFiles(codeFiles);
  printDependencyTree();
  calculateAndPrintGravity();

  console.log("\n🚶 Deep Graph Traversal (DFS from Entry Point):");
  console.log("==============================================");
  const entryPoint = "app/dashboard/page.tsx";
  traverseDepthFirst(entryPoint);
}

main();
