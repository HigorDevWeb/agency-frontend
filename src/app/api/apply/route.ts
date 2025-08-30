// app/api/apply/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";          // evita limite de upload do Edge
export const dynamic = "force-dynamic";   // garante execução no server

// URLs do Strapi
const STRAPI_API_URL = "https://api.recruitings.info/api";
const STRAPI_UPLOAD_URL = "https://api.recruitings.info/api/upload";

// Mock database for applications (in production, use real database)
const applications: Array<{
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  appliedAt: string;
  status: string;
  statusMessage: string;
  cvFileName?: string;
  strapiFileId?: number;
  userInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  timeline: Array<{
    id: string;
    status: string;
    message: string;
    timestamp: string;
    isSystemGenerated: boolean;
  }>;
}> = [];

function ensureString(v: FormDataEntryValue | null) {
    return typeof v === "string" ? v.trim() : "";
}

function generateId() {
    return `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Função para fazer upload do currículo para o Strapi
 */
async function uploadFileToStrapi(file: File): Promise<{ id: number; url: string } | null> {
    try {
        const formData = new FormData();
        formData.append('files', file, file.name);

        const response = await fetch(STRAPI_UPLOAD_URL, {
            method: 'POST',
            body: formData,
            headers: {
                // Não definir Content-Type, deixar o browser definir com boundary
            },
        });

        if (!response.ok) {
            console.error('Erro no upload para Strapi:', response.status, response.statusText);
            return null;
        }

        const uploadResult = await response.json();
        
        // O Strapi retorna um array de arquivos
        if (Array.isArray(uploadResult) && uploadResult.length > 0) {
            const uploadedFile = uploadResult[0];
            return {
                id: uploadedFile.id,
                url: uploadedFile.url
            };
        }

        return null;
    } catch (error) {
        console.error('Erro ao fazer upload para Strapi:', error);
        return null;
    }
}

/**
 * Função para salvar a aplicação no Strapi
 */
async function saveApplicationToStrapi(applicationData: {
    name: string;
    email: string;
    phone?: string;
    jobId: string;
    jobTitle?: string;
    cvFileId?: number;
    applicationId: string;
}): Promise<boolean> {
    try {
        const payload = {
            data: {
                name: applicationData.name,
                email: applicationData.email,
                phone: applicationData.phone || '',
                jobId: applicationData.jobId,
                jobTitle: applicationData.jobTitle || '',
                cvFile: applicationData.cvFileId || null,
                applicationId: applicationData.applicationId,
                status: 'pending',
                appliedAt: new Date().toISOString(),
            }
        };

        const response = await fetch(`${STRAPI_API_URL}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Erro ao salvar aplicação no Strapi:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Detalhes do erro:', errorText);
            return false;
        }

        const result = await response.json();
        console.log('Aplicação salva no Strapi com sucesso:', result.data?.id);
        return true;
    } catch (error) {
        console.error('Erro ao salvar aplicação no Strapi:', error);
        return false;
    }
}

