"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff, LucideIcon } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  PrefixIcon?: LucideIcon;
  SuffixIcon?: LucideIcon;
  prefixText?: string;
  readonly?: boolean;
  isPassword?: boolean;
  onSuffixIconClick?: () => void;
  error?: string;
  rightLabel?: React.ReactNode;
}

export const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      id,
      type,
      placeholder,
      required,
      className,
      value,
      onChange,
      PrefixIcon,
      SuffixIcon,
      prefixText,
      readonly = false,
      isPassword = false,
      onSuffixIconClick,
      error,
      rightLabel,
      ...props
    },
    ref
  ) => {
    let inputType = type;
    let StateSuffixIcon = SuffixIcon;
    let clickHandler = onSuffixIconClick;
    const [showPassword, setShowPassword] = useState(false);

    if (isPassword) {
      inputType = showPassword ? "text" : "password";
      StateSuffixIcon = showPassword ? EyeOff : Eye;
      clickHandler = () => setShowPassword((prev) => !prev);
    }

    return (
      <div className={cn("space-y-2.5", className)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>
            {label} {required && <span className="text-primary">*</span>}
          </Label>

          {rightLabel && (
            <div className="text-sm text-muted-foreground">{rightLabel}</div>
          )}
        </div>

        <div
          className={cn(
            "flex w-full gap-2 overflow-hidden bg-accent border border-input rounded  transition-all duration-200",
            "hover:border-primary/50",
            "focus-within:border-primary",
            error &&
              "border-destructive focus-within:border-destructive hover:border-destructive",
            readonly && "opacity-50 cursor-not-allowed"
          )}
        >
          {(prefixText || PrefixIcon) && (
            <div
              className={cn(
                "flex items-center pl-3 pr-2 text-sm text-muted-foreground",
                prefixText && "border-r border-input",
                error && "text-destructive"
              )}
            >
              {PrefixIcon ? <PrefixIcon className="w-4 h-4" /> : prefixText}
            </div>
          )}
          <Input
            id={id}
            type={inputType}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent border-none focus-visible:ring-0 shadow-none",
              PrefixIcon || prefixText ? "rounded-l-none pl-0" : "pl-3",
              StateSuffixIcon ? "rounded-r-none pr-0" : "pr-3",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
            value={value}
            onChange={onChange}
            readOnly={readonly}
            {...props}
            ref={ref}
          />
          {StateSuffixIcon && (
            <div
              className={cn(
                "flex items-center pr-3 pl-2 text-muted-foreground",
                isPassword &&
                  "cursor-pointer hover:text-primary transition-colors",
                error && "text-destructive"
              )}
              onClick={clickHandler}
            >
              <StateSuffixIcon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="min-h-2">
          {error && (
            <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-400 text-right">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";
