"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import { Logo } from "@/features/dashboard/components/logo";
import { STATUS_BORDER_MAP } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  ChevronsUpDown,
  Disc3,
  ExternalLink,
  GitFork,
  LogOut,
  Menu,
  Share2,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useRepository } from "../hooks/use-repo";
import { useResyncRepository } from "../hooks/use-resync-repo";

interface RepoHeaderProps {
  onCopyDependencies: () => void;
  isCopyDisabled: boolean;
  isExpandedAll: boolean;
  onToggleExpandAll: () => void;
  isExpandDisabled: boolean;
}

export function RepoHeader({
  onCopyDependencies,
  isCopyDisabled,
  isExpandedAll,
  onToggleExpandAll,
  isExpandDisabled,
}: RepoHeaderProps) {
  const { toggleSidebar } = useSidebar();

  const { data: session } = useSession();

  const params = useParams();

  const repoIdValidation = z.string().safeParse(params?.id);

  const repositoryId = repoIdValidation.success ? repoIdValidation.data : null;

  const { data: repository } = useRepository(repositoryId ?? "");

  const { mutateAsync: triggerResync, isPending: isResyncPending } =
    useResyncRepository(repositoryId ?? "");

  const isRepoView = !!repositoryId && !!repository;

  const handleLogout = async () => {
    await signOut({ callbackUrl: ROUTES.SIGN_IN });
  };

  const getUserInitials = () => {
    if (!session?.user?.name) return null;

    return session.user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleResyncCode = () => {
    toast.promise(triggerResync(), {
      loading: "Starting Resync...",
      success: "Resync Started",
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md select-none shrink-0">
      <div className="p-2 px-3 flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-secondary rounded-lg transition-colors md:hidden cursor-pointer shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {isRepoView ? (
            <div className="flex items-center min-w-0 w-full">
              <a
                href={repository.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-w-0 group max-w-full"
              >
                <div className="flex items-center gap-2 px-2 py-1 min-w-0 border rounded bg-card/50 hover:bg-card/70 transition-colors">
                  <Avatar className="size-5 sm:size-6 rounded shrink-0">
                    <AvatarImage
                      src={repository.avatar}
                      alt={`${repository.name} logo`}
                      className={cn(
                        "object-cover",
                        STATUS_BORDER_MAP[repository.status]
                      )}
                    />
                    <AvatarFallback className="rounded bg-primary/10 text-primary border border-primary/10 flex items-center justify-center">
                      <GitFork className="size-3 text-primary" />
                    </AvatarFallback>
                  </Avatar>

                  <span className="font-mono text-xs sm:text-sm tracking-tight text-foreground truncate block">
                    {repository.owner} / {repository.name}
                  </span>
                  <ExternalLink className="size-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 hidden sm:block" />
                </div>
              </a>
            </div>
          ) : (
            <Link
              href={ROUTES.DASHBOARD}
              className="flex items-center gap-2 md:hidden min-w-0 shrink-0"
            >
              <div className="p-1.5 rounded-lg bg-background shrink-0">
                <Logo size={20} className="text-foreground" />
              </div>
              <span className="text-sidebar-foreground font-medium text-sm tracking-tight truncate hidden sm:block">
                {siteConfig.name}
              </span>
            </Link>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isRepoView && (
            <div className="flex items-center gap-1 sm:gap-1.5 animate-in fade-in duration-300">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isResyncPending}
                onClick={handleResyncCode}
                title={
                  isResyncPending ? "Syncing Workspace..." : "Resync Codebase"
                }
                aria-label="Resync Codebase"
                className="rounded-full text-muted-foreground hover:text-foreground border bg-card/50 hover:bg-card/70 size-7 sm:size-8 transition-all duration-200"
              >
                <Disc3
                  className={cn(
                    "size-3.5 transition-transform duration-500",
                    isResyncPending && "animate-spin"
                  )}
                />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isCopyDisabled}
                onClick={onCopyDependencies}
                title="Copy Dependency Tree"
                aria-label="Copy Dependency Tree"
                className="rounded-full text-muted-foreground hover:text-foreground border bg-card/50 hover:bg-card/70 size-7 sm:size-8 disabled:opacity-40"
              >
                <Share2 className="size-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isExpandDisabled}
                onClick={onToggleExpandAll}
                title={isExpandedAll ? "Collapse All" : "Expand All"}
                aria-label={isExpandedAll ? "Collapse All" : "Expand All"}
                className={cn(
                  "rounded-full text-muted-foreground hover:text-foreground transition-colors border bg-card/50 hover:bg-card/70 size-7 sm:size-8 disabled:opacity-40",
                  isExpandedAll && "bg-secondary text-primary border-primary/20"
                )}
              >
                <ChevronsUpDown
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isExpandedAll && "rotate-180 text-primary"
                  )}
                />
              </Button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer shrink-0 ml-0.5 sm:ml-1"
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage
                    src={session?.user?.image || undefined}
                    alt={session?.user?.name || "User profile"}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                    {getUserInitials() || (
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {session?.user?.name || "User Account"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {session?.user?.email || "No email available"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
