export const ROUTES = {
  HOME: "/",
  AUTH: {
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },
  DASHBOARD: {
    HOME: "/dashboard",
    SETTINGS: "/dashboard/settings",
  },
} as const;
