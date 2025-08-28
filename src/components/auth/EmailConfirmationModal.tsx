"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function EmailConfirmationModal({
  isOpen,
  onClose,
  email,
}: EmailConfirmationModalProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const authService = await import("@/services/authService");
      await authService.default.resendEmailConfirmation(email);
      setResendSuccess(true);
      
      // Resetar o estado de sucesso após 3 segundos
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao reenviar e-mail";
      setResendError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-3xl p-8 w-full max-w-md relative overflow-hidden border border-gray-700"
          >
            {/* Background animated gradient */}
            <motion.div
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))",
                  "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1))",
                  "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 opacity-50"
            />

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>

            <div className="relative z-10">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
                >
                  <span className="text-white font-bold text-3xl">📧</span>
                </motion.div>

                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-3">
                  Verifique seu E-mail
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Enviamos um link de confirmação para
                </p>
                <p className="text-blue-400 font-semibold text-lg mt-1">
                  {email}
                </p>
              </motion.div>

              {/* Main message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 border border-gray-600 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-start space-x-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <span className="text-white font-bold text-xl">✓</span>
                  </motion.div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      Quase lá! 🎉
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Clique no link que enviamos para <strong className="text-blue-400">{email}</strong> para confirmar sua conta e começar a usar a plataforma.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 mb-6"
              >
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
                  <span>Abra seu e-mail</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
                  <span>Procure por uma mensagem nossa (verifique o spam também)</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">3</span>
                  <span>Clique no link de confirmação</span>
                </div>
              </motion.div>

              {/* Success/Error messages for resend */}
              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4"
                >
                  <p className="text-green-400 text-sm text-center font-medium">
                    ✅ E-mail reenviado com sucesso! Verifique sua caixa de entrada.
                  </p>
                </motion.div>
              )}

              {resendError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4"
                >
                  <p className="text-red-400 text-sm text-center">{resendError}</p>
                </motion.div>
              )}

              {/* Resend button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden mb-4"
              >
                {isResending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Reenviando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>📧</span>
                    <span>Reenviar E-mail</span>
                  </div>
                )}

                {isResending && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                )}
              </motion.button>

              {/* Footer actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center space-y-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={onClose}
                  className="text-gray-400 hover:text-white text-sm transition-colors block mx-auto"
                >
                  Fechar esta janela
                </motion.button>
                
                <p className="text-xs text-gray-500">
                  Não recebeu o e-mail? Verifique sua pasta de spam ou clique em &quot;Reenviar E-mail&quot;
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