export async function POST(req: Request) {
    try {
        // 1) Recebe o formulário da sua modal
        const inForm = await req.formData();

        // 2) Validação mínima (nome, e-mail, jobId e CV)
        const name = ensureString(inForm.get("name"));
        const email = ensureString(inForm.get("email"));
        const jobId = ensureString(inForm.get("jobId"));
        const file = inForm.get("cv") as File | null;

        if (!name || !email || !jobId || !file) {
            return NextResponse.json(
                { error: "Campos obrigatórios ausentes (nome, email, jobId e currículo)." },
                { status: 400 },
            );
        }

        // 3) Gera ID da aplicação
        const applicationId = generateId();

        // 4) Upload do currículo para o Strapi
        console.log('Fazendo upload do currículo para o Strapi...');
        const strapiUpload = await uploadFileToStrapi(file);
        let strapiFileId: number | undefined;
        
        if (strapiUpload) {
            strapiFileId = strapiUpload.id;
            console.log('Upload para Strapi concluído. File ID:', strapiFileId);
        } else {
            console.warn('Falha no upload para Strapi, mas continuando com N8n...');
        }

        // 5) Campos extras que sua modal já envia
        const phone = ensureString(inForm.get("phone"));
        const residency = ensureString(inForm.get("residency"));
        const state = ensureString(inForm.get("state"));
        const city = ensureString(inForm.get("city"));
        const jobTitle = ensureString(inForm.get("jobTitle"));
        const jobJson = ensureString(inForm.get("jobJson"));

        // 6) Salva a aplicação no Strapi
        console.log('Salvando aplicação no Strapi...');
        const strapiSaved = await saveApplicationToStrapi({
            name,
            email,
            phone,
            jobId,
            jobTitle,
            cvFileId: strapiFileId,
            applicationId,
        });

        if (strapiSaved) {
            console.log('Aplicação salva no Strapi com sucesso!');
        } else {
            console.warn('Falha ao salvar aplicação no Strapi, mas continuando com N8n...');
        }

        // 7) Prepara payload para N8n (mantém fluxo original)
        const payload = new FormData();
        payload.append("name", name);
        payload.append("email", email);
        payload.append("jobId", jobId);
        payload.append("applicationId", applicationId);

        if (phone) payload.append("phone", phone);
        if (residency) payload.append("residency", residency);
        if (state) payload.append("state", state);
        if (city) payload.append("city", city);
        if (jobTitle) payload.append("jobTitle", jobTitle);
        if (jobJson) payload.append("jobJson", jobJson);

        // Adiciona informações do Strapi ao payload do N8n
        if (strapiFileId) {
            payload.append("strapiFileId", strapiFileId.toString());
        }

        // 8) Anexa o arquivo do CV para N8n
        payload.append("cv", file, (file as File)?.name ?? "cv");

        // 9) Salva a candidatura no "banco de dados" local antes de enviar para N8N
        const application = {
            id: applicationId,
            userId: "user-1", // In production, get from JWT token
            jobId,
            jobTitle: jobTitle || `Vaga ${jobId}`,
            companyName: "Tech Company",
            appliedAt: new Date().toISOString(),
            status: "pending",
            statusMessage: "Candidatura recebida. Aguardando análise...",
            cvFileName: (file as File)?.name,
            strapiFileId: strapiFileId,
            userInfo: {
                name,
                email,
                phone
            },
            timeline: [
                {
                    id: `t-${Date.now()}`,
                    status: "pending",
                    message: "Candidatura enviada com sucesso",
                    timestamp: new Date().toISOString(),
                    isSystemGenerated: true
                }
            ]
        };

        // Adiciona ao mock database
        applications.push(application);

        // 10) Encaminha para o seu webhook do n8n (server-to-server)
        const url = process.env.N8N_WEBHOOK_URL;
        if (!url) {
            return NextResponse.json(
                { error: "N8N_WEBHOOK_URL não configurada." },
                { status: 500 },
            );
        }

        console.log('Enviando para N8n...');
        const res = await fetch(url, {
            method: "POST",
            body: payload,
            // não setar manualmente Content-Type; o FormData faz isso
        });

        const text = await res.text();
        let json: unknown = null;
        try { json = JSON.parse(text); } catch { /* pode ser texto simples */ }

        // Type guard para acessar propriedades
        const getError = (j: unknown): string | undefined => {
            if (j && typeof j === "object") {
                const obj = j as Record<string, unknown>;
                if ("error" in obj && typeof obj.error === "string") return obj.error;
                if ("message" in obj && typeof obj.message === "string") return obj.message;
            }
            return undefined;
        };

        if (!res.ok) {
            return NextResponse.json(
                { error: getError(json) || "Falha ao enviar para o n8n." },
                { status: res.status || 502 },
            );
        }

        console.log('Processo concluído com sucesso!');
        return NextResponse.json(
            { 
                ok: true, 
                message: getError(json) || "Candidatura recebida",
                applicationId: applicationId,
                strapiFileId: strapiFileId,
                strapiSaved: strapiSaved
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Erro inesperado:', error);
        return NextResponse.json(
            { error: "Erro inesperado ao processar a candidatura." },
            { status: 500 },
        );
    }
}
