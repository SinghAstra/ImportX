"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { ZapIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const { scrollY } = useScroll();

  const [hasScrolled, setHasScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setHasScrolled(latest > 10);
  });

  return (
    <header
      className={cn(
        "sticky top-0 inset-x-0 p-4 w-full z-50 transition-all duration-300 ease-in-out border-b border-transparent",
        hasScrolled &&
          "bg-background/80 backdrop-blur-md border-border/40 shadow-sm"
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          href={ROUTES.HOME}
          className="text-lg font-medium tracking-tight text-primary"
        >
          {siteConfig.name}
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.SIGN_IN}
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
              className: "hover:bg-muted/40 active:scale-[0.98] transition-all",
            })}
          >
            Sign In
          </Link>
          <Link href={ROUTES.SIGN_UP}>
            <Button size="sm" className="active:scale-[0.98] transition-all">
              Get Started
              <ZapIcon className="size-4 text-orange-500 fill-orange-500 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
