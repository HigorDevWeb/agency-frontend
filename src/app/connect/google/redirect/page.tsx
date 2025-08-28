"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authConfig from "@/config/auth";

export default function GoogleRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        setError(null);

        // Pegar parâmetros da URL (enviados pelo Strapi após autenticação no Google)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token"); // token da Google
        const errorParam = urlParams.get("error");
        const nextParam = urlParams.get("next"); // opcional: rota para redirecionar após login

        console.log("🔍 Google Callback - Processando...");
        console.log("🎫 Token recebido:", accessToken ? "Sim" : "Não");
        console.log("❌ Erro recebido:", errorParam || "Nenhum");

        if (errorParam) {
          console.error("❌ Erro no callback do Google:", errorParam);
          setError(`Erro na autenticação: ${errorParam}`);
          return;
        }

        if (!accessToken) {
          console.error("❌ Token não encontrado na URL");
          setError("Token de acesso não recebido do servidor");
          return;
        }

        // PASSO OFICIAL: trocar o token da Google pelo JWT do Strapi
        // Endpoint: /api/auth/google/callback?access_token=...
        const callbackRes = await fetch(
          `${authConfig.apiUrl}/api/auth/google/callback?access_token=${encodeURIComponent(
            accessToken
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );

        if (!callbackRes.ok) {
          const errorText = await callbackRes.text();
          console.error(
            "❌ Erro ao obter JWT do Strapi:",
            callbackRes.status,
            errorText
          );
          throw new Error(
            `Erro ao obter JWT do Strapi (${callbackRes.status})`
          );
        }

        const authData = await callbackRes.json(); // { jwt, user }
        if (!authData?.jwt || !authData?.user) {
          console.error("❌ Resposta inesperada:", authData);
          throw new Error("Resposta inesperada da API do Strapi");
        }

        // Persistir credenciais localmente (em produção, prefira cookie httpOnly via rota API)
        localStorage.setItem("auth_token", authData.jwt);
        localStorage.setItem("auth_user", JSON.stringify(authData.user));

        // Opcional: callback global, se existir
        if (
          typeof window !== "undefined" &&
          (window as unknown as {
            handleGoogleAuthSuccess?: (userData: unknown) => void;
          }).handleGoogleAuthSuccess
        ) {
          (window as unknown as {
            handleGoogleAuthSuccess: (userData: unknown) => void;
          }).handleGoogleAuthSuccess(authData.user);
        }

        console.log("🎉 Login com Google realizado com sucesso!");

        // Redirecionar (usa ?next=/alguma-rota se presente; senão, /dashboard)
        const target = nextParam && nextParam.startsWith("/")
          ? nextParam
          : "/dashboard";
        router.push(target);
      } catch (error) {
        console.error("💥 Erro no callback do Google:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setError(`Erro ao processar login: ${errorMessage}`);
      }
    };

    handleGoogleCallback();
  }, [router]);

  // Se houver erro, mostrar botão para voltar
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-4">Erro na Autenticação</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-white mt-4 text-xl font-medium">
          Processando login com Google...
        </p>
        <p className="text-gray-400 mt-2">
          Aguarde enquanto validamos suas credenciais
        </p>
      </div>
    </div>
  );
}
