"use client";

import {
  getJobListingPage,
  InsideCardJob,
  FrontCardJob,
} from "@/lib/getJobListing/getJobListingPage";

// Busca todos os jobs do frontCardJob
export const getAllJobs = async (): Promise<FrontCardJob[]> => {
  const data = await getJobListingPage();
  return data?.frontCardJob ?? [];
};

// Busca todos os inside cards
export const getAllInsideJobs = async (): Promise<InsideCardJob[]> => {
  const data = await getJobListingPage();
  return data?.insideCardJob ?? [];
};

// Busca um job do frontCardJob pelo ID
export const getJobById = async (id: number): Promise<FrontCardJob | undefined> => {
  const data = await getJobListingPage();
  return data?.frontCardJob.find((job) => job.id === id);
};

// Função para normalizar títulos (remove espaços extras e converte para lowercase)
const normalizeTitle = (title: string): string => {
  return title.trim().toLowerCase();
};

// Busca um insideCardJob pelo ID do frontCardJob
export const getInsideJobById = async (frontCardId: number): Promise<InsideCardJob | undefined> => {
  const data = await getJobListingPage();
  
  console.log("🔍 Buscando insideCardJob para frontCardId:", frontCardId);
  console.log("📊 Dados completos:", data);
  
  // Primeiro, encontrar o frontCardJob pelo ID
  const frontCardJob = data?.frontCardJob.find((job) => job.id === frontCardId);
  
  console.log("🎯 FrontCardJob encontrado:", frontCardJob);
  
  if (!frontCardJob) {
    console.log("❌ FrontCardJob não encontrado para ID:", frontCardId);
    return undefined;
  }
  
  // Normalizar o título do frontCardJob
  const normalizedFrontTitle = normalizeTitle(frontCardJob.jobTitle);
  console.log("🔍 Título normalizado do frontCardJob:", `"${normalizedFrontTitle}"`);
  
  // Depois, encontrar o insideCardJob correspondente pelo título da vaga (normalizado)
  const insideCardJob = data?.insideCardJob.find((job) => 
    normalizeTitle(job.JobTitle) === normalizedFrontTitle
  );
  
  console.log("🔍 Procurando insideCardJob com título normalizado:", `"${normalizedFrontTitle}"`);
  console.log("📋 InsideCardJobs disponíveis:", data?.insideCardJob.map(job => ({ 
    id: job.id, 
    title: job.JobTitle,
    normalizedTitle: normalizeTitle(job.JobTitle)
  })));
  console.log("✅ InsideCardJob encontrado:", insideCardJob);
  
  return insideCardJob;
};

// Busca um insideCardJob pelo ID direto (para casos onde você tem o ID do insideCardJob)
export const getInsideJobByDirectId = async (insideCardId: number): Promise<InsideCardJob | undefined> => {
  const data = await getJobListingPage();
  return data?.insideCardJob.find((job) => job.id === insideCardId);
};

// Função de teste para verificar o mapeamento
export const testJobMapping = async (): Promise<void> => {
  const data = await getJobListingPage();
  
  console.log("🧪 TESTE DE MAPEAMENTO DE VAGAS");
  console.log("📋 FrontCardJobs:");
  data?.frontCardJob.forEach(job => {
    console.log(`  ID: ${job.id}, Título: "${job.jobTitle}" (normalizado: "${normalizeTitle(job.jobTitle)}")`);
  });
  
  console.log("📋 InsideCardJobs:");
  data?.insideCardJob.forEach(job => {
    console.log(`  ID: ${job.id}, Título: "${job.JobTitle}" (normalizado: "${normalizeTitle(job.JobTitle)}")`);
  });
  
  console.log("🔗 Testando mapeamentos:");
  data?.frontCardJob.forEach(frontJob => {
    const normalizedFrontTitle = normalizeTitle(frontJob.jobTitle);
    const insideJob = data?.insideCardJob.find(inside => 
      normalizeTitle(inside.JobTitle) === normalizedFrontTitle
    );
    console.log(`  Front ID ${frontJob.id} ("${frontJob.jobTitle}") -> Inside ID ${insideJob?.id || 'NÃO ENCONTRADO'} ("${insideJob?.JobTitle || 'N/A'}")`);
  });
};

// Filtra jobs do frontCardJob pelo tipo de filtro
export const filterJobs = async (filterType: string): Promise<FrontCardJob[]> => {
  const data = await getJobListingPage();
  const jobs = data?.frontCardJob ?? [];

  if (filterType.toLowerCase() === "all") return jobs;

  return jobs.filter((job) => {
    switch (filterType.toLowerCase()) {
      case "remote":
        return job.jobType.toLowerCase().includes("remote");
      case "senior":
        return job.labelType.toLowerCase() === "senior";
      case "pleno":
        return job.labelType.toLowerCase() === "pleno";
      case "junior":
        return job.labelType.toLowerCase() === "júnior";
      case "fullstack":
        return job.jobTitle.toLowerCase().includes("full stack");
      default:
        return true;
    }
  });
};
