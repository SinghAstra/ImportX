"use client";

import AuthNavbar from "@/features/auth/components/auth-navbar";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-8 p-4 bg-muted/30 max-w-lg w-full h-screen overflow-auto mx-auto">
      <AuthNavbar />
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-600 flex flex-col gap-6 sm:px-8 my-auto w-full">
        <SignInForm />
        <p className="text-muted-foreground text-sm text-center leading-relaxed">
          Don&apos;t have an account ?{" "}
          <Link
            href={ROUTES.SIGN_UP}
            className="text-foreground hover:text-foreground/70 transition-all duration-300 ease-in-out border-b border-foreground hover:border-foreground/50"
          >
            Sign Up Now
          </Link>
        </p>
      </div>
    </div>
  );
}
