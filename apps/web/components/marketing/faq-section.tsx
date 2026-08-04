"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/lib/constants";
import { slideFadeInVariantFromBottomToTop } from "@/lib/variants";
import { motion } from "framer-motion";

const FaqSection = () => {
  return (
    <motion.div
      variants={slideFadeInVariantFromBottomToTop}
      initial="hidden"
      whileInView="visible"
      className="relative min-h-screen flex flex-col items-center justify-center gap-8 mb-20 px-4 sm:px-8 max-w-300 mx-auto w-full"
    >
      <div className="flex flex-col items-center justify-center w-full pt-12 gap-4">
        <h2 className="text-2xl font-semibold text-center lg:text-3xl xl:text-4xl tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="max-w-lg text-center text-neutral-500 tracking-normal leading-relaxed">
          Here are some of the most common questions we get asked. If you have a
          question that isn&apos;t answered here, feel free to reach out to us.
        </p>
      </div>
      <Accordion
        type="single"
        className="rounded w-full mx-auto mt-20"
        collapsible
      >
        {FAQ.map((faq) => (
          <AccordionItem
            className="hover:bg-muted/20 px-4 transition-all duration-300 ease-in-out"
            key={faq.id}
            value={faq.id}
          >
            <AccordionTrigger className="text-xl font-normal cursor-pointer tracking-normal">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground tracking-normal leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
};

export default FaqSection;
