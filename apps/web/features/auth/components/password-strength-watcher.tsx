"use client";

import { cn } from "@/lib/utils";
import type { SignUpFormValues } from "@repo/shared";
import { Circle, CircleCheck } from "lucide-react";
import { useWatch, type Control } from "react-hook-form";

interface PasswordStrengthWatcherProps {
  control: Control<SignUpFormValues>;
}

export const PasswordStrengthWatcher = ({
  control,
}: PasswordStrengthWatcherProps) => {
  const password =
    useWatch({
      control,
      name: "password",
    }) ?? "";

  const requirements = [
    {
      label: "8 characters or more",
      met: password.length >= 8,
    },
    {
      label: "Uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "Number",
      met: /[0-9]/.test(password),
    },
    {
      label: "Special token (e.g. !@#$)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const rulesMetCount = requirements.filter((req) => req.met).length;

  const getProgressStyles = () => {
    if (rulesMetCount <= 2) return "bg-destructive";

    if (rulesMetCount <= 4) return "bg-amber-500";

    return "bg-green-400";
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3.5 pt-1.5">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          <span>Password Strength</span>
          <span
            className={cn(
              "transition-colors duration-200 font-semibold",
              rulesMetCount <= 2 && "text-destructive",
              rulesMetCount > 2 && rulesMetCount <= 4 && "text-amber-500",
              rulesMetCount === 5 && "text-green-400"
            )}
          >
            {rulesMetCount <= 2
              ? "Weak"
              : rulesMetCount <= 4
                ? "Medium"
                : "Strong"}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 w-full h-1 rounded-full bg-muted/60 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-full transition-all duration-300 rounded-xs",
                index < rulesMetCount
                  ? getProgressStyles()
                  : "bg-muted-foreground/15"
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-0.5">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex text-xs items-center gap-2 text-muted-foreground/40 transition-all duration-200",
              req.met && "text-green-400 font-medium"
            )}
          >
            {req.met ? (
              <CircleCheck
                className={cn(
                  "w-3.5 h-3.5 text-primary shrink-0 transition-transform duration-200 scale-105 font-medium",
                  req.met ? "text-green-400" : "text-foreground"
                )}
                strokeWidth={2.5}
              />
            ) : (
              <Circle
                className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0"
                strokeWidth={2}
              />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
