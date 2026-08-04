import { Button } from "@/components/ui/button";
import React, { useEffect, useRef } from "react";
import { useThemeContext } from "./theme-provider";

export const ThemeToggle = () => {
  const { theme, setTheme } = useThemeContext();

  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;

    console.log(`ThemeToggle Rendered: ${renderCount.current} times`);
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className="p-6 border rounded-xl flex flex-col items-center gap-4">
      <p className="text-foreground">
        Active Theme: <span className="font-semibold capitalize">{theme}</span>
      </p>

      <Button onClick={toggleTheme} variant="outline">
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </Button>
    </div>
  );
};
