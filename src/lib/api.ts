// src/lib/api.ts - API central para gerenciamento de todas as chamadas à Strapi

const API_URL = 'https://api.recruitings.info/api';

/**
 * Função genérica para buscar dados da API com suporte a locale
 * 
 * @param endpoint - O endpoint da API para fazer a requisição
 * @param locale - O locale desejado (pt, en)
 * @param options - Opções adicionais para a requisição
 * @returns Os dados da resposta ou null em caso de erro
 */
export async function fetchFromAPI<T>(
  endpoint: string, 
  locale?: string, 
  options: RequestInit = {}
): Promise<T | null> {
  try {
    // Adicionar locale como parâmetro de consulta se fornecido
    const localeParam = locale ? `locale=${locale}&` : '';
    
    // Verificar se o endpoint já tem parâmetros de consulta
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_URL}/${endpoint}${locale ? `${separator}${localeParam}` : ''}`;
    
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json",
        ...options.headers 
      },
      cache: "no-store", // Ou use 'force-cache' se preferir SSR com cache
      ...options
    });

    if (!res.ok) {
      throw new Error(`Erro na API: ${res.status}`);
    }

    const json = await res.json();
    return json?.data || null;
  } catch (error) {
    console.error(`Erro ao buscar dados de ${endpoint}:`, error);
    return null;
  }
}

/**
 * Função para buscar recursos disponíveis de um tipo específico
 * 
 * @param resourceType - O tipo de recurso a ser buscado
 * @returns Um array com os locales disponíveis ou null em caso de erro
 */
export async function getAvailableLocales(resourceType: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${API_URL}/${resourceType}`,
      {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    
    const data = await res.json();
    // Extrair locales disponíveis da resposta
    const availableLocales: string[] = data?.data?.map((item: {locale: string}) => item.locale) || [];
    return [...new Set(availableLocales)]; // Remover duplicatas
  } catch (error) {
    console.error(`Erro ao buscar locales disponíveis para ${resourceType}:`, error);
    return ['pt', 'en']; // Fallback para os idiomas básicos
  }
}

// Tipos exportados para uso em todo o projeto
export type SupportedLocale = 'pt' | 'en';

// Apenas os locales que desejamos suportar
export const SUPPORTED_LOCALES: SupportedLocale[] = ['pt', 'en'];

// Mapeamento de códigos de locale para nomes e emojis de bandeiras
export const LOCALE_INFO = {
  pt: { name: 'Português', flag: '🇧🇷', fullCode: 'pt-BR' },
  en: { name: 'English', flag: '🇺🇸', fullCode: 'en-US' }
};

/**
 * Função para obter o locale do navegador ou o locale padrão
 */
export function getBrowserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'pt'; // Padrão para SSR
  
  try {
    const savedLocale = localStorage.getItem('devjobs_language') as SupportedLocale;
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
      return savedLocale;
    }
    
    // Tenta obter o locale do navegador
    const browserLang = navigator.language.split('-')[0];
    return SUPPORTED_LOCALES.includes(browserLang as SupportedLocale) 
      ? browserLang as SupportedLocale 
      : 'pt';
  } catch {
    return 'pt'; // Fallback seguro
  }
}