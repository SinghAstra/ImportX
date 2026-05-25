import { execSync } from "child_process";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { Project } from "ts-morph";

const REPO_URL = "https://github.com/SinghAstra/Sample-FeatureX";
const WORKSPACE_DIR = path.join(process.cwd(), "tmp-workspace");

// check if the repo is downloaded or not
// if not then download it
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

// Check if majority of files are of Javascript / Typescript
async function validateRepository() {
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
}

function parseTargetFile() {
  const project = new Project();

  const targetPath = path.join(WORKSPACE_DIR, "app/dashboard/page.tsx");

  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Target file not found at: ${targetPath}`);
    return;
  }

  console.log(`\n🌳 Loading AST Tree for: src/app/dashboard/page.tsx`);
  const sourceFile = project.addSourceFileAtPath(targetPath);

  const importDeclarations = sourceFile.getImportDeclarations();

  console.log(`📦 Found ${importDeclarations.length} raw import strings:`);
  console.log("--------------------------------------");

  importDeclarations.forEach((declaration) => {
    const moduleSpecifier = declaration.getModuleSpecifierValue();
    console.log(`   - ${moduleSpecifier}`);
  });
}

async function main() {
  ensureWorkspace();
  await validateRepository();
  parseTargetFile();
}

main();
