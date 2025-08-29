"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllJobs } from "@/services/jobsService";
import type { FrontCardJob } from "@/lib/getJobListing/getJobListingPage";
import { useLanguage } from "@/context/LanguageContext";
import { getJobListingPage } from "@/lib/getJobListing/getJobListingPage";

export default function JobsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });
  const router = useRouter();
  const { language } = useLanguage();

  const [jobs, setJobs] = useState<FrontCardJob[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para os textos da seção
  const [sectionTexts, setSectionTexts] = useState({
    featuredJobs: 'Vagas em Destaque',
    opportunities: 'Oportunidades selecionadas para você',
    seeDetails: 'Ver Detalhes',
    seeAllJobs: 'Ver Todas as Vagas'
  });

  // Buscar textos localizados da API com base no idioma atual
  useEffect(() => {
    const fetchLocalizedTexts = async () => {
      try {
        const data = await getJobListingPage(language);
        
        if (data) {
          setSectionTexts({
            featuredJobs: data.featured_title || 'Vagas em Destaque',
            opportunities: data.featured_subtitle || 'Oportunidades selecionadas para você',
            seeDetails: data.frontCardJob?.[0]?.seeMoreButton || 'Ver Detalhes',
            seeAllJobs: data.seeAllJobsButton || 'Ver Todas as Vagas'
          });
        }
      } catch (error) {
        console.error('Erro ao buscar textos localizados:', error);
      }
    };
    
    fetchLocalizedTexts();
  }, [language]);

  // Busca somente as 3 primeiras vagas do backend!
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await getAllJobs(language);
      if (isMounted && data) {
        setJobs(data.slice(0, 3));
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [language]);

  return (
    <section ref={ref} className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            {sectionTexts.featuredJobs}
          </h2>
          <p className="text-xl text-gray-300">
            {sectionTexts.opportunities}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Skeleton loading para 3 cards
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 animate-pulse h-60"
              />
            ))
          ) : (
            jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 50 }}
                animate={
                  isInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 50 }
                }
                transition={{
                  delay: index * 0.2,
                  duration: 0.6,
                  type: "spring",
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                // SEMPRE usa o ID correto vindo do backend!
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all duration-300 group cursor-pointer transform-gpu will-change-transform"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {job.jobTitle}
                    </h3>
                    <p className="text-gray-400">{job.companyLabel}</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${job.labelType === "Senior"
                        ? "bg-red-500/20 text-red-400"
                        : job.labelType === "Pleno"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                  >
                    {job.labelType}
                  </motion.div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>📍</span>
                    <span>{job.jobType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>💰</span>
                    <span>{job.jobSalary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>⏰</span>
                    <span>{job.jobHours}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.labelStack &&
                    job.labelStack.split(" ").slice(0, 3).map((tech) => (
                      <motion.span
                        key={tech}
                        whileHover={{ scale: 1.1 }}
                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  {job.labelStack &&
                    job.labelStack.split(" ").length > 3 && (
                      <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-sm font-medium">
                        +{job.labelStack.split(" ").length - 3}
                      </span>
                    )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Também usa o ID correto do backend!
                    router.push(`/jobs/${job.id}`);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  {sectionTexts.seeDetails}
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
        <div className="text-center mt-12">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/jobs")}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold text-lg"
          >
            {sectionTexts.seeAllJobs}
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
