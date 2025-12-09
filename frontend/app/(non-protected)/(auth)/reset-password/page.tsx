"use client";

import { CustomInput } from "@/components/reusable/custom-input";
import { PasswordStrengthCheck } from "@/components/reusable/password-strength-check";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/routes";
import { ResetPasswordFormData, resetPasswordSchema } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AuthNavbar from "../components/auth-navbar";

function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
  });

  const passwordValue = watch("password");

  const onSubmitPassword = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const performPasswordReset = async () => {
        const response = await fetch("/api/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokenId: token,
            password: data.password,
          }),
        });

        const responseData = await response.json();
        const message = responseData?.message || "An unknown error occurred.";

        if (!response.ok) {
          throw new Error(message);
        }

        router.push(ROUTES.AUTH.SIGN_IN);
        return message;
      };

      const promise = performPasswordReset();

      toast.promise(promise, {
        loading: "Updating password...",
        success: (message) => `${message}`,
        error: (err) => `${err.message}`,
      });

      await promise;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitPassword)}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-600"
    >
      <div className="flex flex-col gap-0.5">
        <CustomInput
          label="New Password"
          id="password"
          type="password"
          placeholder="Enter your new password"
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

      <Separator />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full transition-all duration-300 cursor-pointer rounded"
      >
        {isSubmitting ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Resetting...
          </>
        ) : (
          "Set New Password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get("token");

    if (urlToken) {
      setToken(urlToken);

      // 2. Remove the token from the browser URL bar visually
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    } else {
      // 3. Only redirect if we effectively have NO token (neither in URL nor State)
      if (!token) {
        toast.error("Invalid session. Please restart.");
        router.replace(ROUTES.AUTH.FORGOT_PASSWORD);
      }
    }
  }, [searchParams, router, token]);

  if (token === null) {
    // Show a minimal loading state while checking the URL
    return (
      <div className="h-screen bg-background flex flex-col p-4 w-full overflow-y-auto">
        <AuthNavbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Show the main form if the token is present
  return (
    <div className="h-screen bg-background flex flex-col p-4 w-full overflow-y-auto">
      <AuthNavbar />
      <div className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-md">
          <div className="space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-foreground">
                Set New Password
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your new, strong password. This will immediately replace
                your old one.
              </p>
            </div>

            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
