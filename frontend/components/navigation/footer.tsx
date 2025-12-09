"use client";

import { siteConfig } from "@/config/site";
import { fadeInVariant } from "@/lib/variants";
import { motion } from "framer-motion";
import Link from "next/link";
import BorderHoverLink from "../component-x/border-hover-link";

const Footer = () => {
  return (
    <footer className="flex flex-col relative items-center justify-center border-t w-full ">
      <div className="flex flex-col sm:flex-row gap-4 p-4 items-center justify-between w-full">
        <motion.div variants={fadeInVariant}>
          <span className=" text-muted-foreground flex gap-2 items-center tracking-wider">
            Made by{" "}
            <BorderHoverLink className="text-foreground tracking-wider pb-0.5">
              <Link target="_blank" href={siteConfig.links.github}>
                SinghAstra
              </Link>
            </BorderHoverLink>
          </span>
        </motion.div>
        <motion.div variants={fadeInVariant}>
          <BorderHoverLink className="text-foreground tracking-wider pb-0.5">
            <Link target="_blank" href={siteConfig.links.twitter}>
              Connect on X
            </Link>
          </BorderHoverLink>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
