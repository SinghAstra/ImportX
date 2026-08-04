"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ReactNode, Suspense } from "react";
import LoadingFallback from "../ui/loading-fallback";
import { TooltipProvider } from "../ui/tooltip";
import { QueryProvider } from "./query-provider";

interface ProviderProps {
  children: ReactNode;
}

export function Providers({ children }: ProviderProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SidebarProvider>
        <QueryProvider>
          <TooltipProvider>
            <SessionProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </SessionProvider>

            {process.env.NODE_ENV === "development" && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </TooltipProvider>
        </QueryProvider>
      </SidebarProvider>
    </Suspense>
  );
}
