"use client";

import { CustomInput } from "@/components/reusable/custom-input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResendVerificationFormValues,
  resendVerificationSchema,
} from "@repo/shared";
import { Loader, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { resendVerificationAction } from "../actions/resend-verification";

export function ResendVerificationForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
  });

  const onSubmit = async (values: ResendVerificationFormValues) => {
    const promise = resendVerificationAction({ email: values.email });

    await toast.promise(promise, {
      loading: "Sending verification email...",
      success: (result) => {
        if (!result.success) {
          throw new Error(result.error.message);
        }

        setSent(true);

        return result.data.message;
      },
      error: (err: Error) => err.message,
    });
  };

  if (sent) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Check your inbox
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                We sent a new link to{" "}
                <span className="text-foreground">{getValues("email")}</span>
              </p>
            </div>
          </div>
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
          "Send new verification link"
        )}
      </Button>
    </form>
  );
}
