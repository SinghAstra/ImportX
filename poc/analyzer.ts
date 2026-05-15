import { execSync } from "child_process";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { ImportDeclaration, Project } from "ts-morph";

// --- CONFIGURATION ---
const REPO_URL = "https://github.com/SinghAstra/Sample-FeatureX";
const WORKSPACE_DIR = path.join(process.cwd(), "tmp-workspace");

// --- PHASE 1: THE HANDS (Workspace & Validation) ---

async function prepareWorkspace() {
  if (fs.existsSync(WORKSPACE_DIR)) {
    console.log("✅ Cache found: Using existing tmp-workspace.");
  } else {
    console.log("🚀 Cloning repository...");
    execSync(`git clone --depth 1 ${REPO_URL} ${WORKSPACE_DIR}`, {
      stdio: "ignore",
    });
  }

  // Gatekeeper: Validate 70% TS/JS
  const allFiles = await glob("**/*", {
    cwd: WORKSPACE_DIR,
    nodir: true,
    ignore: ["node_modules/**", ".git/**"],
  });
  const codeFiles = allFiles.filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));

  const codeRatio = (codeFiles.length / allFiles.length) * 100;
  console.log(`📊 Repo Composition: ${codeRatio.toFixed(1)}% Code Files.`);

  if (codeRatio < 70) {
    console.error("❌ Validation Failed: Repo is not primarily TS/JS.");
    process.exit(1);
  }
}

// --- PHASE 2 & 3: THE BRAIN & DETECTIVE ---

function analyzeProject() {
  // 4. Initialize AST Project with the cloned tsconfig
  const project = new Project({
    tsConfigFilePath: path.join(WORKSPACE_DIR, "tsconfig.json"),
  });

  // 5. Target the Entry Point (The "Leaf")
  const targetPath = "src/app/dashboard/page.tsx";
  const sourceFile = project.getSourceFile(
    path.join(WORKSPACE_DIR, targetPath)
  );

  if (!sourceFile) {
    console.error(`❌ Could not find target file: ${targetPath}`);
    return;
  }

  console.log(`\n🔍 Analyzing: ${targetPath}`);
  console.log("--------------------------------------");

  // 6. Extract Import Declarations
  const imports = sourceFile.getImportDeclarations();

  imports.forEach((imp) => {
    const moduleSpecifier = imp.getModuleSpecifierValue(); // e.g. "@/lib/db"

    // 7, 8, & 9. The Path Detective (Resolution)
    // ts-morph's "getModuleSpecifierSourceFile" automatically handles
    // Alias Resolution and Relative Resolution for us!
    const resolvedFile = imp.getModuleSpecifierSourceFile();

    if (resolvedFile) {
      const absolutePath = resolvedFile.getFilePath();
      // Make it pretty by showing path relative to workspace
      const relativeToWorkspace = path.relative(WORKSPACE_DIR, absolutePath);

      console.log(`✅ Found: "${moduleSpecifier}"`);
      console.log(`   └─ Resolved to: ${relativeToWorkspace}`);
    } else {
      console.log(`⚠️ Broken Link: Could not resolve "${moduleSpecifier}"`);
    }
  });
}

// --- EXECUTION ---
async function main() {
  await prepareWorkspace();
  analyzeProject();
}

main();
