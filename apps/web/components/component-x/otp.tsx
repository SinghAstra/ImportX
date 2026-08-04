"use client";

import { cn } from "@/lib/utils";
import type React from "react";

import { createContext, useContext, useEffect, useRef, useState } from "react";

interface OTPContextType {
  values: string[];
  setValues: (values: string[]) => void;
  focusIndex: number;
  setFocusIndex: (index: number) => void;
}

const OTPContext = createContext<OTPContextType | undefined>(undefined);

export function OTPProvider({
  children,
  length = 6,
}: {
  children: React.ReactNode;
  length?: number;
}) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));

  const [focusIndex, setFocusIndex] = useState(0);

  return (
    <OTPContext.Provider
      value={{ values, setValues, focusIndex, setFocusIndex }}
    >
      {children}
    </OTPContext.Provider>
  );
}

export function useOTP() {
  const context = useContext(OTPContext);

  if (!context) {
    throw new Error("useOTP must be used within OTPProvider");
  }

  return context;
}

interface OTPGroupProps {
  className?: string;
}

export function OTPGroup({ className }: OTPGroupProps) {
  const { values } = useOTP();

  return (
    <div className={cn("flex gap-2 sm:gap-3", className)}>
      {values.map((_, index) => (
        <OTPInputBox key={index} index={index} />
      ))}
    </div>
  );
}

interface OTPInputBoxProps {
  index: number;
}

export function OTPInputBox({ index }: OTPInputBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { values, setValues, focusIndex, setFocusIndex } = useOTP();

  useEffect(() => {
    if (focusIndex === index && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focusIndex, index]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];

    newValues[index] = value;

    setValues(newValues);

    // Move to next input if digit entered
    if (value && index < values.length - 1) {
      setFocusIndex(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newValues = [...values];

      newValues[index] = "";

      setValues(newValues);

      // Move to previous input on backspace
      if (index > 0) {
        setFocusIndex(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      setFocusIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < values.length - 1) {
      setFocusIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData("text");

    const digits = pastedData
      .replace(/\D/g, "")
      .split("")
      .slice(0, values.length - index);

    const newValues = [...values];

    digits.forEach((digit, i) => {
      newValues[index + i] = digit;
    });

    setValues(newValues);

    // Focus last input or next empty input
    const nextEmptyIndex = newValues.findIndex((v, i) => i >= index && !v);

    if (nextEmptyIndex !== -1) {
      setFocusIndex(nextEmptyIndex);
    } else {
      setFocusIndex(Math.min(index + digits.length, values.length - 1));
    }
  };

  const handleClick = () => {
    setFocusIndex(index);
  };

  const isFocused = focusIndex === index;

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={values[index]}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onClick={handleClick}
      className={cn(
        "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16",
        "text-center text-lg sm:text-xl md:text-2xl font-semibold",
        "bg-background text-foreground",
        "border rounded-lg",
        "transition-all duration-300",
        "hover:border-primary",
        isFocused && "border-primary ring-2 ring-primary/20",
        "active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "touch-manipulation"
      )}
      aria-label={`OTP digit ${index + 1}`}
    />
  );
}
