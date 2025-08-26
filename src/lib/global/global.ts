// getGlobal.ts
import { getBrowserLocale } from "@/lib/api";

export async function getGlobal(locale?: string) {
    // Usa o locale fornecido ou o do navegador como fallback
    const currentLocale = locale || getBrowserLocale();
    
    // Adiciona o parâmetro locale à URL da API
    const localeParam = currentLocale ? `locale=${currentLocale}&` : '';
    
    // Mantém os parâmetros de populate detalhados para garantir que todos os dados necessários sejam carregados
    const res = await fetch(`https://api.recruitings.info/api/global?${localeParam}populate[footerStats]=true&populate[footerLinksGroups][populate][footerLinksGroup]=true`);
    
    if (!res.ok) {
        console.error(`Erro ao buscar dados globais: ${res.status}`);
        return null;
    }
    
    const json = await res.json();
    return json.data;
}
