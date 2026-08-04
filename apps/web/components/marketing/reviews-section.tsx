"use client";

import MovingBorder from "@/components/component-x/moving-border";
import MagicCard from "@/components/ui/magic-card";
import { siteConfig } from "@/config/site";
import { reviews } from "@/lib/constants";
import { slideFadeInVariantFromBottomToTop } from "@/lib/variants";
import { motion } from "framer-motion";
import { StarIcon } from "lucide-react";

const ReviewsSection = () => {
  return (
    <div className="max-w-300 mx-auto w-full">
      <motion.div
        variants={slideFadeInVariantFromBottomToTop}
        initial="hidden"
        whileInView="visible"
      >
        <div className="flex flex-col items-center lg:items-center justify-center w-full py-8 max-w-xl mx-auto gap-4">
          <MovingBorder className="rounded">
            <div className="w-full h-full group transition-all duration-300 ease-in-out active:scale-[0.98]">
              <div className="w-full rounded flex items-center justify-center px-4 py-2 hover:bg-muted/20 transition-all duration-300 ease-in-out">
                <h3 className="text-foreground text-xs font-medium uppercase tracking-wider">
                  Our Customers
                </h3>
              </div>
            </div>
          </MovingBorder>
          <h2 className="text-center lg:text-center text-3xl md:text-5xl leading-[1.1] font-medium font-heading text-foreground tracking-tight mt-4">
            What our users are saying
          </h2>
          <p className="text-center lg:text-center text-lg tracking-normal leading-relaxed text-muted-foreground max-w-lg">
            Here&apos;s what some of our users have to say about{" "}
            {siteConfig.name}.
          </p>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-10">
        {reviews.map((review, index) => (
          <motion.div
            variants={slideFadeInVariantFromBottomToTop}
            initial="hidden"
            whileInView="visible"
            className="row-span-1"
            key={index}
          >
            <MagicCard className="flex flex-col justify-between p-6 border border-border rounded-lg transition-all duration-300 ease-in-out hover:shadow-md  active:scale-[0.98] h-full">
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-medium text-muted-foreground tracking-tight">
                  {review.name}
                </h4>
                <p className="text-muted-foreground pb-4 tracking-normal leading-relaxed">
                  {review.review}
                </p>
              </div>

              <div className="w-full flex flex-row gap-1">
                {Array.from({ length: review.rating }, (_, i) => (
                  <StarIcon
                    key={i}
                    className="size-4 fill-yellow-500 text-yellow-500"
                    strokeWidth={2}
                  />
                ))}
              </div>
            </MagicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
