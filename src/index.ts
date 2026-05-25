import { execSync } from "child_process";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { Project, SourceFile } from "ts-morph";

const REPO_URL = "https://github.com/SinghAstra/Sample-FeatureX";
const WORKSPACE_DIR = path.join(process.cwd(), "tmp-workspace");

const dependencyGraph: Record<string, string[]> = {};
const circularCycles: string[][] = [];
const fullyProcessed = new Set<string>();
const learningCurriculum: string[] = [];

const fileExportMaps: Record<string, Record<string, string>> = {};
const dependencyCommunities: Record<string, string[]> = {};

const CONFIG_NOISE_BLACKLIST = [
  "next.config.ts",
  "next.config.js",
  "tailwind.config.ts",
  "tailwind.config.js",
  "postcss.config.js",
  "vite.config.ts",
];

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

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

  const codeFiles = allFiles.filter((file) => {
    const normalizedFile = normalizePath(file);
    const hasValidExtension = /\.(ts|tsx|js|jsx)$/.test(normalizedFile);
    const isConfigNoise = CONFIG_NOISE_BLACKLIST.includes(normalizedFile);
    return hasValidExtension && !isConfigNoise;
  });

  const codeRatio = (codeFiles.length / allFiles.length) * 100;
  console.log(
    `📊 Repo Composition: ${codeRatio.toFixed(1)}% Application Code Files.`
  );

  if (codeRatio < 50) {
    console.error("❌ Validation Failed: Repo is not primarily TS/JS.");
    process.exit(1);
  }
  return codeFiles;
}

function buildGlobalExportMaps(codeFiles: string[], project: Project) {
  codeFiles.forEach((file) => {
    const absolutePath = path.join(WORKSPACE_DIR, file);
    const normalizedFile = normalizePath(file);

    fileExportMaps[normalizedFile] = {};
    if (!fs.existsSync(absolutePath)) return;

    const sourceFile = project.addSourceFileAtPath(absolutePath);
    const currentMap = fileExportMaps[normalizedFile];
    if (!currentMap) return;

    sourceFile.getClasses().forEach((c) => {
      if (c.isExported()) {
        const name = c.getName();
        if (name) currentMap[name] = normalizedFile;
      }
    });

    sourceFile.getFunctions().forEach((f) => {
      if (f.isExported()) {
        const name = f.getName();
        if (name) currentMap[name] = normalizedFile;
      }
    });

    sourceFile.getVariableDeclarations().forEach((v) => {
      if (v.getVariableStatement()?.isExported()) {
        currentMap[v.getName()] = normalizedFile;
      }
    });

    sourceFile.getExportDeclarations().forEach((ed) => {
      const specifierSource = ed.getModuleSpecifierSourceFile();
      if (specifierSource) {
        const targetRelative = normalizePath(
          path.relative(WORKSPACE_DIR, specifierSource.getFilePath())
        );
        ed.getNamedExports().forEach((ne) => {
          currentMap[ne.getName()] = targetRelative;
        });
      }
    });
  });

  const visitedWildcards = new Set<string>();

  function resolveWildcards(normalizedFile: string) {
    if (visitedWildcards.has(normalizedFile)) return;
    visitedWildcards.add(normalizedFile);

    const absolutePath = path.join(WORKSPACE_DIR, normalizedFile);
    const sourceFile = project.getSourceFile(absolutePath);
    if (!sourceFile) return;

    const currentMap = fileExportMaps[normalizedFile];
    if (!currentMap) return;

    sourceFile.getExportDeclarations().forEach((ed) => {
      if (!ed.hasNamedExports() && !ed.isTypeOnly()) {
        const specifierSource = ed.getModuleSpecifierSourceFile();
        if (specifierSource) {
          const targetRelative = normalizePath(
            path.relative(WORKSPACE_DIR, specifierSource.getFilePath())
          );

          resolveWildcards(targetRelative);

          const targetSymbols = fileExportMaps[targetRelative] || {};
          for (const [symbol, originFile] of Object.entries(targetSymbols)) {
            currentMap[symbol] = originFile;
          }
        }
      }
    });
  }

  codeFiles.forEach((file) => resolveWildcards(normalizePath(file)));
}

