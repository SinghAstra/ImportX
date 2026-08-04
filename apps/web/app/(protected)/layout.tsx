import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { repoListQueryFn } from "@/features/repo/hooks/use-repos";
import { repoKeys } from "@/features/repo/query-keys";
import { QueryClient } from "@tanstack/react-query";
import React from "react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: repoKeys.lists(),
    queryFn: repoListQueryFn,
  });

  return (
    <div className="flex h-screen bg-background w-full">
      <DashboardSidebar />
      {children}
    </div>
  );
}
