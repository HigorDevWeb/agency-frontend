"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  // Tipo para os itens do menu
  type MenuItem = {
    icon: string;
    label: string;
    action: () => void;
  };

  const menuItems: MenuItem[] = [
    // Temporariamente desativado - Meu Perfil
    // { 
    //   icon: "👤", 
    //   label: "Meu Perfil", 
    //   action: () => {
    //     // router.push("/profile");
    //     setIsOpen(false);
    //   }
    // },
    // Temporariamente desativado - Minhas Candidaturas
    // {
    //   icon: "💼",
    //   label: "Minhas Candidaturas",
    //   action: () => {
    //     // router.push("/applications");
    //     setIsOpen(false);
    //   }
    // }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors active:bg-gray-800/70 touch-manipulation"
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="relative">
          <Image
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`}
            alt={user.name}
            width={32}
            height={32}
            className="rounded-full border-2 border-blue-500"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"
          />
        </motion.div>

        <div className="hidden md:block text-left">
          <p className="text-white text-sm font-medium">{user.name}</p>
          <p className="text-gray-400 text-xs capitalize">{user.userType}</p>
        </div>

        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 md:w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[9999]"
          >
            {/* Profile Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Image
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-blue-500"
                />
                <div>
                  <h3 className="text-white font-semibold">{user.name}</h3>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-400 text-xs capitalize">
                      {user.userType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    x: 5,
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  }}
                  onClick={() => {
                    item.action();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:text-white transition-all duration-200"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700"></div>

            {/* Logout Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-400 hover:text-red-300 transition-all duration-200"
            >
              <span className="text-lg">🚪</span>
              <span className="text-sm">Sair</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
