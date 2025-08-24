"use client";

import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageManager() {
  const { language } = useLanguage();

  useEffect(() => {
    // Atualizar o atributo lang do HTML baseado no idioma selecionado
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      const langMap = {
        'pt': 'pt-BR',
        'en': 'en-US',
        'es': 'es-ES'
      };
      
      htmlElement.lang = langMap[language] || 'pt-BR';
    }
  }, [language]);

  return null; // Este componente não renderiza nada
} 