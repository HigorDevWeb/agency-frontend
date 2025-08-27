"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";

function EmailConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      const confirmationCode = searchParams.get('confirmation');
      
      if (!confirmationCode) {
        setStatus('invalid');
        setMessage('Código de confirmação não fornecido ou inválido.');
        return;
      }

      try {
        // Fazer a confirmação via API do Strapi
        const response = await fetch(`https://api.recruitings.info/api/auth/email-confirmation?confirmation=${confirmationCode}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Erro na confirmação');
        }

        const data = await response.json();
        
        // Se a confirmação foi bem-sucedida, o Strapi retorna JWT e user
        if (data.jwt && data.user) {
          // Salvar as informações de autenticação
          localStorage.setItem('auth_token', data.jwt);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          
          setStatus('success');
          setMessage('Email confirmado com sucesso! Redirecionando...');
          
          // Atualizar o contexto de autenticação
          await refreshProfile();
          
          // Redirecionar após 3 segundos
          setTimeout(() => {
            setIsRedirecting(true);
            router.push('/dashboard');
          }, 3000);
        } else {
          throw new Error('Resposta inválida do servidor');
        }

      } catch (error) {
        console.error('Erro na confirmação:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('expired') || error.message.includes('expirado')) {
            setStatus('expired');
            setMessage('O link de confirmação expirou. Solicite um novo email de confirmação.');
          } else if (error.message.includes('already confirmed') || error.message.includes('já confirmado')) {
            setStatus('success');
            setMessage('Este email já foi confirmado anteriormente.');
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
          } else {
            setStatus('error');
            setMessage(error.message);
          }
        } else {
          setStatus('error');
          setMessage('Erro inesperado durante a confirmação.');
        }
      }
    };

    confirmEmail();
  }, [searchParams, router, refreshProfile]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        );
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        );
      case 'error':
      case 'expired':
      case 'invalid':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'from-blue-500 to-cyan-500';
      case 'success':
        return 'from-green-500 to-emerald-500';
      case 'error':
      case 'expired':
      case 'invalid':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirmando seu email...';
      case 'success':
        return 'Email Confirmado!';
      case 'expired':
        return 'Link Expirado';
      case 'invalid':
        return 'Link Inválido';
      case 'error':
        return 'Erro na Confirmação';
      default:
        return '';
    }
  };

  const handleResendConfirmation = async () => {
    // Implementar lógica para reenviar email de confirmação
    // Por enquanto, redirecionar para a página de login
    router.push('/');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        {/* Background animated gradient */}
        <motion.div
          animate={{
            background: [
              `linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))`,
              `linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))`,
              `linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))`,
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 opacity-50 rounded-3xl"
        />

        <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 relative z-10">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-6"
          >
            {getStatusIcon()}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-3xl font-bold mb-4 bg-gradient-to-r ${getStatusColor()} bg-clip-text text-transparent`}
          >
            {getTitle()}
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-300 mb-8 leading-relaxed"
          >
            {message}
          </motion.p>

          {/* Loading indicator for redirect */}
          {isRedirecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
                />
                <span className="text-sm">Redirecionando...</span>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            {status === 'success' && !isRedirecting && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoToDashboard}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
              >
                Ir para Dashboard
              </motion.button>
            )}

            {(status === 'expired' || status === 'error') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResendConfirmation}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Solicitar Novo Email
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className="w-full py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 hover:text-white transition-all duration-300"
            >
              Voltar ao Início
            </motion.button>
          </motion.div>

          {/* Additional Info */}
          {status === 'expired' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
            >
              <p className="text-yellow-400 text-sm">
                💡 <strong>Dica:</strong> Links de confirmação expiram em 24 horas por segurança. Solicite um novo link e confirme o mais rápido possível.
              </p>
            </motion.div>
          )}

          {status === 'invalid' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <p className="text-red-400 text-sm">
                ⚠️ <strong>Atenção:</strong> Verifique se você clicou no link correto recebido por email ou se o link não foi alterado.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    }>
      <EmailConfirmContent />
    </Suspense>
  );
}
