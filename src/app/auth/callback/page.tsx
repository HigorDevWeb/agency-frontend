"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Pegar o token da URL (que vem do Strapi)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        
        if (accessToken) {
          // Usar o método do contexto que já existe
          await loginWithGoogle();
          // Redirecionar para dashboard ou página anterior
          router.push('/dashboard');
        } else {
          // Se não tem token, algo deu errado
          console.error('Token não encontrado na URL');
          router.push('/');
        }
      } catch (error) {
        console.error('Erro no callback do Google:', error);
        router.push('/');
      }
    };

    handleCallback();
  }, [router, loginWithGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-white mt-4">Processando login...</p>
      </div>
    </div>
  );
}
