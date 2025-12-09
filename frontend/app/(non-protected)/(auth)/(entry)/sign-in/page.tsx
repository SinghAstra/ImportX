"use client";

import { CustomInput } from "@/components/reusable/custom-input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/routes";
import { GoogleLogo } from "@/lib/svg";
import { SignInFormValues, signInSchema } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AuthNavbar from "../../components/auth-navbar";

function SignInPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const callbackUrl = ROUTES.DASHBOARD.HOME;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: SignInFormValues) => {
    const performLogin = async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid credentials");
      }

      router.push(callbackUrl);
      return "Welcome back!";
    };

    const promise = performLogin();

    toast.promise(promise, {
      loading: "Verifying credentials...",
      success: (message) => `${message}`,
      error: (err) => `${err.message}`,
    });

    await promise;
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check if there is a hash in the URL (e.g., #message=Success)
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1)); // Remove the '#'

      const errorDescription = params.get("error_description");
      const successMessage = params.get("message");

      console.log("errorDescription is ", errorDescription);
      console.log("successMessage is ", successMessage);

      // 2. Display Toast
      setTimeout(() => {
        if (errorDescription) {
          toast.error(decodeURIComponent(errorDescription));
        } else if (successMessage) {
          toast.success(decodeURIComponent(successMessage));
        }
      });

      // 3. Clear the URL hash so the toast doesn't show again on refresh
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="flex flex-col gap-8 p-4 bg-muted/30 max-w-lg w-full overflow-y-auto ">
      <AuthNavbar />
      <div className="flex flex-col gap-6 sm:px-8 my-auto">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl lg:text-4xl">Welcome back</h1>
          <p className="text-sm text-muted-foreground pt-0.5">
            Sign in to your account
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
                href={ROUTES.AUTH.FORGOT_PASSWORD}
                className="text-sm text-foreground/50 hover:text-foreground transition-all duration-300"
              >
                Forgot Password ?
              </Link>
            }
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-300 rounded"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Wait ...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="text-muted-foreground text-sm text-center">
          Don&apos;t have an account ?{" "}
          <Link
            href={ROUTES.AUTH.SIGN_UP}
            className="border-b border-foreground hover:border-foreground/50 text-foreground hover:text-foreground/50 transition-all duration-300"
          >
            Sign Up Now
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignInPage;
