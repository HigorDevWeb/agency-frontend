"use client";

import {
  getJobListingPage,
  InsideCardJob,
  FrontCardJob,
} from "@/lib/getJobListing/getJobListingPage";
import { getBrowserLocale } from "@/lib/api";

// Busca todos os jobs do frontCardJob com suporte a locale
export const getAllJobs = async (locale?: string): Promise<FrontCardJob[]> => {
  // Se não for fornecido um locale, usa o do navegador
  const currentLocale = locale || getBrowserLocale();
  const data = await getJobListingPage(currentLocale);
  return data?.frontCardJob ?? [];
};

export { getJobListingPage };

// Busca todos os inside cards
export const getAllInsideJobs = async (locale?: string): Promise<InsideCardJob[]> => {
  const currentLocale = locale || getBrowserLocale();
  const data = await getJobListingPage(currentLocale);
  return data?.insideCardJob ?? [];
};

// Busca um job do frontCardJob pelo ID
export const getJobById = async (id: number, locale?: string): Promise<FrontCardJob | undefined> => {
  const currentLocale = locale || getBrowserLocale();
  const data = await getJobListingPage(currentLocale);
  return data?.frontCardJob.find((job) => job.id === id);
};

// Função para normalizar títulos (remove espaços extras e converte para lowercase)
const normalizeTitle = (title: string): string => {
  return title.trim().toLowerCase();
};

// Busca um insideCardJob pelo ID do frontCardJob
export const getInsideJobById = async (frontCardId: number, locale?: string): Promise<InsideCardJob | undefined> => {
  const currentLocale = locale || getBrowserLocale();
  const data = await getJobListingPage(currentLocale);
  
  if (!data || !data.frontCardJob || !data.insideCardJob) {
    console.error("❌ Dados não disponíveis para o locale:", currentLocale);
    return undefined;
  }
  
  // Tenta encontrar primeiro o frontCardJob pelo ID
  const frontCardJob = data.frontCardJob.find((job) => job.id === frontCardId);
  
  // Se não encontrou o frontCardJob, pode ser um ID inválido ou não disponível neste locale
  if (!frontCardJob) {
    console.log("⚠️ FrontCardJob não encontrado para ID:", frontCardId);
    
    // Como fallback, se o usuário acessar um ID que não existe no locale atual,
    // podemos retornar o primeiro job disponível neste locale
    if (data.insideCardJob.length > 0) {
      console.log("🔄 Usando primeiro job disponível como fallback");
      return data.insideCardJob[0];
    }
    
    return undefined;
  }
  
  // 1. Primeiro, tenta encontrar correspondência direta de ID
  const directMatch = data.insideCardJob.find((job) => job.id === frontCardId);
  if (directMatch) {
    console.log("✅ Correspondência direta de ID encontrada");
    return directMatch;
  }
  
  // 2. Segundo, tenta encontrar correspondência por título exato
  const normalizedFrontTitle = normalizeTitle(frontCardJob.jobTitle);
  const titleMatch = data.insideCardJob.find((job) => 
    normalizeTitle(job.JobTitle) === normalizedFrontTitle
  );
  
  if (titleMatch) {
    console.log("✅ Correspondência por título exato encontrada");
    return titleMatch;
  }
  
  // 3. Terceiro, tenta encontrar correspondência por índice
  // Se o frontCardJob é o terceiro da lista, pega o terceiro insideCardJob
  const frontCardIndex = data.frontCardJob.findIndex(job => job.id === frontCardId);
  if (frontCardIndex !== -1 && frontCardIndex < data.insideCardJob.length) {
    console.log("✅ Correspondência por índice encontrada");
    return data.insideCardJob[frontCardIndex];
  }
  
  // 4. Quarto, tenta correspondência parcial de título
  const partialMatch = data.insideCardJob.find((job) => 
    normalizeTitle(job.JobTitle).includes(normalizedFrontTitle) || 
    normalizedFrontTitle.includes(normalizeTitle(job.JobTitle))
  );
  
  if (partialMatch) {
    console.log("✅ Correspondência parcial por título encontrada");
    return partialMatch;
  }
  
  // 5. Por fim, retorna o primeiro job disponível
  console.log("⚠️ Nenhuma correspondência encontrada, usando primeiro job como fallback");
  return data.insideCardJob[0];
};

// Busca um insideCardJob pelo ID direto (para casos onde você tem o ID do insideCardJob)
export const getInsideJobByDirectId = async (insideCardId: number, locale?: string): Promise<InsideCardJob | undefined> => {
  const currentLocale = locale || getBrowserLocale();
  const data = await getJobListingPage(currentLocale);
  return data?.insideCardJob.find((job) => job.id === insideCardId);
};

// Função de teste para verificar o mapeamento
export const testJobMapping = async (locale?: string): Promise<void> => {
  const currentLocale = locale || getBrowserLocale();
  const data = await getJobListingPage(currentLocale);
  
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
export const filterJobs = async (filterType: string, locale?: string): Promise<FrontCardJob[]> => {
  const currentLocale = locale || getBrowserLocale();
  const data = await getJobListingPage(currentLocale);
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
