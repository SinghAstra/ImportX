"use client";

import LampBackground from "@/components/component-x/lamp-background";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { slideFadeInVariantFromBottomToTop } from "@/lib/variants";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

const CtaSection = () => {
  return (
    <motion.div
      variants={slideFadeInVariantFromBottomToTop}
      initial="hidden"
      whileInView="visible"
      className="relative min-h-screen flex flex-col items-center justify-center max-w-300 mx-auto"
    >
      <LampBackground />
      <div className="flex flex-col items-center justify-center relative w-full text-center gap-6">
        <h2 className="text-center text-4xl md:text-7xl font-medium tracking-tight">
          Stop wrestling with messy codebases.
        </h2>
        <p className="text-muted-foreground text-lg tracking-normal leading-relaxed max-w-md mx-auto">
          Paste your GitHub link and let SummaryX build a clean, interactive map
          with clear AI summaries for every file. Start exploring faster today.
        </p>
        <div>
          <Link href={ROUTES.SIGN_UP}>
            <Button
              className="group cursor-pointer text-lg transition-all duration-300 ease-in-out active:scale-[0.98]"
              size={"lg"}
            >
              Get Started for free
              <ArrowRightIcon
                className="size-4 transition-all duration-300 ease-in-out group-hover:translate-x-1 cursor-pointer"
                strokeWidth={2}
              />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CtaSection;
