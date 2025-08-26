"use client";

import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LOCALE_INFO } from '@/lib/api';

export default function LanguageManager() {
  const { language } = useLanguage();

  useEffect(() => {
    // Atualizar o atributo lang do HTML baseado no idioma selecionado
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      htmlElement.lang = LOCALE_INFO[language]?.fullCode || 'pt-BR';
      
      // Adicionar atributo de data-locale para uso em CSS se necessário
      document.body.setAttribute('data-locale', language);
    }
  }, [language]);

  return null; // Este componente não renderiza nada
} 