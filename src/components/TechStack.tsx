"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getTechStackSection } from "@/lib/tech-stack/getTechStackSection";

const techLogos = [
  { name: "React", icon: "⚛️", color: "from-blue-400 to-cyan-400" },
  { name: "Next.js", icon: "▲", color: "from-gray-700 to-gray-900" },
  { name: "Node.js", icon: "🟢", color: "from-green-400 to-green-600" },
  { name: "Python", icon: "🐍", color: "from-yellow-400 to-blue-500" },
  { name: "TypeScript", icon: "TS", color: "from-blue-500 to-blue-700" },
  { name: "Docker", icon: "🐳", color: "from-blue-400 to-blue-600" },
  { name: "AWS", icon: "☁️", color: "from-orange-400 to-yellow-500" },
  { name: "MongoDB", icon: "🍃", color: "from-green-500 to-green-700" },
];

export default function TechStack() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });
  const { language } = useLanguage();

  const [title, setTitle] = useState("Tech Stack");
  const [paragraph, setParagraph] = useState("Tecnologias mais demandadas no mercado");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTechStackSection(language);
        
        if (data) {
          setTitle(data.MainTitle || "Tech Stack");
          setParagraph(data.paragraphTech || "Tecnologias mais demandadas no mercado");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Tech Stack:", error);
      }
    }

    fetchData();
  }, [language]);

  return (
    <section ref={ref} className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {title}
        </h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-300 mb-12"
        >
          {paragraph}
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {techLogos.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={
                isInView
                  ? {
                    opacity: 1,
                    scale: 1,
                  }
                  : {
                    opacity: 0,
                    scale: 0,
                  }
              }
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.6 },
              }}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${tech.color} group cursor-pointer transform-gpu will-change-transform`}
            >
              <motion.div className="text-4xl mb-3" whileHover={{ scale: 1.2 }}>
                {tech.icon}
              </motion.div>

              <h3 className="text-white font-semibold text-lg group-hover:text-gray-100 transition-colors">
                {tech.name}
              </h3>

              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                whileHover={{ scale: 1.05 }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1 }}
          className="mt-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="inline-block p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-600" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
