import { authApi } from "@/features/auth/api/auth-api";
import { GoogleProfile } from "@/types/google-profile";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { ROUTES } from "./routes";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Google Credentials are required.");
}

if (!NEXTAUTH_SECRET) {
  throw new Error("Next Auth Credentials are required.");
}

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: ROUTES.SIGN_IN,
    error: ROUTES.SIGN_IN,
  },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password.");
        }

        const response = await authApi.signIn({
          email: credentials.email,
          password: credentials.password,
        });

        if (!response.success) {
          throw new Error(response.error.message);
        }

        const { user, accessToken } = response.data;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account && user) {
        if (account.provider === "credentials") {
          token.accessToken = user.accessToken;

          token.id = user.id;
        }

        if (account.provider === "google" && profile) {
          const res = await authApi.googleLogin({
            email: profile.email!,
            name: profile.name,
            image: (profile as GoogleProfile).picture,
          });

          if (!res.success) {
            throw new Error(res.error.message);
          }

          token.accessToken = res.data.accessToken;

          token.id = res.data.user.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;

        session.user.id = token.id;
      }

      return session;
    },
  },
};
