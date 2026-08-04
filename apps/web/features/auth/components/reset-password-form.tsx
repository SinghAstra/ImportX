"use client";

import { CustomInput } from "@/components/reusable/custom-input";
import { Button } from "@/components/ui/button";

import { ROUTES } from "@/lib/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordFormValues, resetPasswordSchema } from "@repo/shared";
import { KeyRound, Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { resetPasswordAction } from "../actions/reset-password";

export function ResetPasswordForm() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    const promise = resetPasswordAction({ ...values, token });

    await toast.promise(promise, {
      loading: "Please wait...",
      success: (result) => {
        if (!result.success) {
          throw new Error(result.error.message);
        }

        router.push(ROUTES.SIGN_IN);

        return result.data.message;
      },
      error: (err: Error) => err.message,
    });
  };

  if (!token) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card border border-border rounded-lg p-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-destructive/10 p-2 rounded-md">
            <KeyRound className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Invalid link</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This reset link is missing or malformed
            </p>
          </div>
        </div>
        <div className="h-px bg-border" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Please request a new password reset link from the forgot password
          page.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-5"
    >
      <input type="hidden" {...register("token")} value={token} />

      <CustomInput
        label="New password"
        id="password"
        placeholder="Minimum 8 characters"
        PrefixIcon={KeyRound}
        isPassword
        error={errors.password?.message}
        {...register("password")}
      />

      <CustomInput
        label="Confirm new password"
        id="confirmPassword"
        placeholder="Repeat your new password"
        PrefixIcon={KeyRound}
        isPassword
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader className="size-4 animate-spin mr-2" strokeWidth={2} />
            Wait ...
          </>
        ) : (
          "Reset password"
        )}
      </Button>
    </form>
  );
}
