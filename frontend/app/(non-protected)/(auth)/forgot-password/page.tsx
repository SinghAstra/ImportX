"use client";

import { OTPGroup, OTPProvider, useOTP } from "@/components/component-x/otp";
import { CustomInput } from "@/components/reusable/custom-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/routes";
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AuthNavbar from "../components/auth-navbar";

function OTPForm({ userEmail }: { userEmail: string }) {
  const { values } = useOTP();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const otpLength = values.filter((v) => v).length;
  const isOTPComplete = otpLength === 6;

  const onSubmitCode = async () => {
    setIsSubmitting(true);
    try {
      const performCodeVerification = async () => {
        const response = await fetch("/api/verify-reset-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            code: values.join(""),
          }),
        });

        const responseData = await response.json();
        const message = responseData?.message || "An unknown error occurred.";

        if (!response.ok) {
          throw new Error(message);
        }

        const resetTokenId = responseData.resetTokenId;

        if (!resetTokenId) {
          throw new Error("Security token missing. Please try again.");
        }

        router.push(`${ROUTES.AUTH.RESET_PASSWORD}?token=${resetTokenId}`);
        return message;
      };

      const promise = performCodeVerification();

      toast.promise(promise, {
        loading: "Verifying code...",
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
      onSubmit={(e) => {
        e.preventDefault();
        if (isOTPComplete) {
          onSubmitCode();
        }
      }}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-600"
    >
      <div className="bg-card border rounded p-4 flex gap-3 items-start shadow-sm">
        <div className="bg-primary/10 p-2 rounded-md shrink-0">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-foreground">
            Check your email
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We&apos;ve sent a reset code to <strong>{userEmail}</strong>. The
            code expires in 10 minutes.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Label htmlFor="code" className="text-foreground">
          Reset Code
        </Label>
        <div className="flex justify-center">
          <OTPGroup />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isOTPComplete || isSubmitting}
        className="w-full transition-all duration-300 cursor-pointer rounded"
      >
        {isSubmitting ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify code"
        )}
      </Button>
    </form>
  );
}

export default function ForgotPasswordPage() {
  const [codeSent, setCodeSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmitEmail = async (data: ForgotPasswordFormData) => {
    const performForgotPassword = async () => {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      const message = responseData?.message || "An unknown error occurred.";

      if (!response.ok) {
        throw new Error(message);
      }

      setUserEmail(data.email);
      setCodeSent(true);

      return message;
    };

    const promise = performForgotPassword();

    toast.promise(promise, {
      loading: "Sending reset code...",
      success: (message) => `${message}`,
      error: (err) => `${err.message}`,
    });

    await promise;
  };

  return (
    <div className="h-screen bg-background flex flex-col p-4 w-full overflow-y-auto">
      <AuthNavbar />
      <div className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-md">
          <div className="space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-foreground">
                {codeSent ? "Enter reset code" : "Forgot your password?"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {codeSent
                  ? "Enter the code we sent to your email"
                  : "Enter your email and we'll send you a code to reset the password"}
              </p>
            </div>

            {!codeSent ? (
              <form
                onSubmit={handleSubmit(onSubmitEmail)}
                className="space-y-6"
              >
                <CustomInput
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  PrefixIcon={Mail}
                  {...register("email")}
                  error={errors.email?.message}
                />

                <Separator />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full transition-all duration-300 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset code"
                  )}
                </Button>
              </form>
            ) : (
              <>
                <OTPProvider>
                  <OTPForm userEmail={userEmail} />
                </OTPProvider>
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={() => setCodeSent(false)}
                  className="w-full rounded text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-all duration-300"
                >
                  Change email
                </Button>
              </>
            )}

            <p className="text-muted-foreground text-sm text-center">
              Already have an account ?{" "}
              <Link
                href={ROUTES.AUTH.SIGN_IN}
                className="border-b border-foreground hover:border-foreground/50 text-foreground hover:text-foreground/50 transition-all duration-300"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
