"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Matrix3D from "./Matrix3D";
import TypingEffect from "./TypingEffect";
import { getHeroSection, HeroButton } from "@/lib/hero-section/getHeroSection";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [hero, setHero] = useState<HeroButton | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Evita renderizar antes do client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Busca dados do Strapi
  useEffect(() => {
    let isMounted = true;

    const fetchHeroData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getHeroSection();
        
        if (isMounted && data?.heroButton?.length) {
          setHero(data.heroButton[0]);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Erro ao carregar HeroSection:", err);
          setError("Erro ao carregar dados");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (mounted) {
      fetchHeroData();
    }

    return () => {
      isMounted = false;
    };
  }, [mounted]); // Removida a dependência de t para evitar re-renders

  // Função para navegar para a seção de jobs
  const scrollToJobs = () => {
    const jobsSection = document.getElementById('jobs');
    if (jobsSection) {
      jobsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (!mounted || loading) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Matrix3D />
        </div>
        <div className="relative z-10 text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !hero) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Matrix3D />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-red-400">{t('common.error')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Matrix3D />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center max-w-4xl mx-auto px-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 flex items-center justify-center space-x-4"
        >
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            {hero.topTitle}
          </h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <span className="text-4xl md:text-6xl">⚡</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">
            {hero.lowerTitle}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <TypingEffect
            text={hero.paragraph}
            className="text-xl md:text-2xl text-gray-300"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToJobs}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold text-lg transition-all duration-300"
          >
            {t('hero.explore_jobs')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, borderColor: "#8b5cf6" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-gray-400 rounded-lg text-gray-300 font-semibold text-lg hover:text-white transition-all duration-300"
          >
            {t('hero.register_company')}
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}
