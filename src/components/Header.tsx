// src/components/Header.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import AuthModal from "./auth/AuthModal";
import UserProfileDropdown from "./user/UserProfileDropDown";
import LanguageSelector from "./LanguageSelector";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getHeaderInfo, HeaderInfo } from "@/lib/header-info/getHeaderInfo";

export default function Header() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerData, setHeaderData] = useState<HeaderInfo | null>(null);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    type: "login" | "register";
  }>({
    isOpen: false,
    type: "login",
  });

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [0.9, 1]);

  // Effect to handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to fetch header data from Strapi based on the current language
  useEffect(() => {
    async function loadHeaderData() {
      setHeaderData(null); // Reset data to show loading state on language change
      const data = await getHeaderInfo(language);
      setHeaderData(data);
    }
    loadHeaderData();
  }, [language]);

  const openAuthModal = (type: "login" | "register") => {
    setAuthModal({ isOpen: true, type });
    setIsOpen(false);
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, type: "login" });
  };

  const switchAuthMode = () => {
    setAuthModal(prev => ({
      isOpen: true,
      type: prev.type === "login" ? "register" : "login",
    }));
  };

  // Derive menu items and button texts from headerData state
  const menuItems = headerData?.menu?.filter(item => item.href !== null) || [];
  
  const loginButtonText = headerData?.menu?.find(item => 
    item.href === null && (item.label.toLowerCase().trim().includes('login') || item.label.toLowerCase().trim().includes('entrar'))
  )?.label;

  const registerButtonText = headerData?.menu?.find(item => 
    item.href === null && (item.label.toLowerCase().trim().includes('sign') || item.label.toLowerCase().trim().includes('cadastr') || item.label.toLowerCase().trim().includes('regist'))
  )?.label;

  const profileButtonText = headerData?.profileButtonText;
  const logoutButtonText = headerData?.logoutButtonText;

  // Render a skeleton header while data is loading to prevent UI from disappearing
  if (!headerData) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/80 backdrop-blur-lg border-b border-gray-800`}>
           <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-2">
                      <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                        >
                          <span className="text-white font-bold text-xl">⚡</span>
                        </motion.div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DevJobs</span>
                  </div>
                  <div className="flex items-center space-x-4">
                      <LanguageSelector />
                  </div>
              </div>
          </nav>
      </header>
    );
  }

  return (
    <>
      <motion.header
        style={{ opacity }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-black/80 backdrop-blur-lg border-b border-gray-800"
            : "bg-transparent"
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">⚡</span>
              </motion.div>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent cursor-pointer logo-label"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {headerData.logoLabel || 'DevJobs'}
              </motion.span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={item.href!}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.1,
                      color: "#60a5fa",
                      transition: { duration: 0.2 },
                    }}
                    className="text-gray-300 hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors duration-200 relative group"
                  >
                    {item.label}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Auth buttons and language selector */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSelector />
              
              {user ? (
                <UserProfileDropdown />
              ) : (
                <>
                  {loginButtonText && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openAuthModal("login")}
                      className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors relative overflow-hidden group"
                    >
                      <span className="relative z-10">{loginButtonText}</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.1 }}
                      />
                    </motion.button>
                  )}

                  {registerButtonText && (
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 25px rgba(59, 130, 246, 0.4)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openAuthModal("register")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden group"
                    >
                      <span className="relative z-10">{registerButtonText}</span>
                      <motion.div
                        className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </motion.button>
                  )}
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSelector />
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white focus:outline-none p-2"
              >
                <motion.div
                  animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isOpen ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-black/95 backdrop-blur-lg border-t border-gray-800 overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.id}
                href={item.href!}
                initial={{ opacity: 0, x: -20 }}
                animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-blue-400 px-3 py-2 text-base font-medium transition-colors"
              >
                {item.label}
              </motion.a>
            ))}

            <div className="pt-4 space-y-3 border-t border-gray-700">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <Image
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-blue-500"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {user.name}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">
                        {user.userType}
                      </p>
                    </div>
                  </div>

                  {profileButtonText && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        // Add profile navigation logic here
                        setIsOpen(false);
                      }}
                      className="block w-full text-left text-gray-300 hover:text-white px-3 py-3 text-base font-medium bg-gray-800/50 rounded-lg transition-all duration-300"
                    >
                      {profileButtonText}
                    </motion.button>
                  )}

                  {logoutButtonText && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left text-red-400 hover:text-red-300 px-3 py-3 text-base font-medium bg-red-500/10 rounded-lg transition-all duration-300"
                    >
                      {logoutButtonText}
                    </motion.button>
                  )}
                </div>
              ) : (
                <>
                  {loginButtonText && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openAuthModal("login")}
                      className="block w-full text-left text-gray-300 hover:text-white px-3 py-3 text-base font-medium bg-gray-800/50 rounded-lg transition-all duration-300"
                    >
                      {loginButtonText}
                    </motion.button>
                  )}

                  {registerButtonText && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openAuthModal("register")}
                      className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-3 rounded-lg text-base font-medium"
                    >
                      {registerButtonText}
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        type={authModal.type}
        onSwitchMode={switchAuthMode}
      />
    </>
  );
}
