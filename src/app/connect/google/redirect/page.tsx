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
        
        // Pegar o access_token da URL (que vem do Strapi após autenticação com Google)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const errorParam = urlParams.get('error');
        
        console.log('🔍 Google Callback - Processando...');
        console.log('🎫 Token recebido:', accessToken ? 'Sim' : 'Não');
        console.log('❌ Erro recebido:', errorParam || 'Nenhum');
        
        if (errorParam) {
          console.error('❌ Erro no callback do Google:', errorParam);
          setError(`Erro na autenticação: ${errorParam}`);
          return;
        }
        
        if (!accessToken) {
          console.error('❌ Token não encontrado na URL');
          setError('Token de acesso não recebido do servidor');
          return;
        }

        // Salvar o token no localStorage
        localStorage.setItem('auth_token', accessToken);
        
        // Buscar dados do usuário do Strapi
        console.log('👤 Buscando dados do usuário...');
        const response = await fetch(`${authConfig.apiUrl}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro ao buscar dados do usuário:', response.status, errorText);
          throw new Error(`Erro ao buscar dados do usuário: ${response.status}`);
        }

        const userData = await response.json();
        console.log('✅ Dados do usuário recebidos:', {
          id: userData.id,
          username: userData.username,
          email: userData.email
        });
        
        // Salvar usuário no localStorage  
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        // Usar função global para atualizar o contexto
        if (typeof window !== 'undefined' && (window as unknown as { handleGoogleAuthSuccess?: (userData: unknown) => void }).handleGoogleAuthSuccess) {
          (window as unknown as { handleGoogleAuthSuccess: (userData: unknown) => void }).handleGoogleAuthSuccess(userData);
        }
        
        console.log('🎉 Login com Google realizado com sucesso!');
        
        // Redirecionar para dashboard após sucesso
        router.push('/dashboard');
        
      } catch (error) {
        console.error('💥 Erro no callback do Google:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
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
            onClick={() => router.push('/')}
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
        <p className="text-white mt-4 text-xl font-medium">Processando login com Google...</p>
        <p className="text-gray-400 mt-2">Aguarde enquanto validamos suas credenciais</p>
      </div>
    </div>
  );
}
