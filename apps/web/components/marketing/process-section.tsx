"use client";

import MovingBorder from "@/components/component-x/moving-border";
import MagicCard from "@/components/ui/magic-card";
import { processSteps } from "@/lib/constants";
import { slideFadeInVariantFromBottomToTop } from "@/lib/variants";
import { motion } from "framer-motion";

const ProcessSection = () => {
  return (
    <div className="max-w-300 mx-auto w-full">
      <motion.div
        variants={slideFadeInVariantFromBottomToTop}
        initial="hidden"
        whileInView="visible"
      >
        <div className="flex flex-col items-center lg:items-center justify-center w-full py-8 max-w-xl mx-auto gap-4">
          <MovingBorder className="rounded">
            <div className="w-full h-full bg-background group transition-all duration-300 ease-in-out active:scale-[0.98]">
              <div className="w-full rounded flex items-center justify-center px-4 py-2 hover:bg-muted/20 transition-all duration-300 ease-in-out">
                <h3 className="text-foreground text-xs font-medium uppercase tracking-wider">
                  The Workflow
                </h3>
              </div>
            </div>
          </MovingBorder>

          <h2 className="text-center text-3xl md:text-5xl font-medium tracking-tight mt-4 text-balance">
            Codebase clarity in 3 simple steps
          </h2>

          <p className="text-center lg:text-center text-lg tracking-normal leading-relaxed text-muted-foreground max-w-lg text-balance">
            Drop a link, let our background workers handle the heavy lifting,
            and explore your code without the headache.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full py-8 gap-4">
        {processSteps.map((process, id) => (
          <motion.div
            variants={slideFadeInVariantFromBottomToTop}
            initial="hidden"
            whileInView="visible"
            key={id}
          >
            <MagicCard className="flex flex-col items-start justify-center w-full p-6 border border-border rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:border-foreground/20 active:scale-[0.98]">
              <div className="flex items-center justify-between w-full">
                <process.icon
                  strokeWidth={2}
                  className="size-8 text-foreground"
                />
                <span className="border-2 text-foreground font-medium text-2xl rounded-full w-12 h-12 flex items-center justify-center bg-background">
                  {id + 1}
                </span>
              </div>

              <div className="flex flex-col items-start gap-2 mt-6">
                <h3 className="font-medium text-foreground tracking-tight">
                  {process.title}
                </h3>
                <p className="text-sm tracking-normal leading-relaxed text-muted-foreground">
                  {process.description}
                </p>
              </div>
            </MagicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProcessSection;
