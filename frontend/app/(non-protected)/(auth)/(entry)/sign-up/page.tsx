"use client";

import { CustomInput } from "@/components/reusable/custom-input";
import { PasswordStrengthCheck } from "@/components/reusable/password-strength-check";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logError } from "@/lib/log-error";
import { ROUTES } from "@/lib/routes";
import { GoogleLogo } from "@/lib/svg";
import { SignUpFormValues, signUpSchema } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AuthNavbar from "../../components/auth-navbar";

function SignUpPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [mailSent, setMailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: SignUpFormValues) => {
    const performSignUp = async () => {
      // 1. Post data to the dedicated register endpoint using Fetch
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // 2. Parse the JSON response
      const responseData = await response.json();
      const message = responseData?.message || "An unknown error occurred.";

      if (!response.ok) {
        // 3. Manual Error Handling
        throw new Error(message);
      }

      // 4. Successful registration flow
      setMailSent(true);
      // The successful 'message' from the API will be returned
      return message;
    };

    const promise = performSignUp();

    toast.promise(promise, {
      loading: "Creating your account...",
      success: (message) => `${message}`,
      error: (err) => `${err.message}`,
    });

    await promise;
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google", {
        redirect: true,
      });
    } catch (error) {
      logError(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 bg-muted/30 max-w-lg w-full overflow-y-auto ">
      <AuthNavbar />

      <div className="flex flex-col gap-6 sm:px-8 my-auto">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl lg:text-4xl">Get started</h1>
          <p className="text-sm text-muted-foreground pt-0.5">
            Create a new account
          </p>
        </div>

        <Button
          className="w-full rounded tracking-wide relative cursor-pointer"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Wait ...
            </>
          ) : (
            <>
              <GoogleLogo className="mr-2" />
              <span className="text-center tracking-wide">
                Continue with Google
              </span>
            </>
          )}
        </Button>

        <div className="relative flex gap-1">
          <span className="flex-1 flex items-center">
            <Separator />
          </span>
          <span className="text-foreground text-xs px-2">Or</span>
          <span className="flex-1 flex items-center">
            <Separator />
          </span>
        </div>

        {mailSent ? (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-600">
            <div className="bg-card border rounded p-6 flex gap-4 items-start shadow-sm">
              <div className="bg-primary/10 p-2 rounded-md shrink-0">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Check your email to confirm
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We&apos;ve sent a confirmation link to{" "}
                  <strong>{watch("email")}</strong>. Please check your inbox to
                  confirm your account before signing in. The confirmation link
                  expires in 10 minutes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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

            <div>
              <CustomInput
                label="Password"
                id="password"
                type="password"
                placeholder="••••••••"
                PrefixIcon={Lock}
                isPassword={true}
                {...register("password")}
                onFocus={() => setShowPasswordStrength(true)}
                error={errors.password?.message}
              />

              {showPasswordStrength && (
                <PasswordStrengthCheck password={passwordValue} />
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-300 rounded"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Wait ...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        )}

        <p className="text-muted-foreground text-sm text-center">
          Have an account ?{" "}
          <Link
            href={ROUTES.AUTH.SIGN_IN}
            className="border-b border-foreground hover:border-foreground/50 text-foreground hover:text-foreground/50 transition-all duration-300"
          >
            Sign In Now
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
