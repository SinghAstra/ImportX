"use client";

import { containerVariant } from "@/lib/variants";
import { motion } from "framer-motion";
import CtaSection from "../../components/marketing/cta-section";
import FaqSection from "../../components/marketing/faq-section";
import Footer from "../../components/marketing/footer";
import HeroSection from "../../components/marketing/hero-section";
import Navbar from "../../components/marketing/navbar";
import ProcessSection from "../../components/marketing/process-section";
import ReviewsSection from "../../components/marketing/reviews-section";

const HomePage = () => {
  return (
    <div className="w-full">
      <Navbar />
      <motion.div
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        className="min-h-screen relative flex flex-col gap-16 px-4 md:px-6 lg:px-8"
      >
        <HeroSection />
        <ProcessSection />
        <ReviewsSection />
        <CtaSection />
        <FaqSection />
        <Footer />
      </motion.div>
    </div>
  );
};

export default HomePage;
