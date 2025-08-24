"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, DollarSign } from "lucide-react";
import { filterJobs } from "@/services/jobsService";
import type { FrontCardJob } from "@/lib/getJobListing/getJobListingPage";

// Garantir que o filterJobs seja usado corretamente (async)
export default function AllJobsPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filteredJobs, setFilteredJobs] = useState<FrontCardJob[]>([]);
  const router = useRouter();

  const filters = ["all", "remote", "senior", "pleno", "junior", "fullstack"];

  // Sempre que o filtro mudar, buscar jobs dinamicamente da Strapi
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const jobs = await filterJobs(selectedFilter);
      if (isMounted) setFilteredJobs(jobs);
    })();
    return () => {
      isMounted = false;
    };
  }, [selectedFilter]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Voltar
        </motion.button>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Todas as Vagas
          </h1>
          <p className="text-xl text-gray-300">
            Encontre a oportunidade perfeita para você
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter(filter)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${selectedFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              animate={
                isInView
                  ? {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                  }
                  : {
                    opacity: 0,
                    y: 50,
                    rotateX: -15,
                  }
              }
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                type: "spring",
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
                rotateX: 5,
                transition: { duration: 0.3 },
              }}
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all duration-300 group cursor-pointer"
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
                  <MapPin size={16} />
                  <span>{job.jobType}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <DollarSign size={16} />
                  <span>{job.jobSalary}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={16} />
                  <span>{job.jobHours}</span>
                </div>
              </div>

              {/* Não existe job.description, então removi a linha do description */}

              <div className="flex flex-wrap gap-2 mb-4">
                {job.labelStack &&
                  job.labelStack
                    .split(" ")
                    .slice(0, 3)
                    .map((tech) => (
                      <motion.span
                        key={tech}
                        whileHover={{ scale: 1.1 }}
                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </motion.span>
                    ))}
                {job.labelStack && job.labelStack.split(" ").length > 3 && (
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
                  router.push(`/jobs/${job.id}`);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                {job.seeMoreButton || "Ver Detalhes"}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h3 className="text-2xl font-bold text-gray-400 mb-4">
              Nenhuma vaga encontrada
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros para encontrar mais oportunidades
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
