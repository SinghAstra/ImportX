"use client";

import { siteConfig } from "@/config/site";
import { blurInVariant, containerVariant } from "@/lib/variants";
import { motion } from "framer-motion";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";
import { ReactNode, Suspense } from "react";
import MaskedGridBackground from "../component-x/masked-grid-background";
import { SidebarProvider } from "../ui/sidebar";

interface ProviderProps {
  children: ReactNode;
}

const LoadingFallback = () => {
  return (
    <motion.div
      variants={containerVariant}
      className="min-h-screen flex flex-col gap-4 items-center text-center justify-center relative overflow-hidden px-4"
    >
      <div className="flex gap-4">
        <Image
          src={"/favicon.ico"}
          width={48}
          height={48}
          alt={siteConfig.name}
        />
        <motion.p className="text-5xl tracking-wide" variants={blurInVariant}>
          {siteConfig.name}
        </motion.p>
      </div>
      <motion.p
        className="text-xl tracking-wide text-muted-foreground"
        variants={blurInVariant}
      >
        {siteConfig.description}
      </motion.p>
      <MaskedGridBackground />
    </motion.div>
  );
};

const Providers = ({ children }: ProviderProps) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SidebarProvider>
        <SessionProvider>{children}</SessionProvider>
      </SidebarProvider>
    </Suspense>
  );
};

export default Providers;
