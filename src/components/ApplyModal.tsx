"use client";

import { useState, DragEvent, useEffect } from "react";
import { getApplyModalContent, ApplyModalContent } from "@/lib/apply-modal-page/apply-modal-page";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

type JobMinimal = {
    id: number | string;
    title?: string;
    [key: string]: unknown;
};

type Props = {
    open: boolean;
    onClose: () => void;
    job: JobMinimal;
    onOpenAuth?: () => void;
};

export default function ApplyModal({ open, onClose, job, onOpenAuth }: Props) {
    const { language } = useLanguage();
    const { canApplyToJobs } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [modalContent, setModalContent] = useState<ApplyModalContent | null>(null);

    useEffect(() => {
        async function fetchModalContent() {
            try {
                const content = await getApplyModalContent(language);
                setModalContent(content);
            } catch (error) {
                console.error("Erro ao carregar conteúdo do modal:", error);
            }
        }

        if (open) {
            fetchModalContent();
        }
    }, [language, open]);

    if (!open) return null;

    // Check if user can apply to jobs
    if (!canApplyToJobs()) {
        // Close the apply modal and open auth modal directly
        onClose();
        if (onOpenAuth) {
            onOpenAuth();
        }
        return null;
    }

    function onDrop(ev: DragEvent<HTMLLabelElement>) {
        ev.preventDefault();
        const f = ev.dataTransfer.files?.[0];
        if (f) setFile(f);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setMsg(null);

        const form = e.currentTarget;
        const data = new FormData(form);

        data.append("jobId", String(job.id));
        if (job.title) data.append("jobTitle", String(job.title));
        data.append("jobJson", JSON.stringify(job));
        if (file) data.append("cv", file, file.name);

        const res = await fetch("/api/apply", { method: "POST", body: data });
        const text = await res.text();
    let payload: unknown = null;
    try { payload = JSON.parse(text); } catch { }

        setSubmitting(false);
        const getError = (j: unknown): string | undefined => {
            if (j && typeof j === "object") {
                if ("error" in j && typeof (j as { error?: string }).error === "string") return (j as { error?: string }).error;
                if ("message" in j && typeof (j as { message?: string }).message === "string") return (j as { message?: string }).message;
            }
            return undefined;
        };
        if (!res.ok) {
            setMsg(getError(payload) ?? "Não foi possível enviar sua candidatura.");
            return;
        }
        setMsg(getError(payload) ?? "Candidatura enviada com sucesso!");
        form.reset();
        setFile(null);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">
                        {modalContent?.modalTitle || "Candidatar-se"} {job.title ? `— ${job.title}` : ""}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg px-3 py-1 text-gray-300 hover:bg-gray-700 hover:text-white"
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-gray-300">{modalContent?.labelNome || "Nome completo"}</label>
                            <input name="name" required className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-gray-300">{modalContent?.labelTelefone || "Telefone (WhatsApp)"}</label>
                            <input name="phone" required className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-gray-300">{modalContent?.labelEmail || "E-mail"}</label>
                        <input type="email" name="email" required className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white outline-none focus:border-blue-500" />
                    </div>

                    <div>
                        <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/40 p-6 text-gray-300 hover:border-blue-500"
                        >
                            <input
                                type="file"
                                name="cv"
                                accept=".pdf,.doc,.docx,.txt,.rtf"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                            {modalContent?.labelArresteAqui ? (
                                <>
                                    <span className="text-sm">{modalContent.labelArresteAqui.split('\n')[0]}</span>
                                    <span className="mt-2 text-xs text-gray-400">{modalContent.labelArresteAqui.split('\n')[1]}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm">Arraste seu currículo aqui ou clique para selecionar</span>
                                    <span className="mt-2 text-xs text-gray-400">PDF/DOC/DOCX/TXT/RTF até ~20MB</span>
                                </>
                            )}
                            {file && <span className="mt-2 rounded bg-gray-700 px-2 py-1 text-xs">{file.name}</span>}
                        </label>
                    </div>

                    <button disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-60">
                        {submitting 
                            ? (modalContent?.enviando || (language === 'en' ? "Sending..." : "Enviando...")) 
                            : (modalContent?.botaoCadastrar || "Cadastrar")}
                    </button>

                    {msg && <p className="text-center text-sm text-gray-200">{msg}</p>}
                </form>
            </div>
        </div>
    );
}
