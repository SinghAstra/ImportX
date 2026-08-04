export type FileCategory =
  | "CODE"
  | "CONFIG"
  | "TRANSLATION"
  | "DATASET"
  | "STATIC"
  | "IGNORED"
  | "TEST"
  | "MEDIA"
  | "OVERSIZED"
  | "MINIFIED"
  | "GENERATED"
  | "DATA";

export interface ClassificationResult {
  category: FileCategory;
  shouldSummarizeWithAI: boolean;
  staticSummary: string;
}

const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  "dist",
  ".next",
  "coverage",
  ".turbo",
  "build",
  ".cache",
  "vendor",
  "docs/generated",
];

const FILENAME_CONFIGS = [
  "package.json",
  "tsconfig.json",
  "tsconfig.base.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "vite.config.ts",
  "next.config.js",
  "next.config.ts",
  "tailwind.config.js",
  "postcss.config.js",
  "dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "eslint.config.js",
  "tsup.config.ts",
  "pyproject.toml",
  "requirements.txt",
  "setup.py",
  ".pylintrc",
  "cargo.toml",
  "go.mod",
  "composer.json",
  "phpstan.neon.dist",
  "phpunit.xml.dist",
  "gemfile",
  "rakefile",
  "mix.exs",
  ".formatter.exs",
  "build.gradle.kts",
  "settings.gradle.kts",
  "components.json",
  "audit-ci.jsonc",
  ".gitignore",
  ".npmrc",
  ".prettierrc",
  ".env.example",
  ".env.local",
  ".env.template",
];

const FILENAME_IGNORED = [
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "cargo.lock",
  "go.sum",
  "mix.lock",
  "gemfile.lock",
  "license",
  "license.md",
  "changelog.md",
  "favicon.ico",
  "robots.txt",
  "manifest.json",
];

const PATH_TRANSLATIONS = [
  "/intl/",
  "/locales/",
  "/translations/",
  "/i18n/",
  "/locale/",
];

const PATH_STATIC_ASSETS = [
  "assets/icons/",
  "public/images/",
  "assets/images/",
  "/sprites/",
];

const MEDIA_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".ico",
  ".woff",
  ".pdf",
  ".docx",
  ".xlsx",
  ".rtf",
  ".odt",
  ".jar",
];