function parseRepositoryFiles(codeFiles: string[], project: Project) {
  codeFiles.forEach((file) => {
    const absolutePath = path.join(WORKSPACE_DIR, file);
    const normalizedParent = normalizePath(file);

    const sourceFile = project.getSourceFile(absolutePath);
    if (!sourceFile) return;

    const importDeclarations = sourceFile.getImportDeclarations();
    const uniqueDependencies = new Set<string>();

    importDeclarations.forEach((declaration) => {
      const resolvedFile = declaration.getModuleSpecifierSourceFile();
      if (!resolvedFile) return;

      const targetRelative = normalizePath(
        path.relative(WORKSPACE_DIR, resolvedFile.getFilePath())
      );
      const namedImports = declaration.getNamedImports();

      if (namedImports.length > 0) {
        namedImports.forEach((namedImport) => {
          const symbolName = namedImport.getName();
          const targetMap = fileExportMaps[targetRelative];
          const directOriginFile = targetMap
            ? targetMap[symbolName]
            : undefined;

          if (directOriginFile) {
            uniqueDependencies.add(directOriginFile);
          } else {
            uniqueDependencies.add(targetRelative);
          }
        });
      } else {
        uniqueDependencies.add(targetRelative);
      }
    });

    dependencyGraph[normalizedParent] = Array.from(uniqueDependencies);
  });
}

function clusterFilesByGraphDensity(codeFiles: string[]) {
  console.log("\n🧪 Starting Graph-First Community Clustering Execution...");
  console.log("=========================================================");

  const fileList = codeFiles.map((f) => normalizePath(f));
  const assignedCommunity: Record<string, string> = {};
  let communityCounter = 0;

  function calculateCouplingScore(fileA: string, fileB: string): number {
    let score = 0;
    const depsA = dependencyGraph[fileA] || [];
    const depsB = dependencyGraph[fileB] || [];

    if (depsA.includes(fileB) || depsB.includes(fileA)) {
      score += 3.0;
    }

    const sharedDeps = depsA.filter((d) => depsB.includes(d));
    score += sharedDeps.length * 1.5;

    if (path.dirname(fileA) === path.dirname(fileB)) {
      score += 0.5;
    }

    return score;
  }

  for (let i = 0; i < fileList.length; i++) {
    const fileA = fileList[i];
    if (!fileA) continue;

    if (!assignedCommunity[fileA]) {
      communityCounter++;
      const communityID = `provisional_community_${String(
        communityCounter
      ).padStart(2, "0")}`;
      assignedCommunity[fileA] = communityID;
      dependencyCommunities[communityID] = [fileA];
      console.log(
        `🌱 Created new base anchor [${communityID}] initialized with: ${fileA}`
      );
    }

    const currentCommunity = assignedCommunity[fileA];
    if (!currentCommunity) continue;

    for (let j = i + 1; j < fileList.length; j++) {
      const fileB = fileList[j];
      if (!fileB) continue;

      const couplingAffinity = calculateCouplingScore(fileA, fileB);

      if (couplingAffinity >= 2.0) {
        const existingCommunity = assignedCommunity[fileB];

        if (!existingCommunity) {
          assignedCommunity[fileB] = currentCommunity;
          dependencyCommunities[currentCommunity]?.push(fileB);
          console.log(
            `   ➕ Link found: Added ${fileB} to [${currentCommunity}] (Affinity Score: ${couplingAffinity})`
          );
        } else if (existingCommunity !== currentCommunity) {
          console.log(
            `   💥 Collision Detected! Strong affinity (${couplingAffinity}) between ${fileA} and ${fileB}`
          );
          console.log(
            `      Merging entire community [${existingCommunity}] into [${currentCommunity}]`
          );

          const filesToMerge = dependencyCommunities[existingCommunity] || [];
          filesToMerge.forEach((f) => {
            assignedCommunity[f] = currentCommunity;
            dependencyCommunities[currentCommunity]?.push(f);
            console.log(`         -> Relocated: ${f}`);
          });
          delete dependencyCommunities[existingCommunity];
        }
      }
    }
  }
  console.log("=========================================================");
  console.log("🏁 Graph Density Clustering Computation Complete.\n");
}

