"use client";

import { InputUserName } from "./input-user-name";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";
import { UserProvider } from "./user-provider";

const ContextPage = () => {
  return (
    <UserProvider>
      <ThemeProvider>
        <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300 flex flex-col items-center justify-center gap-8 p-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Context Sandbox</h1>
            <p className="text-muted-foreground">
              Check your console to see the render logs!
            </p>
          </div>

          <div className="w-full max-w-md space-y-6">
            <InputUserName />
            <ThemeToggle />
          </div>
        </div>
      </ThemeProvider>
    </UserProvider>
  );
};

export default ContextPage;
