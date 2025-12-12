export const logger = {
  info: (message: string) => {
    console.log(`ℹ️  [INFO]    ${message}`);
  },

  success: (message: string) => {
    console.log(`✅ [SUCCESS] ${message}`);
  },

  error: (message: string, error?: any) => {
    console.error(`❌ [ERROR]   ${message}`);
    if (error) console.error(error);
  },

  warn: (message: string) => {
    console.warn(`⚠️  [WARN]    ${message}`);
  },

  route: (method: string, path: string) => {
    const icon = method === "GET" ? "🔍" : method === "POST" ? "📝" : "🗑️";
    console.log(`${icon} [${method}]  → ${path}`);
  },
};
