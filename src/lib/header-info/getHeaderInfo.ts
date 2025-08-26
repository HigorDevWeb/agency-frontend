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
    profileButtonText?: string; // Texto para o botão de perfil (opcional)
    logoutButtonText?: string; // Texto para o botão de logout (opcional)
}

export const getHeaderInfo = async (locale?: string): Promise<HeaderInfo | null> => {
    try {
        // Adicionar locale como parâmetro de consulta se fornecido
        const localeParam = locale ? `locale=${locale}&` : '';
        const res = await fetch(
            `https://api.recruitings.info/api/header-info?${localeParam}populate[menu]=true&populate[logo]=true`,
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
