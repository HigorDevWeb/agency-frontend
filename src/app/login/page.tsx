"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">("login");
  const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    const confirmationCode = searchParams.get('confirmation');
    
    const handleEmailConfirmation = async (confirmationCode: string) => {
      setConfirmationStatus('loading');
      
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
          
          setConfirmationStatus('success');
          setMessage('Email confirmado com sucesso! Redirecionando...');
          
          // Atualizar o contexto de autenticação
          await refreshProfile();
          
          // Redirecionar após 2 segundos
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          throw new Error('Resposta inválida do servidor');
        }

      } catch (error) {
        console.error('Erro na confirmação:', error);
        setConfirmationStatus('error');
        
        if (error instanceof Error) {
          if (error.message.includes('expired') || error.message.includes('expirado')) {
            setMessage('O link de confirmação expirou. Tente fazer login e solicitar um novo email.');
          } else if (error.message.includes('already confirmed') || error.message.includes('já confirmado')) {
            setMessage('Este email já foi confirmado. Você pode fazer login normalmente.');
          } else {
            setMessage('Erro na confirmação: ' + error.message);
          }
        } else {
          setMessage('Erro inesperado durante a confirmação.');
        }
        
        // Mostrar modal de login após 3 segundos
        setTimeout(() => {
          setConfirmationStatus(null);
          setShowAuthModal(true);
          setAuthModalType("login");
        }, 3000);
      }
    };
    
    // Se veio do link de confirmação do email
    if (confirmed === 'true' && confirmationCode) {
      handleEmailConfirmation(confirmationCode);
    } else if (confirmed === 'true') {
      // Mostrar modal de login direto
      setShowAuthModal(true);
      setAuthModalType("login");
    } else {
      // Comportamento normal - mostrar modal de login
      setShowAuthModal(true);
      setAuthModalType("login");
    }
  }, [searchParams, router, refreshProfile]);

  const handleCloseAuth = () => {
    setShowAuthModal(false);
    router.push('/');
  };

  const handleSwitchAuthMode = () => {
    setAuthModalType(authModalType === "login" ? "register" : "login");
  };

  // Se está processando confirmação, mostrar tela de loading/sucesso/erro
  if (confirmationStatus) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-700">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-6"
            >
              {confirmationStatus === 'loading' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              )}
              {confirmationStatus === 'success' && (
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
              )}
              {confirmationStatus === 'error' && (
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
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-3xl font-bold mb-4 bg-gradient-to-r ${
                confirmationStatus === 'loading' ? 'from-blue-500 to-cyan-500' :
                confirmationStatus === 'success' ? 'from-green-500 to-emerald-500' :
                'from-red-500 to-pink-500'
              } bg-clip-text text-transparent`}
            >
              {confirmationStatus === 'loading' && 'Confirmando...'}
              {confirmationStatus === 'success' && 'Confirmado!'}
              {confirmationStatus === 'error' && 'Erro na Confirmação'}
            </motion.h1>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-300 leading-relaxed"
            >
              {message}
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Renderizar página normal com modal de login
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Bem-vindo de volta!
        </h1>
        <p className="text-gray-400 mb-8">
          Faça login para acessar sua conta
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAuthModal(true)}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          Fazer Login
        </motion.button>
      </motion.div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuth}
        type={authModalType}
        onSwitchMode={handleSwitchAuthMode}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
