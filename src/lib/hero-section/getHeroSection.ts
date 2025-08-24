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
    heroButton: HeroButton[];
};

interface StrapiResponse<T> {
    data: T;
    meta: string;
}

// Busca o single-type "hero-section" do Strapi
export async function getHeroSection(): Promise<HeroSection> {
    const base = process.env.NEXT_PUBLIC_STRAPI_API_URL;
    const res = await fetch(
        `${base}/api/hero-section?populate=*`,
        {
            // opcional: revalidar a cada 60s em ISR
            next: { revalidate: 60 },
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch hero-section (status ${res.status})`);
    }

    const json: StrapiResponse<{ id: number } & HeroSection> = await res.json();
    return json.data;
}
