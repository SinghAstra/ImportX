"use client";

import { cn } from "@/lib/utils";
import { Circle, CircleCheck } from "lucide-react";

interface PasswordStrengthCheckProps {
  password?: string;
}

export const PasswordStrengthCheck = ({
  password = "",
}: PasswordStrengthCheckProps) => {
  const requirements = [
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
      label: "Special character (e.g. !?<>@#$%)",
      met: /[^A-Za-z0-9]/.test(password),
    },
    {
      label: "8 characters or more",
      met: password.length >= 8,
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-700 mb-8">
      <div className="space-y-1 ">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex text-sm items-center gap-2 text-muted-foreground/40 transition-all duration-300",
              req.met && "text-muted-foreground"
            )}
          >
            {req.met ? (
              <CircleCheck className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground/50" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
