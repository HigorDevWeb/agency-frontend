"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import authConfig from "@/config/auth";

/** Estrutura de erro amigável para UI */
type UiError = {
  title: string;
  message: string;
  ctas?: Array<
    | { type: "primary"; label: string; onClick: () => void }
    | { type: "secondary"; label: string; onClick: () => void }
    | { type: "link"; label: string; onClick: () => void }
  >;
};

/** Converte erro técnico do Strapi em mensagem amigável */
function mapStrapiErrorToUI(
  status: number,
  rawBody: { error?: { message: string } } | string | null,
  emailHint?: string
): UiError {
  const strapiMsg =
    (typeof rawBody === "object" && rawBody && rawBody.error?.message) ||
    (typeof rawBody === "string" ? rawBody : "");
  const msg = (strapiMsg || "").toLowerCase();

  // Caso: e-mail já cadastrado
  if (status === 400 && (msg.includes("email") && (msg.includes("taken") || msg.includes("already")))) {
    return {
      title: "Esta conta já está cadastrada",
      message: emailHint
        ? `O e-mail ${emailHint} já possui cadastro. Entre com sua senha ou recupere o acesso.`
        : "Este e-mail já possui cadastro. Entre com sua senha ou recupere o acesso.",
    };
  }

  // Caso: sign-ups desabilitados
  if (status === 400 && (msg.includes("signup") || msg.includes("sign-up")) && msg.includes("disabled")) {
    return {
      title: "Novos cadastros indisponíveis",
      message:
        "No momento não estamos aceitando novos cadastros. Tente novamente mais tarde ou entre com uma conta existente.",
    };
  }

  // Caso: token inválido/expirado
  if (status === 400 && (msg.includes("invalid") || msg.includes("expired") || msg.includes("could not verify"))) {
    return {
      title: "Não foi possível validar seu login",
      message: "O link de autenticação expirou ou é inválido. Tente novamente fazendo o login pelo Google.",
    };
  }

  // Fallback genérico
  return {
    title: "Erro na Autenticação",
    message: "Ocorreu um erro ao concluir seu login. Tente novamente em instantes.",
  };
}

