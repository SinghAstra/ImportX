"use client";

import { CustomInput } from "@/components/reusable/custom-input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordFormValues, forgotPasswordSchema } from "@repo/shared";
import { Loader, Mail, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { forgotPasswordAction } from "../actions/forgot-password";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    const promise = forgotPasswordAction(values);

    await toast.promise(promise, {
      loading: "Please wait...",
      success: (result) => {
        if (!result.success) {
          throw new Error(result.error.message);
        }

        setSentEmail(values.email);

        setSent(true);

        return result.data.message;
      },
      error: (err: Error) => err.message,
    });
  };

  if (sent) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex flex-col gap-6">
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <SendHorizonal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Check your inbox
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                We sent a reset link to{" "}
                <span className="text-foreground">{sentEmail}</span>
              </p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <p className="text-sm text-muted-foreground leading-relaxed">
            Follow the link in your email to set a new password. The link
            expires in 15 minutes. Check your spam folder if you don&apos;t see
            it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-5"
    >
      <CustomInput
        label="Email address"
        id="email"
        type="email"
        placeholder="you@example.com"
        PrefixIcon={Mail}
        error={errors.email?.message}
        {...register("email")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader className="size-4 animate-spin mr-2" strokeWidth={2} />
            Wait ...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
