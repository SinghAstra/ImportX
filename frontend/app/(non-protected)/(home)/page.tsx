"use client";
import LampBackground from "@/components/component-x/lamp-background";
import MaskedGridBackground from "@/components/component-x/masked-grid-background";
import MovingBorder from "@/components/component-x/moving-border";
import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import MagicCard from "@/components/ui/magic-card";
import { siteConfig } from "@/config/site";
import { FAQ, processSteps, reviews } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import {
  containerVariant,
  slideFadeInVariantFromBottomToTop,
} from "@/lib/variants";
import { motion } from "framer-motion";
import { ArrowRight, ArrowRightIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const HomePage = () => {
  return (
    <div className="w-full">
      <Navbar />
      <motion.div
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        className="min-h-screen relative flex flex-col gap-10 px-4 md:px-6 lg:px-8"
      >
        <div className="flex flex-col items-center justify-center w-full text-center min-h-screen relative">
          <MaskedGridBackground />
          <motion.div
            variants={slideFadeInVariantFromBottomToTop}
            initial="hidden"
            whileInView="visible"
            className="flex flex-col items-center justify-center w-full text-center "
          >
            <Link href={siteConfig.links.twitter} target="_blank">
              <MovingBorder className="rounded">
                <div className="w-full h-full bg-background group">
                  <div className="w-full rounded flex items-center justify-center px-4 py-1 hover:bg-muted/40 transition-all duration-300">
                    <h3 className="text-foreground">Connect on X</h3>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-all duration-300 text-muted-foreground" />
                  </div>
                </div>
              </MovingBorder>
            </Link>
            <h1 className="text-center py-6 text-5xl font-medium text-balance sm:text-6xl md:text-7xl lg:text-8xl leading-tight w-full">
              How are you ? <span className="opacity-50">Cool</span>
            </h1>
            <p className="mb-12 text-lg tracking-tight text-muted-foreground md:text-xl text-balance">
              This is the first line describing the web app
              <br className="hidden md:block" />
              <span className="hidden md:block">This is the second line.</span>
            </p>
            <Link href={ROUTES.AUTH.SIGN_IN}>
              <Button size={"lg"} className="text-lg">
                Get Started for free
                <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div>
          <motion.div
            variants={slideFadeInVariantFromBottomToTop}
            initial="hidden"
            whileInView="visible"
          >
            <div className="flex flex-col items-center lg:items-center justify-center w-full py-8 max-w-xl mx-auto">
              <MovingBorder className="rounded">
                <div className="w-full h-full bg-background group">
                  <div className="w-full rounded flex items-center justify-center px-4 py-1 hover:bg-muted/40 transition-all duration-300">
                    <h3 className="text-foreground">The Process</h3>
                  </div>
                </div>
              </MovingBorder>
              <h2 className="text-center text-3xl md:text-5xl font-medium mt-6">
                Entire Process in 3 steps
              </h2>
              <p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
                Follow these simple steps to perform action this is just another
                line
              </p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full py-8 gap-4 md:gap-6 ">
            {processSteps.map((process, id) => (
              <motion.div
                variants={slideFadeInVariantFromBottomToTop}
                initial="hidden"
                whileInView="visible"
                key={id}
              >
                <MagicCard>
                  <div className="flex flex-col items-start justify-center w-full">
                    <div className="flex items-center justify-between w-full">
                      <process.icon
                        strokeWidth={1.5}
                        className="w-10 h-10 text-foreground"
                      />
                      <span className="border-2 text-foreground font-medium text-2xl rounded-full w-12 h-12 flex items-center justify-center bg-background">
                        {id + 1}
                      </span>
                    </div>

                    <div className="flex flex-col items-start">
                      <h3 className="mt-6 font-medium text-foreground">
                        {process.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {process.description}
                      </p>
                    </div>
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <motion.div
            variants={slideFadeInVariantFromBottomToTop}
            initial="hidden"
            whileInView="visible"
          >
            <div className="flex flex-col items-center lg:items-center justify-center w-full py-8 max-w-xl mx-auto">
              <MovingBorder className="rounded">
                <div className="w-full h-full bg-background group">
                  <div className="w-full rounded flex items-center justify-center px-4 py-1 hover:bg-muted/40 transition-all duration-300">
                    <h3 className="text-foreground">Our Customers</h3>
                  </div>
                </div>
              </MovingBorder>
              <h2 className="text-center lg:text-center text-3xl md:text-5xl leading-[1.1] font-medium font-heading text-foreground mt-6">
                What our users are saying
              </h2>
              <p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
                Here&apos;s what some of our users have to say about{" "}
                {siteConfig.name}.
              </p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-10">
            {reviews.map((review, index) => (
              <motion.div
                variants={slideFadeInVariantFromBottomToTop}
                initial="hidden"
                whileInView="visible"
                className="row-span-1"
                key={index}
              >
                <MagicCard
                  key={index}
                  className="flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <h4 className="text-lg font-medium text-muted-foreground">
                      {review.name}
                    </h4>
                    <p>{review.username}</p>
                    <p className="text-muted-foreground pb-4">
                      {review.review}
                    </p>
                  </div>

                  <div className="w-full flex flex-row gap-1">
                    {Array.from({ length: review.rating }, (_, i) => (
                      <StarIcon
                        key={i}
                        className="w-4 h-4 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          variants={slideFadeInVariantFromBottomToTop}
          initial="hidden"
          whileInView="visible"
          className="relative min-h-screen flex flex-col items-center justify-center"
        >
          <LampBackground />
          <div className="flex flex-col items-center justify-center relative w-full text-center">
            <h2 className="text-center text-4xl md:text-7xl font-medium tracking-tight">
              Step into the future of Landing Pages
            </h2>
            <p className="text-muted-foreground text-lg mt-6 max-w-md mx-auto">
              Few Line explaining the saas. This is the first line. This is the
              second line. This is the third line.
            </p>
            <div className="mt-6">
              <Link href={ROUTES.AUTH.SIGN_IN}>
                <Button className="group cursor-pointer text-lg" size={"lg"}>
                  Get Started for free
                  <ArrowRightIcon className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1 cursor-pointer" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={slideFadeInVariantFromBottomToTop}
          initial="hidden"
          whileInView="visible"
          className="relative min-h-screen flex flex-col items-center justify-center gap-4 mb-20 px-4 sm:px-8 "
        >
          <div className="flex flex-col items-center justify-center w-full pt-12">
            <h2 className="mt-6 text-2xl font-semibold text-center lg:text-3xl xl:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="max-w-lg mt-6 text-center text-neutral-500">
              Here are some of the most common questions we get asked. If you
              have a question that isn&apos;t answered here, feel free to reach
              out to us.
            </p>
          </div>
          <div className="mx-auto w-full mt-20">
            <Accordion type="single" className="rounded" collapsible>
              {FAQ.map((faq) => (
                <AccordionItem
                  className="hover:bg-muted/20 px-4 transition-all duration-300"
                  key={faq.id}
                  value={faq.id}
                >
                  <AccordionTrigger className="text-xl font-normal cursor-pointer">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
        <Footer />
      </motion.div>
    </div>
  );
};

export default HomePage;
