"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getLoginPage } from "@/lib/login-page/login";
import { getRegisterPage } from "@/lib/register-page/register";
import { useAuth } from "@/context/AuthContext";
import EmailConfirmationModal from "./EmailConfirmationModal";

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
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Sync currentType with prop when it changes
  useEffect(() => {
    setCurrentType(type);
    // Limpar mensagens e estados quando o tipo muda
    setError(null);
    setForgotPasswordSuccess(false);
    setShowEmailConfirmationModal(false);
    setConfirmationEmail("");
    setFieldErrors({});
  }, [type]);

  // Funções de validação em tempo real
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "O nome é obrigatório";
        if (value.length < 2) return "O nome deve ter pelo menos 2 caracteres";
        return null;
      
      case 'email':
        if (!value.trim()) return "O e-mail é obrigatório";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Digite um e-mail válido";
        return null;
      
      case 'password':
        if (!value) return "A senha é obrigatória";
        if (value.length < 6) return "A senha deve ter pelo menos 6 caracteres";
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        if (!hasLetter || !hasNumber) return "A senha deve conter pelo menos uma letra e um número";
        return null;
      
      case 'confirmPassword':
        if (!value) return "Confirme sua senha";
        if (value !== formData.password) return "As senhas não coincidem";
        return null;
      
      default:
        return null;
    }
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

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

    try {
      // Validação completa do formulário antes de enviar
      if (currentType === "register") {
        const errors: typeof fieldErrors = {};
        
        // Validar todos os campos
        const nameError = validateField('name', formData.name);
        const emailError = validateField('email', formData.email);
        const passwordError = validateField('password', formData.password);
        const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
        
        if (nameError) errors.name = nameError;
        if (emailError) errors.email = emailError;
        if (passwordError) errors.password = passwordError;
        if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
        
        // Se há erros, mostrar todos e parar
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          throw new Error("Por favor, corrija os erros no formulário antes de continuar.");
        }
      } else if (currentType === "login") {
        const errors: typeof fieldErrors = {};
        
        const emailError = validateField('email', formData.email);
        const passwordError = formData.password ? null : "A senha é obrigatória";
        
        if (emailError) errors.email = emailError;
        if (passwordError) errors.password = passwordError;
        
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          throw new Error("Por favor, preencha todos os campos corretamente.");
        }
      } else if (currentType === "forgot-password") {
        const emailError = validateField('email', formData.email);
        if (emailError) {
          setFieldErrors({ email: emailError });
          throw new Error("Por favor, digite um e-mail válido.");
        }
      }

      if (currentType === "login") {
        await login(formData.email, formData.password);
        onClose();
      } else if (currentType === "register") {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: "developer", // Sempre developer como padrão
        });
        
        // Verificar se o usuário foi automaticamente logado (sem confirmação de email)
        // ou se precisa confirmar email primeiro
        if (window.localStorage.getItem("auth_token")) {
          // Login automático aconteceu - fechar modal
          onClose();
        } else {
          // Precisa confirmar email - mostrar modal de confirmação
          setConfirmationEmail(formData.email);
          setShowEmailConfirmationModal(true);
        }
        
        // Limpar formulário
        setFormData({
          email: "",
          password: "",
          name: "",
          confirmPassword: "",
          userType: "developer",
        });
        setFieldErrors({});
      } else if (currentType === "forgot-password") {
        await forgotPassword(formData.email);
        setForgotPasswordSuccess(true);
        
        // Limpar formulário e voltar para login após mostrar sucesso
        setTimeout(() => {
          setFormData({ email: "", password: "", name: "", confirmPassword: "", userType: "developer" });
          setForgotPasswordSuccess(false);
          onSwitchMode(); // Volta para login
        }, 3000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
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
    <>
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

                {/* Error Messages */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4"
                  >
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </motion.div>
                )}

                {/* Forgot Password Success Message */}
                {forgotPasswordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4"
                  >
                    <p className="text-green-400 text-sm text-center">
                      Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.
                    </p>
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
                      className="space-y-2"
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                        type="text"
                        name="name"
                        placeholder={registerData.namePlaceholder}
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleFieldBlur}
                        className={`w-full p-4 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                          fieldErrors.name ? 'border-red-500' : 'border-gray-600'
                        }`}
                        required
                      />
                      {fieldErrors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm ml-1"
                        >
                          {fieldErrors.name}
                        </motion.p>
                      )}
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: currentType === "register" ? 0.6 : 0.5 }}
                    className="space-y-2"
                  >
                    <motion.input
                      whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                      type="email"
                      name="email"
                      placeholder={currentType === "forgot-password" ? "Digite seu email" : currentData?.emailPlaceholder}
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleFieldBlur}
                      className={`w-full p-4 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                        fieldErrors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                      required
                    />
                    {fieldErrors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm ml-1"
                      >
                        {fieldErrors.email}
                      </motion.p>
                    )}
                  </motion.div>

                  {currentType !== "forgot-password" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: currentType === "register" ? 0.7 : 0.6 }}
                      className="space-y-2"
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                        type="password"
                        name="password"
                        placeholder={currentData?.passwordPlaceholder}
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleFieldBlur}
                        className={`w-full p-4 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                          fieldErrors.password ? 'border-red-500' : 'border-gray-600'
                        }`}
                        required
                      />
                      {fieldErrors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm ml-1"
                        >
                          {fieldErrors.password}
                        </motion.p>
                      )}
                    </motion.div>
                  )}

                  {currentType === "register" && registerData && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="space-y-2"
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                        type="password"
                        name="confirmPassword"
                        placeholder={registerData.confirmPasswordPlaceholder}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleFieldBlur}
                        className={`w-full p-4 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                          fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                        }`}
                        required
                      />
                      {fieldErrors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm ml-1"
                        >
                          {fieldErrors.confirmPassword}
                        </motion.p>
                      )}
                    </motion.div>
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

      {/* Email Confirmation Modal - Separate AnimatePresence */}
      <EmailConfirmationModal
        isOpen={showEmailConfirmationModal}
        onClose={() => {
          setShowEmailConfirmationModal(false);
          onClose(); // Também fecha o modal principal
        }}
        email={confirmationEmail}
      />
    </>
  );
}