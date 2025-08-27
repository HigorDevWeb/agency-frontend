"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getLoginPage } from "@/lib/login-page/login";
import { getRegisterPage } from "@/lib/register-page/register";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register" | "forgot-password";
  onSwitchMode: () => void;
}

interface LoginData {
  title: string;
  subtitle: string;
  orContinueWithText: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  loginButtonText: string;
  forgotPasswordText: string;
  signupHintText: string;
  signupLinkText: string;
}

interface RegisterData {
  title: string;
  subtitle: string;
  orContinueWithText: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  registerButtonText: string;
  loginHintText: string;
  loginLinkText: string;
  roleSelectPlaceholder: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  type,
  onSwitchMode,
}: AuthModalProps) {
  const { login, register, loginWithGoogle, forgotPassword } = useAuth();
  const [currentType, setCurrentType] = useState<"login" | "register" | "forgot-password">(type);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    userType: "developer",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [registerData, setRegisterData] = useState<RegisterData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync currentType with prop when it changes
  useEffect(() => {
    setCurrentType(type);
  }, [type]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [loginResponse, registerResponse] = await Promise.all([
          getLoginPage(),
          getRegisterPage(),
        ]);

        setLoginData(loginResponse);
        setRegisterData(registerResponse);
      } catch (error) {
        console.error("Erro ao carregar dados do modal:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (currentType === "login") {
        await login(formData.email, formData.password);
        onClose();
      } else if (currentType === "register") {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("As senhas não coincidem");
        }
        
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType as "developer" | "company",
        });
        onClose();
      } else if (currentType === "forgot-password") {
        await forgotPassword(formData.email);
        setSuccessMessage("Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.");
        
        // Limpar formulário e voltar para login após 3 segundos
        setTimeout(() => {
          setFormData({ email: "", password: "", name: "", confirmPassword: "", userType: "developer" });
          setSuccessMessage(null);
          onSwitchMode(); // Volta para login
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const socialButtons = [
    { 
      name: "Google", 
      icon: "🔗", 
      color: "from-red-500 to-red-600", 
      onClick: handleGoogleLogin,
      isActive: true 
    },
    { 
      name: "GitHub", 
      icon: "🐙", 
      color: "from-gray-700 to-gray-800", 
      onClick: () => {}, // Placeholder para futuras implementações
      isActive: false 
    },
    { 
      name: "LinkedIn", 
      icon: "💼", 
      color: "from-blue-600 to-blue-700", 
      onClick: () => {}, // Placeholder para futuras implementações
      isActive: false 
    },
  ];

  // Dados atuais baseados no tipo
  const currentData = currentType === "login" || currentType === "forgot-password" ? loginData : registerData;

  // Se ainda está carregando os dados, mostrar loading
  if (isLoadingData) {
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
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

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
                  "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
                  "linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))",
                  "linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))",
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
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-white font-bold text-2xl">⚡</span>
                </motion.div>

                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {currentType === "forgot-password" ? "Recuperar Senha" : currentData?.title}
                </h2>
                <p className="text-gray-400 mt-2">
                  {currentType === "forgot-password" ? "Digite seu email para receber o link de recuperação" : currentData?.subtitle}
                </p>
              </motion.div>

              {/* Error and Success Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4"
                >
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4"
                >
                  <p className="text-green-400 text-sm text-center">{successMessage}</p>
                </motion.div>
              )}

              {/* Social login - only show for login and register */}
              {currentType !== "forgot-password" && (
                <>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-3 mb-6"
                  >
                    {socialButtons.map((social, index) => (
                      <motion.button
                        key={social.name}
                        whileHover={social.isActive ? { scale: 1.05, y: -2 } : {}}
                        whileTap={social.isActive ? { scale: 0.95 } : {}}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        onClick={social.isActive ? social.onClick : undefined}
                        disabled={!social.isActive}
                        className={`bg-gradient-to-r ${social.color} p-3 rounded-lg text-white font-medium text-sm hover:shadow-lg transition-all duration-300 ${
                          !social.isActive ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                        }`}
                        type="button"
                      >
                        <span className="text-lg">{social.icon}</span>
                      </motion.button>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center mb-6"
                  >
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="px-4 text-gray-400 text-sm">
                      {currentData?.orContinueWithText}
                    </span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </motion.div>
                </>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {currentType === "register" && registerData && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.input
                      whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                      type="text"
                      name="name"
                      placeholder={registerData.namePlaceholder}
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      required
                    />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: currentType === "register" ? 0.6 : 0.5 }}
                >
                  <motion.input
                    whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                    type="email"
                    name="email"
                    placeholder={currentType === "forgot-password" ? "Digite seu email" : currentData?.emailPlaceholder}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                  />
                </motion.div>

                {currentType !== "forgot-password" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: currentType === "register" ? 0.7 : 0.6 }}
                  >
                    <motion.input
                      whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                      type="password"
                      name="password"
                      placeholder={currentData?.passwordPlaceholder}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      required
                    />
                  </motion.div>
                )}

                {currentType === "register" && registerData && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                        type="password"
                        name="confirmPassword"
                        placeholder={registerData.confirmPasswordPlaceholder}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <motion.select
                        whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      >
                        <option value="developer">{registerData.roleSelectPlaceholder}</option>
                        <option value="company">Empresa</option>
                      </motion.select>
                    </motion.div>
                  </>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: currentType === "register" ? 1 : 0.7 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : currentType === "login" ? (
                    loginData?.loginButtonText
                  ) : currentType === "register" ? (
                    registerData?.registerButtonText
                  ) : (
                    "Enviar Email de Recuperação"
                  )}

                  {isLoading && (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                  )}
                </motion.button>
              </form>

              {currentType === "login" && loginData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setCurrentType("forgot-password")}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    {loginData.forgotPasswordText}
                  </motion.button>
                </motion.div>
              )}

              {currentType === "forgot-password" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setCurrentType("login")}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Voltar ao login
                  </motion.button>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center mt-6 pt-6 border-t border-gray-700"
              >
                <span className="text-gray-400">
                  {currentType === "login"
                    ? loginData?.signupHintText
                    : registerData?.loginLinkText}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={onSwitchMode}
                  className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {currentType === "login"
                    ? loginData?.signupLinkText
                    : registerData?.loginHintText}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}