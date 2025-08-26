// getLoginPage.ts
import { getBrowserLocale } from "@/lib/api";

export async function getLoginPage(locale?: string) {
    // Usa o locale fornecido ou o do navegador como fallback
    const currentLocale = locale || getBrowserLocale();
    
    // Adiciona o parâmetro locale à URL da API
    const localeParam = currentLocale ? `locale=${currentLocale}&` : '';
    
    const res = await fetch(`https://api.recruitings.info/api/login-modal-content?${localeParam}populate=*`);
    
    if (!res.ok) {
        console.error(`Erro ao buscar dados de login: ${res.status}`);
        return null;
    }
    
    const json = await res.json();
    return json.data;
}