export default function GoogleRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<UiError | null>(null);

  // mantém seu comportamento de redirecionar para "/" (ou usa ?next= se vier)
  const nextParam = useMemo(() => {
    if (typeof window === "undefined") return null;
    const p = new URLSearchParams(window.location.search).get("next");
    return p && p.startsWith("/") ? p : null;
  }, []);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        setError(null);

        // Pegar parâmetros da URL (enviados pelo Strapi após autenticação no Google)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token"); // token da Google
        const errorParam = urlParams.get("error");
        const idToken = urlParams.get("id_token"); // só para exibir e-mail na mensagem, se disponível

        console.log("🔍 Google Callback - Processando...");
        console.log("🎫 Token recebido:", accessToken ? "Sim" : "Não");
        console.log("❌ Erro recebido:", errorParam || "Nenhum");

        if (errorParam) {
          setError({
            title: "Erro na Autenticação",
            message: `Erro na autenticação: ${errorParam}`,
          });
          return;
        }

        if (!accessToken) {
          setError({
            title: "Token não recebido",
            message: "Token de acesso não recebido do servidor.",
          });
          return;
        }

        // (Opcional) extrair e-mail do id_token para usar em mensagens
        let emailHint: string | undefined;
        try {
          if (idToken) {
            const payload = JSON.parse(atob(idToken.split(".")[1]));
            if (payload?.email && typeof payload.email === "string") {
              emailHint = payload.email;
            }
          }
        } catch {
          // ignore
        }

        // PASSO OFICIAL: trocar o token da Google pelo JWT do Strapi
        // Endpoint: /api/auth/google/callback?access_token=...
        const callbackRes = await fetch(
          `${authConfig.apiUrl}/api/auth/google/callback?access_token=${encodeURIComponent(accessToken)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );

        if (!callbackRes.ok) {
          // tentar ler JSON; se falhar, cair para texto
          let body: { error?: { message: string } } | string | null = null;
          try {
            body = await callbackRes.json();
          } catch {
            try {
              body = await callbackRes.text();
            } catch {
              body = null;
            }
          }

          console.error("❌ Erro ao obter JWT do Strapi:", callbackRes.status, body);
          const ui = mapStrapiErrorToUI(callbackRes.status, body, emailHint);

          // Ações sugeridas por caso (sem mexer no seu layout, só adicionando botões)
          if (ui.title.includes("já está cadastrada")) {
            ui.ctas = [
              {
                type: "primary",
                label: "Entrar com e-mail e senha",
                onClick: () => router.push(`/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`),
              },
              { type: "secondary", label: "Esqueci minha senha", onClick: () => router.push("/recuperar-senha") },
              { type: "link", label: "Tentar outra conta do Google", onClick: () => router.push("/login?social=google") },
            ];
          } else if (!ui.ctas) {
            ui.ctas = [
              { type: "primary", label: "Tentar novamente", onClick: () => router.push("/login?social=google") },
              { type: "secondary", label: "Voltar ao Início", onClick: () => router.push("/") },
            ];
          }

          setError(ui);
          return;
        }

        const authData = await callbackRes.json(); // { jwt, user }
        if (!authData?.jwt || !authData?.user) {
          setError({
            title: "Resposta inesperada",
            message: "Não foi possível concluir seu login. Tente novamente.",
          });
          return;
        }

        // Persistir credenciais localmente (em produção, prefira cookie httpOnly via rota API)
        localStorage.setItem("auth_token", authData.jwt);
        localStorage.setItem("auth_user", JSON.stringify(authData.user));

        // Opcional: callback global, se existir (mantido do seu código)
        if (
          typeof window !== "undefined" &&
          (window as unknown as { handleGoogleAuthSuccess?: (userData: unknown) => void }).handleGoogleAuthSuccess
        ) {
          (window as unknown as { handleGoogleAuthSuccess: (userData: unknown) => void }).handleGoogleAuthSuccess(
            authData.user
          );
        }

        console.log("🎉 Login com Google realizado com sucesso!");

        // Redirecionar (usa ?next=/alguma-rota se presente; senão, "/")
        const target = nextParam && nextParam.startsWith("/") ? nextParam : "/";
        router.push(target);
      } catch (error) {
        console.error("💥 Erro no callback do Google:", error);
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        setError({
          title: "Erro na Autenticação",
          message: `Erro ao processar login: ${message}`,
          ctas: [
            { type: "primary", label: "Tentar novamente", onClick: () => router.push("/login?social=google") },
            { type: "secondary", label: "Voltar ao Início", onClick: () => router.push("/") },
          ],
        });
      }
    };

    handleGoogleCallback();
  }, [router, nextParam]);

  // Se houver erro, mostrar mensagem bonita com CTAs
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md p-8">
          <div className="text-yellow-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-3">{error.title}</h1>
          <p className="text-gray-300 mb-6">{error.message}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {error.ctas?.map((cta, i) => {
              const base = "px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto";
              if (cta.type === "primary") {
                return (
                  <button
                    key={i}
                    onClick={cta.onClick}
                    className={`${base} bg-blue-600 hover:bg-blue-700 text-white`}
                  >
                    {cta.label}
                  </button>
                );
              }
              if (cta.type === "secondary") {
                return (
                  <button
                    key={i}
                    onClick={cta.onClick}
                    className={`${base} bg-gray-800 hover:bg-gray-700 text-white/90`}
                  >
                    {cta.label}
                  </button>
                );
              }
              return (
                <button
                  key={i}
                  onClick={cta.onClick}
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
                >
                  {cta.label}
                </button>
              );
            })}

            {!error.ctas && (
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
              >
                Voltar ao Início
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state (mantido)
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