function printDependencyTree() {
  console.log("\n🌳 Visualized Dependency Graph (Symbol-Aware Precision):");
  console.log("=========================================================");

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

function printGraphCommunities() {
  console.log("\n🕸️ Discovered Dependency Communities:");
  console.log("=============================================");

  for (const [community, files] of Object.entries(dependencyCommunities)) {
    console.log(`🔮 ${community} (Graph Local Density Cluster)`);
    files.forEach((file) => {
      console.log(`   └── 📄 ${file}`);
    });
  }
}

function compileCurriculumAndDetectCycles(
  currentFile: string,
  currentPath: string[] = []
) {
  if (fullyProcessed.has(currentFile)) return;

  const pathIndex = currentPath.indexOf(currentFile);
  if (pathIndex !== -1) {
    const cyclePattern = [...currentPath.slice(pathIndex), currentFile];
    const cycleKey = cyclePattern.join(" -> ");

    const isDuplicate = circularCycles.some((c) => c.join(" -> ") === cycleKey);
    if (!isDuplicate) {
      circularCycles.push(cyclePattern);
    }
    return;
  }

  currentPath.push(currentFile);

  const children = dependencyGraph[currentFile] || [];
  children.forEach((child) => {
    compileCurriculumAndDetectCycles(child, currentPath);
  });

  currentPath.pop();
  fullyProcessed.add(currentFile);

  learningCurriculum.push(currentFile);
}

function printWallOfShame() {
  console.log("\n🚨 Wall of Shame: Circular Dependency Report:");
  console.log("==============================================");

  if (circularCycles.length === 0) {
    console.log(
      "✅ Clear Skies! Zero circular dependencies found in this project."
    );
    return;
  }

  console.log(`❌ Found ${circularCycles.length} structural violations:\n`);
  circularCycles.forEach((cycle, index) => {
    const visualChain = cycle.join(" ──> ");
    console.log(`   [Violation ${index + 1}]: ${visualChain}`);
  });
}

function printLearningCurriculum() {
  console.log("\n📚 Repo Teacher: Step-by-Step Learning Curriculum:");
  console.log("==================================================");

  if (learningCurriculum.length === 0) {
    console.log("📭 No code files found to generate a curriculum roadmap.");
    return;
  }

  console.log(
    "Follow this sequence to review the codebase from absolute foundations up to parent layouts:\n"
  );

  learningCurriculum.forEach((file, index) => {
    const stepNum = String(index + 1).padStart(2, "0");
    const childrenCount = dependencyGraph[file]?.length || 0;

    const description =
      childrenCount === 0
        ? "🟢 Foundation Module (Zero dependencies ── Read standalone!)"
        : `🟡 Composite Module (Consumes ${childrenCount} underlying dependencies)`;

    console.log(`   [Step ${stepNum}]: ${file}`);
    console.log(`            └── ${description}`);
  });
}

async function main() {
  ensureWorkspace();

  const project = new Project({
    tsConfigFilePath: path.join(WORKSPACE_DIR, "tsconfig.json"),
  });

  const codeFiles = await validateRepository();

  buildGlobalExportMaps(codeFiles, project);
  parseRepositoryFiles(codeFiles, project);

  clusterFilesByGraphDensity(codeFiles);

  printDependencyTree();
  calculateAndPrintGravity();
  printGraphCommunities();

  Object.keys(dependencyGraph).forEach((file) => {
    compileCurriculumAndDetectCycles(file, []);
  });

  printWallOfShame();
  printLearningCurriculum();
}

main();
