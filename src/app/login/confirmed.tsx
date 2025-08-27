
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";


export default function ConfirmedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmEmail } = useAuth();
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('Confirmando email...');

  useEffect(() => {
    const confirmationToken = searchParams.get('confirmation');
    if (!confirmationToken) {
      setStatus('error');
      setMessage('Token de confirmação não encontrado.');
      return;
    }
    // Tenta confirmar o email
    confirmEmail(confirmationToken)
      .then(() => {
        setStatus('success');
        setMessage('Seu email foi confirmado com sucesso! Você já pode acessar sua conta.');
        // Redireciona para dashboard após alguns segundos
        setTimeout(() => {
          router.push('/dashboard');
        }, 3500);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.message || 'Erro ao confirmar email.');
      });
  }, [searchParams, confirmEmail, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-700">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            {status === 'success' && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {status === 'loading' && (
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            )}
          </motion.div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            {status === 'success' ? 'Email confirmado!' : status === 'error' ? 'Erro na confirmação' : 'Confirmando...'}
          </h1>
          <p className="text-gray-300 leading-relaxed mb-4">
            {message}
          </p>
          {status === 'success' && (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Ir para Dashboard
            </button>
          )}
          {status === 'error' && (
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300"
            >
              Ir para Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
