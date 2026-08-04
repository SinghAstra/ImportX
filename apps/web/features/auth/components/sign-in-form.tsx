"use client";

import { CustomInput } from "@/components/reusable/custom-input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInFormValues, signInSchema } from "@repo/shared";
import { Loader, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ContinueWithGoogle from "./continue-with-google";

export function SignInForm() {
  const router = useRouter();

  const callbackUrl = ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    const promise = async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push(callbackUrl);

      return "Welcome back!";
    };

    await toast.promise(promise, {
      loading: "Verifying credentials...",
      success: (message: string) => `${message}`,
      error: (err: Error) => `${err.message}`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sign in to your account
        </p>
      </div>

      <ContinueWithGoogle />

      <div className="relative flex items-center gap-2">
        <span className="h-px bg-border w-full flex-1" />
        <span className="text-foreground/60 text-xs uppercase tracking-wider">
          Or
        </span>
        <span className="h-px bg-border w-full flex-1" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 "
      >
        <CustomInput
          label="Email"
          id="email"
          type="email"
          placeholder="attorney@firm.com"
          required
          PrefixIcon={Mail}
          {...register("email")}
          error={errors.email?.message}
        />

        <CustomInput
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          required
          PrefixIcon={Lock}
          isPassword={true}
          {...register("password")}
          error={errors.password?.message}
          rightLabel={
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out"
            >
              Forgot Password ?
            </Link>
          }
        />

        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? (
            <>
              <Loader className="size-4 animate-spin mr-2" />
              Wait...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
