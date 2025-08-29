"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { getInsideJobById, getJobListingPage } from "@/services/jobsService";
import ApplyModal from "@/components/ApplyModal";
import AuthModal from "@/components/auth/AuthModal";
import { useLanguage } from "@/context/LanguageContext";

import type { InsideCardJob, JobListingPage } from "@/lib/getJobListing/getJobListingPage";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [job, setJob] = useState<InsideCardJob | null>(null);
  const [pageData, setPageData] = useState<JobListingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">("login");
  const [pageTexts] = useState({
    loading: "Carregando detalhes da vaga...",
    jobNotFound: "Vaga não encontrada",
    jobNotFoundDesc: "A vaga que você está procurando não foi encontrada ou não existe.",
    backToJobs: "Voltar às Vagas",
    idNotProvided: "ID da vaga não fornecido",
    errorLoading: "Erro ao carregar detalhes da vaga"
  });

  useEffect(() => {
    async function fetchJob() {
      if (!params.id) {
        setError(pageTexts.idNotProvided);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Passa o locale atual para buscar a vaga com o ID correto nesse idioma
        const data = await getInsideJobById(Number(params.id), language);
        const page = await getJobListingPage(language);

        if (!data || !page) {
          setError(pageTexts.jobNotFound);
        } else {
          setJob(data);
          setPageData(page);
        }
      } catch (err) {
        console.error("Erro ao buscar vaga:", err);
        setError(pageTexts.errorLoading);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [params.id, language, pageTexts.idNotProvided, pageTexts.jobNotFound, pageTexts.errorLoading]);

  const handleApply = () => {
    setShowApplyModal(true);
  };

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
  };

  const handleOpenAuth = () => {
    setShowApplyModal(false); // Fechar apply modal se estiver aberto
    setShowAuthModal(true);
    setAuthModalType("login");
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  const handleSwitchAuthMode = () => {
    setAuthModalType(authModalType === "login" ? "register" : "login");
  };

  // 🔙 Fallback seguro para o botão de voltar
  const safeBack = () => {
    if (typeof window === "undefined") return;
    
    // Verifica se o usuário veio de uma página do mesmo site
    const referrer = document.referrer;
    const currentDomain = window.location.origin;
    const cameFromSameSite = referrer && referrer.startsWith(currentDomain);
    
    if (cameFromSameSite && window.history.length > 1) {
      // Se veio do mesmo site e há histórico, tenta voltar
      router.back();
      
      // Timeout de segurança: se não conseguir voltar em 100ms, vai para /jobs
      setTimeout(() => {
        if (window.location.pathname === `/jobs/${params.id}`) {
          router.push("/jobs");
        }
      }, 100);
    } else {
      // Se veio de link direto ou site externo, vai para /jobs
      router.push("/jobs");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{pageTexts.loading}</p>
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
            {error || pageTexts.jobNotFound}
          </h1>
          <p className="text-gray-400 mb-6">
            {pageTexts.jobNotFoundDesc}
          </p>
          <button
            onClick={() => router.push("/jobs")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {pageTexts.backToJobs}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={safeBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          {pageData?.labelVoltar}
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
                {job.jobStack?.split(/\s+/).filter(tech => tech.length > 0).map((tech, index) => (
                  <span
                    key={`${tech}-${index}`}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {job.LevelLabel && (
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium text-center ${job.LevelLabel === "Sênior" || job.LevelLabel === "Senior"
                      ? "bg-red-500/20 text-red-400"
                      : job.LevelLabel === "Pleno" || job.LevelLabel === "Mid-level"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                >
                  {job.LevelLabel}
                </div>
              )}

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

          <div className="mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-blue-400">
                {job.labelDescription}
              </h3>
              <p className="text-gray-300 leading-relaxed">{job.JobDescription}</p>
            </div>
          </div>

          {/* Seção "Sobre a Empresa" - só aparece se tiver conteúdo */}
          {job.AboutCompany && job.labelAboutCompany && job.AboutCompany.trim() !== "" && job.AboutCompany !== "Informações sobre benefícios não disponíveis" && (
            <div className="mb-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-cyan-400">
                  {job.labelAboutCompany}
                </h3>
                <p className="text-gray-300 leading-relaxed">{job.AboutCompany}</p>
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-8 md:grid-cols-1">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-green-400">
                {job.labelRequirements}
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
            
            {/* Seção "Benefícios" - só aparece se tiver conteúdo válido */}
            {job.jobbenefits && job.labelBenefits && job.jobbenefits.trim() !== "" && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-purple-400">
                  {job.labelBenefits}
                </h3>
                <ul className="space-y-2">
                  {job.jobbenefits.split("\n").filter((line) => !!line).map(
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
            )}
          </div>
        </motion.div>
        {showApplyModal && job && (
          <ApplyModal
            open={showApplyModal}
            onClose={handleCloseApplyModal}
            onOpenAuth={handleOpenAuth}
            job={{
              id: job.id,
              title: job.JobTitle,
              ...Object.fromEntries(Object.entries(job))
            }}
          />
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={handleCloseAuth}
          type={authModalType}
          onSwitchMode={handleSwitchAuthMode}
        />
      </div>
    </div>
  );
}
