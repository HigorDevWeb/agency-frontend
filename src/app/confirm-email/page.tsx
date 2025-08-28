"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "@/services/authService";
import Link from "next/link";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Aceitar tanto 'confirmation' quanto 'code' como parâmetros
  const confirmationToken = searchParams.get("confirmation") || searchParams.get("code");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "idle"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (confirmationToken) {
      setStatus("loading");
      setMessage("Confirmando seu e-mail, por favor aguarde...");

      const confirm = async () => {
        try {
          await authService.confirmEmail(confirmationToken);
          setStatus("success");
          setMessage(
            "E-mail confirmado com sucesso! Sua conta foi ativada e você já está logado. Você será redirecionado para o painel em breve."
          );

          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } catch (error: unknown) {
          setStatus("error");
          if (error instanceof Error) {
            setMessage(
              error.message ||
                "Ocorreu um erro ao confirmar seu e-mail. O link pode ser inválido ou ter expirado."
            );
          } else {
            setMessage(
              "Ocorreu um erro desconhecido ao confirmar seu e-mail."
            );
          }
        }
      };

      confirm();
    } else {
      setStatus("error");
      setMessage("Token de confirmação não encontrado. Verifique o link em seu e-mail.");
    }
  }, [confirmationToken, router]);

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-xl max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Confirmação de E-mail</h1>
        {status === "loading" && (
          <div className="flex justify-center items-center my-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        <p className={`text-lg ${getStatusColor()}`}>{message}</p>
        {(status === "success" || status === "error") && (
          <div className="mt-6">
            <Link
              href={status === "success" ? "/dashboard" : "/login"}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors"
            >
              {status === "success" ? "Ir para o Painel" : "Tentar Novamente"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
