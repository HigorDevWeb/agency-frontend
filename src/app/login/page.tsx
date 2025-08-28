"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import ConfirmBanner from "@/components/auth/ConfirmBanner"; // ⬅️ ADIÇÃO

export default function LoginPage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authModalType, setAuthModalType] = useState<"login" | "register">("login");

  const handleCloseAuth = () => {
    setShowAuthModal(false);
    router.push('/');
  };

  const handleSwitchAuthMode = () => {
    setAuthModalType(authModalType === "login" ? "register" : "login");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center w-full max-w-md"
      >
        {/* ⬇️ Banner de confirmação/erro com base nos parâmetros da URL */}
        <ConfirmBanner />

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
