// /lib/hero-section/getHeroSection.ts
"use client";

export type HeroButton = {
    id: number;
    topTitle: string;
    lowerTitle: string;
    paragraph: string;
    ExplorerButton: string;
    RegisterCompanyButton: string;
};

export type HeroSection = {
    id: number;
    locale: string;
    heroButton: HeroButton[];
    localizations?: {
        id: number;
        locale: string;
    }[];
};

interface StrapiResponse<T> {
    data: T;
    meta: string;
}

// Busca o single-type "hero-section" do Strapi com suporte a locale
export async function getHeroSection(locale?: string): Promise<HeroSection | null> {
    try {
        // Usar nossa função fetchFromAPI centralizada ou fazer a requisição direta
        const base = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.recruitings.info';
        
        // Adicionar locale como parâmetro de consulta se fornecido
        const localeParam = locale ? `locale=${locale}&` : '';
        
        const res = await fetch(
            `${base}/api/hero-section?${localeParam}populate=*`,
            {
                headers: { "Content-Type": "application/json" },
                // opcional: revalidar a cada 60s em ISR
                next: { revalidate: 60 },
            }
        );

        if (!res.ok) {
            throw new Error(`Failed to fetch hero-section (status ${res.status})`);
        }

        const json: StrapiResponse<HeroSection> = await res.json();
        return json.data || null;
    } catch (error) {
        console.error("Erro ao buscar hero-section:", error);
        return null;
    }
}
