"use client";

import MaskedGridBackground from "@/components/component-x/masked-grid-background";
import MovingBorder from "@/components/component-x/moving-border";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/routes";
import { slideFadeInVariantFromBottomToTop } from "@/lib/variants";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center w-full text-center min-h-[calc(100vh-76px)] relative max-w-7xl mx-auto pt-4 select-none">
      <MaskedGridBackground />
      <motion.div
        variants={slideFadeInVariantFromBottomToTop}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center w-full text-center z-10 px-4"
      >
        <Link
          href={siteConfig.links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 block"
        >
          <MovingBorder className="rounded">
            <div className="bg-background group transition-all duration-300 ease-in-out active:scale-[0.98] rounded-full">
              <div className="rounded flex items-center justify-center gap-2 px-5 py-2 hover:bg-muted/10 transition-colors">
                <span className="text-foreground text-xs font-semibold uppercase tracking-widest">
                  Connect on X
                </span>
                <ArrowRight
                  className="size-3.5 group-hover:translate-x-1 transition-transform text-muted-foreground"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </MovingBorder>
        </Link>

        <h1 className="text-center py-4 text-5xl font-medium tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] text-balance max-w-5xl">
          Map any GitHub repo. <span className="opacity-40">In seconds.</span>
        </h1>

        <p className="mb-10 text-base tracking-normal leading-relaxed text-muted-foreground md:text-xl text-balance max-w-2xl">
          Instantly turn any messy repository into a clean, interactive map with
          clear, AI-powered summaries for every single file.
        </p>

        <Link href={ROUTES.SIGN_UP}>
          <Button className="text-lg font-medium group transition-all duration-300 ease-in-out active:scale-[0.96] rounded p-4 py-5 cursor-pointer">
            Get Started for free
            <ArrowRight
              className="size-4 ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
              strokeWidth={2}
            />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
