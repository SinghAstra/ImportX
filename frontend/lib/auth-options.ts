import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const NEXT_AUTH_SECRET = process.env.NEXT_AUTH_SECRET;

if (!NEXT_AUTH_SECRET) {
  throw new Error("NEXT_AUTH_SECRET must be provided.");
}

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.log("GOOGLE_CLIENT_ID is ", GOOGLE_CLIENT_ID);
  console.log("GOOGLE_CLIENT_SECRET is ", GOOGLE_CLIENT_SECRET);
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided");
}

export const authOptions: NextAuthOptions = {
  secret: NEXT_AUTH_SECRET,
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // 1. Verify Password
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // 2. CRITICAL: Check Email Verification
        if (!user.emailVerified) {
          // You can throw an error here, or handle it on the client
          throw new Error("Please verify your email first.");
        }

        return user;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
