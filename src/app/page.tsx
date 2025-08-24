"use client";

import {
  motion,
  //  useScroll, useTransform
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Header from "@/components/Header";
import JobsSection from "@/components/home/JobsSection";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgres";
import FloatingParticles from "@/components/FloatingParticles";
import HeroSection from "@/components/HeroSection";
import TechStack from "@/components/TechStack";
import ContactSection from "@/components/home/ContactsSection";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  // const { scrollYProgress } = useScroll({
  //   target: containerRef,
  //   offset: ["start start", "end end"],
  // });

  // const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black overflow-hidden"
    >
      <LoadingScreen />
      <CustomCursor />
      <ScrollProgress />
      <Header />

      <motion.div
        className="fixed inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
        }}
      />

      <FloatingParticles />

      <motion.div
        // style={{ y: backgroundY }}
        className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 opacity-50"
      />

      <div className="relative z-10">
        <div id="home">
          <HeroSection />
        </div>
        <div id="tech">
          <TechStack />
        </div>
        <div id="jobs">
          <JobsSection />
        </div>
        <div id="contact">
          <ContactSection />
        </div>
      </div>

      <Footer />

      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </motion.button>
      </div>
    </div>
  );
}
