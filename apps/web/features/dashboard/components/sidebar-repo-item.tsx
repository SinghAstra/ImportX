"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { STATUS_BORDER_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { RepositoryStatus } from "@repo/shared";
import { GitFork, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface SidebarRepoItemProps {
  repo: {
    id: string;
    name: string;
    avatar?: string | null;
    status: RepositoryStatus;
  };
  isActive: boolean;
  isDeleting: boolean;
  targetUrl: string;
  onCloseMobile: () => void;
  onDelete: (id: string) => void;
  buttonStyles: string;
}

export function SidebarRepoItem({
  repo,
  isActive,
  isDeleting,
  targetUrl,
  onCloseMobile,
  onDelete,
  buttonStyles,
}: SidebarRepoItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.preventDefault();

    e.stopPropagation();

    onDelete(repo.id);

    setIsDialogOpen(false);
  };

  return (
    <SidebarMenuItem className="group relative flex items-center w-full">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(buttonStyles, "w-full pr-10")}
      >
        <Link
          href={targetUrl}
          onClick={onCloseMobile}
          className="cursor-pointer flex items-center gap-2.5 w-full"
        >
          <Avatar className="h-6 w-6 shrink-0 transition-all">
            <AvatarImage
              src={repo.avatar || undefined}
              alt={`${repo.name} identity asset`}
              className={cn("object-cover", STATUS_BORDER_MAP[repo.status])}
            />
            <AvatarFallback className="rounded bg-background flex items-center justify-center text-muted-foreground">
              <GitFork className="size-3 text-muted-foreground/60" />
            </AvatarFallback>
          </Avatar>

          <span className="truncate text-sm font-medium tracking-tight">
            {repo.name}
          </span>
        </Link>
      </SidebarMenuButton>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <button
            className="opacity-0 group-hover/menu-item:opacity-100 p-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-destructive transition-all duration-150 ease-in-out scale-95 group-hover/menu-item:scale-100 focus:opacity-100 cursor-pointer outline-none animate-in fade-in slide-in-from-right-1"
            onClick={(e) => {
              e.preventDefault();

              e.stopPropagation();

              setIsDialogOpen(true);
            }}
            disabled={isDeleting}
            aria-label="Delete repository"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              <span className="font-semibold text-foreground">{repo.name}</span>{" "}
              repository and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-2">
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();

                e.stopPropagation();

                setIsDialogOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Repository
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  );
}
