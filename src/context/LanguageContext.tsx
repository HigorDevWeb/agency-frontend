"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLocale, getBrowserLocale } from '@/lib/api';

interface LanguageContextType {
  language: SupportedLocale;
  setLanguage: (lang: SupportedLocale) => void;
  // O t não será mais usado pois os textos virão diretamente da API com locale
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLocale>('pt');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Carregar idioma do navegador ou localStorage
    const initialLocale = getBrowserLocale();
    setLanguageState(initialLocale);
  }, []);

  const setLanguage = (lang: SupportedLocale) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('devjobs_language', lang);
        
        // Recarregar a página para atualizar todos os conteúdos
        // Alternativa: Usar um estado global para forçar recarregamento dos componentes
        window.location.reload();
      } catch (err) {
        console.warn('Erro ao salvar idioma no localStorage:', err);
      }
    }
  };

  const value = {
    language,
    setLanguage,
  };

  // Evitar hidratação incorreta
  if (!mounted) {
    return (
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 