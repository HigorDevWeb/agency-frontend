"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { getInsideJobById } from "@/services/jobsService";
import ApplyModal from "@/components/ApplyModal";

import type { InsideCardJob } from "@/lib/getJobListing/getJobListingPage";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [job, setJob] = useState<InsideCardJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      if (!params.id) {
        setError("ID da vaga não fornecido");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const data = await getInsideJobById(Number(params.id));
        
        if (!data) {
          setError("Vaga não encontrada");
        } else {
          setJob(data);
        }
      } catch (err) {
        console.error("Erro ao buscar vaga:", err);
        setError("Erro ao carregar detalhes da vaga");
      } finally {
        setLoading(false);
      }
    }
    
    fetchJob();
  }, [params.id]);

  const handleApply = () => {
    setShowApplyModal(true);
  };

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando detalhes da vaga...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-400">
            {error || "Vaga não encontrada"}
          </h1>
          <p className="text-gray-400 mb-6">
            A vaga que você está procurando não foi encontrada ou não existe.
          </p>
          <button
            onClick={() => router.push("/jobs")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Voltar às Vagas
          </button>
        </div>
      </div>
    );
  }

  // Helpers para extrair dados da string "AboutCompany"
  const [size, founded, industry] = job.AboutCompany
    ? job.AboutCompany.replace("Sobre a Empresa", "")
      .split("\n")
      .filter(Boolean)
    : ["", "", ""];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                {job.JobTitle}
              </h1>
              <p className="text-xl text-gray-300 mb-4">{job.companyTitle}</p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={16} />
                  {job.jobInfo}
                </div>
                {/* Você pode separar info, exibir salário, tipo, etc, conforme estrutura do campo */}
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.jobStack?.split(" ").map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium text-center ${job.LevelLabel === "Senior"
                    ? "bg-red-500/20 text-red-400"
                    : job.LevelLabel === "Pleno"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
              >
                {job.LevelLabel}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                className="px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                {job.applyButton || "Candidatar-se"}
              </motion.button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-blue-400">
                Descrição
              </h3>
              <p className="text-gray-300 leading-relaxed">{job.JobDescription}</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-blue-400">
                Sobre a Empresa
              </h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  {size || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {founded ? founded : "N/A"}
                </div>
                <p className="text-sm text-gray-400">
                  {industry || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-green-400">
                Requisitos
              </h3>
              <ul className="space-y-2">
                {(job.jobRequirements?.split("\n").filter((line) => !!line) ?? []).map(
                  (req, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-300"
                    >
                      <span className="text-green-400 mt-1">•</span>
                      {req.replace(/^•\s?/, "")}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-purple-400">
                Benefícios
              </h3>
              <ul className="space-y-2">
                {(job.jobbenefits?.split("\n").filter((line) => !!line) ?? []).map(
                  (benefit, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-300"
                    >
                      <span className="text-purple-400 mt-1">•</span>
                      {benefit.replace(/^•\s?/, "")}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </motion.div>
        {showApplyModal && job && (
          <ApplyModal
            open={showApplyModal}
            onClose={handleCloseApplyModal}
            job={{
              id: job.id,
              title: job.JobTitle,
              ...Object.fromEntries(Object.entries(job))
            }}
          />
        )}
      </div>
  </div>
  );
}
