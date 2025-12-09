"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import { Coins, LogOut, Menu, Plus, UserIcon } from "lucide-react";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface ProtectedNavbarProps {
  user: User;
}

function ProtectedNavbar({ user }: ProtectedNavbarProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="p-2 flex items-center justify-end">
      <div className="flex gap-4 items-center transition-all duration-200 lg:hidden">
        <Button size={"sm"} variant={"outline"} onClick={toggleSidebar}>
          <Menu />
        </Button>
        <Link href={"/dashboard"}>
          <h2 className="text-lg">{siteConfig.name}</h2>
        </Link>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Button
          size={"sm"}
          className="flex items-center gap-2 rounded bg-muted/50 hover:bg-muted/30 text-foreground transition-all duration-300 border"
        >
          <Coins className="w-4 h-4" />
          <span className="text-sm font-medium">Item 1</span>
        </Button>

        <Button
          size={"sm"}
          className="flex items-center gap-2 rounded bg-muted/50 hover:bg-muted/30 text-foreground transition-all duration-300 border"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:block">Item 2</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 cursor-pointer w-8 border">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border mt-2">
            <DropdownMenuItem className="text-foreground cursor-pointer hover:bg-background transition-all duration-300">
              <UserIcon className="mr-1 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className=" cursor-pointer hover:bg-background transition-all duration-300"
            >
              <LogOut className="mr-1 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default ProtectedNavbar;
