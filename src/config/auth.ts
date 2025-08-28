// Configurações de autenticação

export const authConfig = {
  // URL base do backend Strapi
  apiUrl: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.recruitings.info',
  // URL do frontend para redirecionamento
  frontendUrl: process.env.NEXTAUTH_URL || 'https://www.topdevjobs.tech',
  // URL de callback do Google OAuth (para referência, usada no backend)
  googleCallbackUrl: 'https://api.recruitings.info/api/connect/google/callback'
};

export default authConfig;