export function classifyByPath(
  relativePath: string,
  fileName: string
): ClassificationResult {
  const normalizedPath = relativePath.toLowerCase().replace(/\\/g, "/");

  const normalizedName = fileName.toLowerCase();

  if (
    IGNORED_DIRECTORIES.some(
      (dir) =>
        normalizedPath.includes(`/${dir}/`) ||
        normalizedPath.startsWith(`${dir}/`)
    )
  ) {
    return {
      category: "IGNORED",
      shouldSummarizeWithAI: false,
      staticSummary:
        "This file is located in a system build, dependency, or cache directory and is excluded from automated mapping.",
    };
  }

  const isTestDir = /(?:^|\/)(?:__tests__|tests?|mocks?|e2e|unit)\//.test(
    normalizedPath
  );

  const isTestFile =
    /\.test\.(?:ts|js|tsx|jsx)$/.test(normalizedName) || // TS/JS
    /^test_.*\.py$/.test(normalizedName) || // Python
    /_test\.go$/.test(normalizedName) || // Go
    /_test\.rb$/.test(normalizedName) || // Ruby
    /test\.php$/.test(normalizedName) || // PHP
    /test\.java$/.test(normalizedName) || // Java
    /test_.*\.exs?$/.test(normalizedName); // Elixir

  if (isTestDir || isTestFile) {
    return {
      category: "TEST",
      shouldSummarizeWithAI: false,
      staticSummary: `Test suite or verification file for ${fileName}. Primary responsibility is to assert the correctness and stability of the corresponding application logic.`,
    };
  }

  if (
    FILENAME_IGNORED.includes(normalizedName) ||
    normalizedPath.includes(".pnpm-store/")
  ) {
    return {
      category: "IGNORED",
      shouldSummarizeWithAI: false,
      staticSummary: `Automated project manifest or metadata log (${fileName}) skipped to keep the workspace summary clear and concise.`,
    };
  }

  if (FILENAME_CONFIGS.includes(normalizedName)) {
    return {
      category: "CONFIG",
      shouldSummarizeWithAI: false,
      staticSummary: `Configuration settings profile managing dependencies, environments, or build compilation options for ${fileName}.`,
    };
  }

  if (normalizedName.endsWith(".ipynb")) {
    return {
      category: "DATASET",
      shouldSummarizeWithAI: false,
      staticSummary:
        "Jupyter Notebook file containing execution state, base64 outputs, and data exploration logic.",
    };
  }

  if (normalizedName.endsWith(".sql")) {
    return {
      category: "DATA",
      shouldSummarizeWithAI: false,
      staticSummary:
        "SQL file containing database schema definitions, queries, or data dumps.",
    };
  }

  if (normalizedName.endsWith(".http")) {
    return {
      category: "DATA",
      shouldSummarizeWithAI: false,
      staticSummary:
        "HTTP request definitions used for local API testing or REST client tooling.",
    };
  }

  if (PATH_TRANSLATIONS.some((pattern) => normalizedPath.includes(pattern))) {
    const localeMatch = fileName.match(/^([a-zA-Z]{2,3}([-_][a-zA-Z]{2,4})?)/);

    const localeName = localeMatch ? ` for the [${localeMatch[1]}] locale` : "";

    return {
      category: "TRANSLATION",
      shouldSummarizeWithAI: false,
      staticSummary: `Internationalization dictionary mapping localized text elements and semantic translation strings${localeName}.`,
    };
  }

  if (
    PATH_STATIC_ASSETS.some((pattern) => normalizedPath.includes(pattern)) ||
    MEDIA_EXTENSIONS.some((ext) => normalizedName.endsWith(ext))
  ) {
    return {
      category: "STATIC",
      shouldSummarizeWithAI: false,
      staticSummary:
        "Static graphic vector, icon asset group, or visual layout media resource used inside the user interface presentation layer.",
    };
  }

  if (
    normalizedPath.includes(".github/workflows/") ||
    normalizedPath.includes(".github/actions/")
  ) {
    return {
      category: "CONFIG",
      shouldSummarizeWithAI: false,
      staticSummary:
        "GitHub Actions workflow configuration. Primary responsibility is automating CI/CD pipelines and repository checks.",
    };
  }

  return {
    category: "CODE",
    shouldSummarizeWithAI: true,
    staticSummary: "",
  };
}

export function classifyByContent(
  fileName: string,
  content: string
): ClassificationResult {
  const normalizedName = fileName.toLowerCase();

  if (content.length > 50000) {
    return {
      category: "OVERSIZED",
      shouldSummarizeWithAI: false,
      staticSummary:
        "Large file exceeding summarization thresholds. Likely contains bundled code, extensive static datasets, or generated output.",
    };
  }

  const lines = content.split("\n");

  const averageLineLength = content.length / (lines.length || 1);

  if (averageLineLength > 300) {
    return {
      category: "MINIFIED",
      shouldSummarizeWithAI: false,
      staticSummary:
        "Minified, bundled, or heavily serialized data file. Not suitable for semantic summarization.",
    };
  }

  const generatedRegex = /@generated|auto-generated|do not edit|generated by/i;

  const header = content.slice(0, 500);

  if (generatedRegex.test(header)) {
    return {
      category: "GENERATED",
      shouldSummarizeWithAI: false,
      staticSummary:
        "Auto-generated file created by a build tool, ORM, or compiler. Should not be manually edited.",
    };
  }

  if (normalizedName.endsWith(".json")) {
    const trimmed = content.trim();

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const isSimpleDictionary =
        trimmed.length > 200 &&
        !trimmed.includes('"type":') &&
        !trimmed.includes('"id":');

      if (isSimpleDictionary) {
        return {
          category: "DATASET",
          shouldSummarizeWithAI: false,
          staticSummary:
            "Structured data lookup entity housing static records, structural system variables, or mapping schemas.",
        };
      }
    }
  }

  return {
    category: "CODE",
    shouldSummarizeWithAI: true,
    staticSummary: "",
  };
}
