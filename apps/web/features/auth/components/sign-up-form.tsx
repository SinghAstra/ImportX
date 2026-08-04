"use client";

import { CustomInput } from "@/components/reusable/custom-input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpFormValues, signUpSchema } from "@repo/shared";
import { Check, Loader, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signUpAction } from "../actions/sign-up";
import ContinueWithGoogle from "./continue-with-google";
import { PasswordStrengthWatcher } from "./password-strength-watcher";

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [mailSent, setMailSent] = useState(false);

  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const onSubmit = async (data: SignUpFormValues) => {
    const promise = signUpAction(data);

    await toast.promise(promise, {
      loading: "Creating your account...",
      success: (result) => {
        if (!result.success) {
          throw new Error(result.error.message);
        }

        setMailSent(true);

        return result.data.message;
      },
      error: (err: Error) => err.message,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <ContinueWithGoogle />

      <div className="relative flex gap-4 items-center">
        <span className="h-px bg-border w-full flex-1" />
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Or
        </span>
        <span className="h-px bg-border w-full flex-1" />
      </div>

      {mailSent ? (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-600">
          <div className="bg-card border border-border rounded-lg p-6 flex gap-4 items-start shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-300 ease-in-out">
            <div className="bg-primary/10 p-2 rounded-md shrink-0">
              <Check className="size-4 text-primary" strokeWidth={2} />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground tracking-tight">
                Check your email to confirm
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We&apos;ve sent a confirmation link to{" "}
                <strong className="font-medium">{getValues("email")}</strong>.
                Please check your inbox to confirm your account before signing
                in. The confirmation link expires in 10 minutes.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 "
        >
          <CustomInput
            label="Email"
            id="email"
            type="email"
            placeholder="user@mail.com"
            required
            PrefixIcon={Mail}
            {...register("email")}
            error={errors.email?.message}
          />

          <div className="space-y-2">
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
              <PasswordStrengthWatcher control={control} />
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-300 ease-in-out rounded-lg active:scale-[0.98] py-2 px-3 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader className="size-4 animate-spin mr-2" strokeWidth={2} />
                Wait ...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
