// getTechStackSection.ts
import { getBrowserLocale } from "@/lib/api";

export interface TechCardItem {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    description?: string;
}

export interface TechStackSection {
    id: number;
    locale: string;
    paragraphTech: string;
    MainTitle: string;
    techCard: Array<TechCardItem>;
}

export async function getTechStackSection(locale?: string): Promise<TechStackSection | null> {
    try {
        // Usa o locale fornecido ou o do navegador como fallback
        const currentLocale = locale || getBrowserLocale();
        
        // Adiciona o parâmetro locale à URL da API
        const localeParam = currentLocale ? `locale=${currentLocale}&` : '';
        
        const res = await fetch(
            `https://api.recruitings.info/api/tech-stack-section?${localeParam}populate[techCard]=true`
        );
        
        if (!res.ok) {
            console.error(`Erro ao buscar dados do Tech Stack: ${res.status}`);
            return null;
        }
        
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Erro ao buscar dados do Tech Stack:", error);
        return null;
    }
}
