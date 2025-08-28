"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authConfig from "@/config/auth";

type Status = "idle" | "loading" | "success" | "error";

function ConfirmEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState<string>("");

    const code = searchParams.get("code");

    const confirm = useCallback(async () => {
        if (!code) {
            setStatus("error");
            setMessage("Código de confirmação ausente.");
            return;
        }

        try {
            setStatus("loading");
            setMessage("");

            // ✅ IMPORTANTE: não envie headers customizados (ex.: Content-Type)
            // para evitar preflight/OPTIONS e bloquear por CORS.
            const res = await fetch(
                `${authConfig.apiUrl}/api/auth/email-confirmation?confirmation=${encodeURIComponent(
                    code
                )}`,
                {
                    method: "GET",
                    // não usar headers aqui
                    credentials: "omit",
                    cache: "no-store",
                }
            );

            if (!res.ok) {
                // O Strapi retorna 400 quando o token é inválido/expirado/consumido
                const text = await res.text().catch(() => "");
                setStatus("error");
                setMessage(
                    res.status === 400
                        ? "Link inválido ou já utilizado. Solicite um novo e-mail de confirmação."
                        : `Falha ao confirmar e-mail (HTTP ${res.status}). ${text || ""}`.trim()
                );
                return;
            }

            // A confirmação deu certo
            setStatus("success");
            setMessage("E-mail confirmado com sucesso!");

            // Redireciona para a tela de login com um flag
            const target = "/login?confirmed=true";
            // pequeno delay só para o usuário ver o estado de sucesso
            setTimeout(() => router.replace(target), 800);
        } catch (error) {
            console.error('Erro na confirmação de e-mail:', error);
            setStatus("error");
            setMessage("Erro de conexão. Verifique sua internet e tente novamente.");
        }
    }, [code, router]);

    useEffect(() => {
        confirm();
    }, [confirm]);

    const isLoading = status === "loading";
    const isError = status === "error";
    const isSuccess = status === "success";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-xl text-center">
                <h1 className="text-white text-2xl font-bold mb-4">Confirmação de E-mail</h1>

                {isLoading && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                        <p className="text-gray-300">Confirmando seu e-mail...</p>
                    </>
                )}

                {isSuccess && (
                    <>
                        <div className="text-4xl mb-3">✅</div>
                        <p className="text-green-400">{message}</p>
                        <p className="text-gray-400 mt-2">Redirecionando...</p>
                    </>
                )}

                {isError && (
                    <>
                        <div className="text-4xl mb-3">⚠️</div>
                        <p className="text-red-400">{message}</p>
                        <button
                            onClick={confirm}
                            disabled={isLoading}
                            className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                            Tentar Novamente
                        </button>
                        <button
                            onClick={() => router.push("/login")}
                            className="mt-3 inline-flex items-center justify-center rounded-lg bg-gray-700 px-5 py-2.5 font-medium text-white hover:bg-gray-600 transition-colors"
                        >
                            Ir para o Login
                        </button>
                    </>
                )}

                {status === "idle" && (
                    <p className="text-gray-300">Preparando confirmação...</p>
                )}
            </div>
        </div>
    );
}

export default function ConfirmEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-xl text-center">
                    <h1 className="text-white text-2xl font-bold mb-4">Confirmação de E-mail</h1>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                    <p className="text-gray-300">Carregando...</p>
                </div>
            </div>
        }>
            <ConfirmEmailContent />
        </Suspense>
    );
}
