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
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ArrowLeft, LogOut, Menu, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./logo";

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();

  const { data: session } = useSession();

  const router = useRouter();

  const pathname = usePathname();

  const isRootDashboard = pathname === ROUTES.DASHBOARD;

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

  return (
    <header className="sticky top-0 z-40">
      <div className="p-2 px-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {!isRootDashboard && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className={cn(
                "hidden md:inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer rounded border hover:bg-muted/50 select-none"
              )}
            >
              <ArrowLeft className="size-4 animate-in fade-in duration-300" />
              <span className="text-xs">Back</span>
            </Button>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-secondary rounded-lg transition-colors md:hidden cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <Link
            href={ROUTES.DASHBOARD}
            className="flex items-center gap-2 md:hidden"
          >
            <div className="p-1.5 rounded-lg bg-background">
              <Logo size={20} className="text-foreground" />
            </div>
            <span className="text-sidebar-foreground">{siteConfig.name}</span>
          </Link>
        </div>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session?.user?.image || undefined}
                    alt={session?.user?.name || "User profile"}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                    {getUserInitials() || <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
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
