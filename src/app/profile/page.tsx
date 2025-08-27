"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LoadingScreen from "@/components/LoadingScreen";
import authService from "@/services/authService";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: ""
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("🖼️ Arquivo selecionado:", { name: file.name, size: file.size, type: file.type });

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(language === 'en' ? 'File size must be less than 5MB' : 'O arquivo deve ter menos de 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage(language === 'en' ? 'Please select an image file' : 'Por favor, selecione um arquivo de imagem');
      return;
    }

    setUploading(true);
    setErrorMessage("");

    try {
      console.log("🚀 Iniciando upload...");
      
      // Upload do arquivo para o Strapi (já associa ao usuário automaticamente)
      const uploadResult = await authService.uploadFile(file);
      
      console.log("✅ Upload finalizado:", uploadResult);
      
      // Atualizar o estado local com a URL da imagem
      setProfileData(prev => ({
        ...prev,
        avatar: uploadResult.url
      }));

      console.log("📸 Avatar atualizado no estado local");

      // Mostrar mensagem de sucesso temporária
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (error) {
      console.error('💥 Erro no upload:', error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : (language === 'en' ? 'Error uploading image' : 'Erro ao fazer upload da imagem')
      );
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setErrorMessage("");

    try {
      // Validate fields
      if (!profileData.name.trim()) {
        throw new Error(language === 'en' ? 'Name is required' : 'Nome é obrigatório');
      }

      if (!profileData.email.trim()) {
        throw new Error(language === 'en' ? 'Email is required' : 'Email é obrigatório');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        throw new Error(language === 'en' ? 'Please enter a valid email' : 'Por favor, insira um email válido');
      }

      // Update profile
      await updateProfile(profileData);

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">
            {language === 'en' ? 'Manage your account settings and personal information' : 'Gerencie suas configurações de conta e informações pessoais'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="p-8 bg-gradient-to-r from-gray-800 to-gray-700">
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
                onClick={handleAvatarClick}
              >
                {uploading ? (
                  <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <Image
                    src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="rounded-full border-4 border-blue-500 transition-all duration-300 group-hover:border-purple-500"
                  />
                )}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                    {language === 'en' ? 'Change Photo' : 'Alterar Foto'}
                  </span>
                </div>
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-300">{user.email}</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-400 text-sm capitalize">{user.userType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            {/* Success Message */}
            <AnimatePresence>
              {showSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4"
                >
                  <p className="text-green-400 text-sm">
                    {language === 'en' ? 'Profile updated successfully!' : 'Perfil atualizado com sucesso!'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4"
                >
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Full Name' : 'Nome Completo'}
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder={language === 'en' ? 'Enter your full name' : 'Digite seu nome completo'}
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Email Address' : 'Endereço de Email'}
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder={language === 'en' ? 'Enter your email address' : 'Digite seu endereço de email'}
              />
            </motion.div>

            {/* Password Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="border-t border-gray-700 pt-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {language === 'en' ? 'Password' : 'Senha'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {language === 'en' ? 'Update your password to keep your account secure' : 'Atualize sua senha para manter sua conta segura'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {language === 'en' ? 'Change Password' : 'Alterar Senha'}
                </motion.button>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {language === 'en' ? 'Saving...' : 'Salvando...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {language === 'en' ? 'Save Changes' : 'Salvar Alterações'}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <PasswordChangeModal
            language={language}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={() => {
              setShowPasswordModal(false);
              setShowSuccessMessage(true);
              setTimeout(() => setShowSuccessMessage(false), 3000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Password Change Modal Component
function PasswordChangeModal({
  language,
  onClose,
  onSuccess,
}: {
  language: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error(language === 'en' ? 'Passwords do not match' : 'As senhas não coincidem');
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error(language === 'en' ? 'Password must be at least 6 characters' : 'A senha deve ter pelo menos 6 caracteres');
      }

      // Call API to change password
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
        passwordConfirmation: passwordData.confirmPassword,
      });

      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-gray-800 rounded-xl shadow-2xl"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            {language === 'en' ? 'Change Password' : 'Alterar Senha'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Current Password' : 'Senha Atual'}
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'New Password' : 'Nova Senha'}
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Confirm New Password' : 'Confirmar Nova Senha'}
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (language === 'en' ? 'Changing...' : 'Alterando...') : (language === 'en' ? 'Change' : 'Alterar')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}