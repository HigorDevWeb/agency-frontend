"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traduções
const translations = {
  pt: {
    // Header
    'header.login': 'Login',
    'header.register': 'Cadastrar',
    'header.profile': 'Meu Perfil',
    'header.logout': 'Sair',
    
    // Hero Section
    'hero.explore_jobs': 'Explorar Vagas',
    'hero.register_company': 'Cadastrar Empresa',
    
    // Jobs Section
    'jobs.featured_jobs': 'Vagas em Destaque',
    'jobs.opportunities': 'Oportunidades selecionadas para você',
    'jobs.see_all_jobs': 'Ver Todas as Vagas',
    'jobs.see_details': 'Ver Detalhes',
    
    // Tech Stack
    'tech.technologies': 'Tecnologias',
    'tech.description': 'As tecnologias mais utilizadas no mercado',
    
    // Contact
    'contact.contact': 'Contato',
    'contact.description': 'Entre em contato conosco',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro ao carregar dados',
  },
  en: {
    // Header
    'header.login': 'Login',
    'header.register': 'Register',
    'header.profile': 'My Profile',
    'header.logout': 'Logout',
    
    // Hero Section
    'hero.explore_jobs': 'Explore Jobs',
    'hero.register_company': 'Register Company',
    
    // Jobs Section
    'jobs.featured_jobs': 'Featured Jobs',
    'jobs.opportunities': 'Selected opportunities for you',
    'jobs.see_all_jobs': 'See All Jobs',
    'jobs.see_details': 'See Details',
    
    // Tech Stack
    'tech.technologies': 'Technologies',
    'tech.description': 'The most used technologies in the market',
    
    // Contact
    'contact.contact': 'Contact',
    'contact.description': 'Get in touch with us',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error loading data',
  },
  es: {
    // Header
    'header.login': 'Iniciar Sesión',
    'header.register': 'Registrarse',
    'header.profile': 'Mi Perfil',
    'header.logout': 'Cerrar Sesión',
    
    // Hero Section
    'hero.explore_jobs': 'Explorar Trabajos',
    'hero.register_company': 'Registrar Empresa',
    
    // Jobs Section
    'jobs.featured_jobs': 'Trabajos Destacados',
    'jobs.opportunities': 'Oportunidades seleccionadas para ti',
    'jobs.see_all_jobs': 'Ver Todos los Trabajos',
    'jobs.see_details': 'Ver Detalles',
    
    // Tech Stack
    'tech.technologies': 'Tecnologías',
    'tech.description': 'Las tecnologías más utilizadas en el mercado',
    
    // Contact
    'contact.contact': 'Contacto',
    'contact.description': 'Ponte en contacto con nosotros',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error al cargar datos',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Carregar idioma salvo no localStorage apenas no cliente
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = localStorage.getItem('devjobs_language') as Language;
        if (savedLanguage && ['pt', 'en', 'es'].includes(savedLanguage)) {
          setLanguageState(savedLanguage);
        }
      } catch (err) {
        console.warn('Erro ao carregar idioma do localStorage:', err);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('devjobs_language', lang);
      } catch (err) {
        console.warn('Erro ao salvar idioma no localStorage:', err);
      }
    }
  };

  const t = (key: string): string => {
    try {
      const translation = translations[language][key as keyof typeof translations[typeof language]];
      return translation || key;
    } catch {
      console.warn(`Tradução não encontrada para a chave: ${key}`);
      return key;
    }
  };

  const value = {
    language,
    setLanguage,
    t,
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