export const ROUTES = {
  HOME: "/",
  SIGN_UP: "/sign-up",
  SIGN_IN: "/sign-in",
  DASHBOARD: "/dashboard",
  REPO: "/repo",
  FORGOT_PASSWORD: "/forgot-password",
} as const;

export type RouteValues = (typeof ROUTES)[keyof typeof ROUTES];

export const AUTH_ROUTES: string[] = [ROUTES.SIGN_IN, ROUTES.SIGN_UP];

export const PROTECTED_ROUTES: string[] = [ROUTES.DASHBOARD, ROUTES.REPO];
