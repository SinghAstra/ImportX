"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { slideFadeInVariantFromTopToBottom } from "@/lib/variants";
import { motion } from "framer-motion";
import { ZapIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Navbar = () => {
  const [scroll, setScroll] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 8) {
      setScroll(true);
    } else {
      setScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 inset-x-0 p-4 w-full z-9",
          scroll && "bg-background/40 backdrop-blur-md"
        )}
      >
        <motion.div
          variants={slideFadeInVariantFromTopToBottom}
          initial="hidden"
          whileInView="visible"
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg logo font-normal text-primary">
              {siteConfig.name}
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href={ROUTES.AUTH.SIGN_IN}
                className={buttonVariants({
                  size: "sm",
                  variant: "ghost",
                  className: "hover:bg-muted/20 transition-all duration-300",
                })}
              >
                Sign In
              </Link>
              <Link href={ROUTES.AUTH.SIGN_UP}>
                <Button size={"sm"}>
                  Get Started
                  <ZapIcon className="h-6 w-6 text-orange-500 fill-orange-500" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </header>
    </>
  );
};

export default Navbar;
