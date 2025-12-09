"use client";

import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavItem {
  url: string;
  title: string;
  icon: LucideIcon;
}

const sidebarNav: SidebarNavItem[] = [
  {
    url: "/dashboard",
    title: "Dashboard",
    icon: Home,
  },
];

export function AppSidebar() {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const handleClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };
  return (
    <Sidebar className="border-0! bg-background!">
      <div className="bg-background">
        <Link href="/dashboard" onClick={handleClick}>
          <div className="flex items-center text-lg gap-2 p-2">
            <h1>{siteConfig.name}</h1>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto p-2 bg-background">
        {sidebarNav.map((item) => {
          const isActive = pathname === item.url;

          return (
            <Link key={item.url} href={item.url} onClick={handleClick}>
              <div
                className={`px-3 py-1 flex items-center gap-2 transition-all duration-300 rounded ${
                  isActive
                    ? "bg-muted/40 text-foreground"
                    : "text-muted-foreground hover:bg-muted/20"
                }`}
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-truncate">{item.title}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </Sidebar>
  );
}
