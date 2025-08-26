// apply-modal-page.ts
import { getBrowserLocale } from "@/lib/api";

export interface ApplyModalContent {
    id: number;
    documentId: string;
    modalTitle: string;
    labelNome: string;
    labelTelefone: string;
    labelEmail: string;
    labelArresteAqui: string;
    botaoCadastrar: string;
    enviando?: string; // Texto para quando o formulário está sendo enviado
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
}

export async function getApplyModalContent(locale?: string): Promise<ApplyModalContent | null> {
    try {
        // Usa o locale fornecido ou o do navegador como fallback
        const currentLocale = locale || getBrowserLocale();
        
        // Adiciona o parâmetro locale à URL da API
        const localeParam = currentLocale ? `locale=${currentLocale}` : '';
        
        const res = await fetch(
            `https://api.recruitings.info/api/apply-modal?${localeParam}`,
            {
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            }
        );
        
        if (!res.ok) {
            console.error(`Erro ao buscar dados do modal de aplicação: ${res.status}`);
            return null;
        }
        
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Erro ao buscar dados do modal de aplicação:", error);
        return null;
    }
}
