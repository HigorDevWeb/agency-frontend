"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgres";
import FloatingParticles from "@/components/FloatingParticles";
import DashboardAnalytics from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);

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
        className="fixed inset-0 opacity-20"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
        }}
      />

      <FloatingParticles />

      <motion.div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 opacity-40" />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-32 pb-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            {/* Header da página */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Dashboard
              </motion.h1>
              <motion.p
                className="text-xl text-gray-300 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Acompanhe suas métricas de carreira e oportunidades em tempo
                real
              </motion.p>
            </motion.div>

            {/* Container do Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 md:p-8 shadow-2xl"
            >
              <DashboardAnalytics />
            </motion.div>

            {/* Seção de navegação rápida */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-6 cursor-pointer group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Relatórios
                </h3>
                <p className="text-gray-300 text-sm">
                  Visualize relatórios detalhados de suas candidaturas
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-green-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6 cursor-pointer group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Metas</h3>
                <p className="text-gray-300 text-sm">
                  Defina e acompanhe suas metas de carreira
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-orange-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl border border-orange-500/30 p-6 cursor-pointer group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  📈
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Análises</h3>
                <p className="text-gray-300 text-sm">
                  Insights avançados sobre seu desempenho
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <Footer />

      {/* Botão de voltar ao topo */}
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
