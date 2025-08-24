// src/lib/header-info/getHeaderInfo.ts
"use client";
export interface HeaderMenuItem {
    id: number;
    label: string;
    href: string | null;
}

export interface HeaderLocalization {
    id: number;
    locale: string;
    logoLabel: string;
}

export interface HeaderInfo {
    id: number;
    locale: string;
    logoLabel: string;
    logo: File;
    menu: HeaderMenuItem[];
    localizations: HeaderLocalization[];
}

export const getHeaderInfo = async (): Promise<HeaderInfo | null> => {
    try {
        const res = await fetch(
            `https://api.recruitings.info/api/header-info?populate=*`,
            {
                headers: { "Content-Type": "application/json" },
                cache: "no-store", // ou 'force-cache' se preferir SSR
            }
        );

        const json = await res.json();

        return json?.data || null;
    } catch (error) {
        console.error("Erro ao buscar header info:", error);
        return null;
    }
};
