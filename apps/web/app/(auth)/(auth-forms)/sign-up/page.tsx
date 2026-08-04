"use client";

import AuthNavbar from "@/features/auth/components/auth-navbar";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-8 p-4 bg-muted/30 max-w-lg w-full h-screen overflow-y-auto mx-auto">
      <AuthNavbar />

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-600 flex flex-col gap-8 sm:px-8 my-auto w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
            Get started
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Create a new account
          </p>
        </div>

        <SignUpForm />

        <p className="text-muted-foreground text-sm text-center leading-relaxed mt-2">
          Have an account?{" "}
          <Link
            href={ROUTES.SIGN_IN}
            className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors duration-200"
          >
            Sign In Now
          </Link>
        </p>
      </div>
    </div>
  );
}
