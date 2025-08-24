// app/api/apply/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";          // evita limite de upload do Edge
export const dynamic = "force-dynamic";   // garante execução no server

function ensureString(v: FormDataEntryValue | null) {
    return typeof v === "string" ? v.trim() : "";
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

        // 3) (Opcional) saneamento/normalização de campos extras
        const payload = new FormData();
        // Campos principais
        payload.append("name", name);
        payload.append("email", email);
        payload.append("jobId", jobId);

        // Extras que sua modal já envia (mantidos, sem remover nada desnecessário)
        // Residency/City/State/Phone/JobTitle/JobJson, se existirem:
        const phone = ensureString(inForm.get("phone"));
        const residency = ensureString(inForm.get("residency"));
        const state = ensureString(inForm.get("state"));
        const city = ensureString(inForm.get("city"));
        const jobTitle = ensureString(inForm.get("jobTitle"));
        const jobJson = ensureString(inForm.get("jobJson"));

        if (phone) payload.append("phone", phone);
        if (residency) payload.append("residency", residency);
        if (state) payload.append("state", state);
        if (city) payload.append("city", city);
        if (jobTitle) payload.append("jobTitle", jobTitle);
        if (jobJson) payload.append("jobJson", jobJson);

        // 4) Anexa o arquivo do CV (mantém nome e mime)
    payload.append("cv", file, (file as File)?.name ?? "cv");

        // 5) Encaminha para o seu webhook do n8n (server-to-server)
        const url = process.env.N8N_WEBHOOK_URL;
        if (!url) {
            return NextResponse.json(
                { error: "N8N_WEBHOOK_URL não configurada." },
                { status: 500 },
            );
        }

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

            return NextResponse.json(
                { ok: true, message: getError(json) || "Candidatura recebida" },
                { status: 200 },
            );
    } catch {
        return NextResponse.json(
            { error: "Erro inesperado ao processar a candidatura." },
            { status: 500 },
        );
    }
}
