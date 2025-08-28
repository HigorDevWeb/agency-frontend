"use client";

import authConfig from "@/config/auth";

// Interfaces para tipagem
export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  identifier: string; // email ou username
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  avatar?: string;
}

// Classe para gerenciar autenticação
class AuthService {
  private baseURL = authConfig.apiUrl;
  private tokenKey = "auth_token";
  private userKey = "auth_user";

  // Método para mapear erros do Strapi para mensagens amigáveis
  private mapStrapiError(errorData: unknown): string {
    // Verificar se é um objeto com as propriedades esperadas
    if (typeof errorData === 'object' && errorData !== null) {
      const error = errorData as Record<string, unknown>;
      
      // Se já temos uma mensagem de erro específica
      if (error.error && typeof error.error === 'object' && error.error !== null) {
        const errorObj = error.error as Record<string, unknown>;
        if (typeof errorObj.message === 'string') {
          const strapiError = errorObj.message.toLowerCase();

          // Erros de registro/cadastro
          if (strapiError.includes("email") && strapiError.includes("taken")) {
            return "Este e-mail já está sendo usado. Você já tem uma conta? Tente fazer login ou use outro e-mail.";
          }
          
          if (strapiError.includes("username") && strapiError.includes("taken")) {
            return "Este nome de usuário já está sendo usado. Escolha outro nome.";
          }
          
          if (strapiError.includes("password") && strapiError.includes("short")) {
            return "A senha deve ter pelo menos 6 caracteres.";
          }
          
          if (strapiError.includes("email") && (strapiError.includes("valid") || strapiError.includes("format"))) {
            return "Por favor, digite um e-mail válido.";
          }
          
          // Erros de login
          if (strapiError.includes("invalid") || strapiError.includes("wrong") || strapiError.includes("incorrect")) {
            return "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.";
          }
          
          if (strapiError.includes("blocked")) {
            return "Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.";
          }
          
          if (strapiError.includes("confirmed") || strapiError.includes("confirm")) {
            return "Você precisa confirmar seu e-mail antes de fazer login. Verifique sua caixa de entrada e clique no link de confirmação.";
          }
          
          // Erros de campos obrigatórios
          if (strapiError.includes("username") && strapiError.includes("required")) {
            return "O nome é obrigatório.";
          }
          
          if (strapiError.includes("email") && strapiError.includes("required")) {
            return "O e-mail é obrigatório.";
          }
          
          if (strapiError.includes("password") && strapiError.includes("required")) {
            return "A senha é obrigatória.";
          }
          
          // Erros de rate limiting
          if (strapiError.includes("rate") || strapiError.includes("limit")) {
            return "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
          }
          
          // Retornar a mensagem original se não conseguirmos mapear
          return errorObj.message;
        }
      }
      
      // Formato antigo do Strapi (v3/v4)
      if (Array.isArray(error.message) && error.message.length > 0) {
        const firstMessage = error.message[0];
        if (typeof firstMessage === 'object' && firstMessage !== null) {
          const messageObj = firstMessage as Record<string, unknown>;
          if (Array.isArray(messageObj.messages) && messageObj.messages.length > 0) {
            const firstNestedMessage = messageObj.messages[0];
            if (typeof firstNestedMessage === 'object' && firstNestedMessage !== null) {
              const nestedObj = firstNestedMessage as Record<string, unknown>;
              if (typeof nestedObj.message === 'string') {
                return nestedObj.message;
              }
            }
          }
        }
      }
      
      // Se o erro tem detalhes mais específicos
      if (error.details && typeof error.details === 'object' && error.details !== null) {
        const details = error.details as Record<string, unknown>;
        if (Array.isArray(details.errors) && details.errors.length > 0) {
          const firstError = details.errors[0];
          if (typeof firstError === 'object' && firstError !== null) {
            const errorObj = firstError as Record<string, unknown>;
            if (typeof errorObj.message === 'string') {
              return errorObj.message;
            }
          }
        }
      }
    }
    
    return "Ocorreu um erro inesperado. Tente novamente.";
  }

  // Método para validar dados antes de enviar
  private validateRegisterData(data: RegisterData): string | null {
    if (!data.username?.trim()) {
      return "O nome é obrigatório.";
    }
    
    if (data.username.length < 2) {
      return "O nome deve ter pelo menos 2 caracteres.";
    }
    
    if (!data.email?.trim()) {
      return "O e-mail é obrigatório.";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return "Por favor, digite um e-mail válido.";
    }
    
    if (!data.password) {
      return "A senha é obrigatória.";
    }
    
    if (data.password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }
    
    if (data.password.length > 100) {
      return "A senha deve ter no máximo 100 caracteres.";
    }
    
    // Verificar se a senha tem pelo menos uma letra e um número (opcional, mas recomendado)
    const hasLetter = /[a-zA-Z]/.test(data.password);
    const hasNumber = /\d/.test(data.password);
    
    if (!hasLetter || !hasNumber) {
      return "A senha deve conter pelo menos uma letra e um número.";
    }
    
    return null;
  }

  private validateLoginData(data: LoginData): string | null {
    if (!data.identifier?.trim()) {
      return "O e-mail é obrigatório.";
    }
    
    if (!data.password) {
      return "A senha é obrigatória.";
    }
    
    // Validar formato de e-mail se não for username
    if (data.identifier.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.identifier)) {
        return "Por favor, digite um e-mail válido.";
      }
    }
    
    return null;
  }
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  // Métodos para gerenciar usuário no localStorage
  setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Verificar se usuário está logado
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();

    // Verificar se token e usuário existem e se token não expirou
    if (!token || !user) {
      return false;
    }

    // Verificar se o token JWT não expirou (básico)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;

      if (payload.exp && payload.exp < now) {
        console.log('🔑 Token expirado, removendo...');
        this.removeToken();
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      this.removeToken();
      return false;
    }

    return true;
  }

  // Headers para requisições autenticadas
  private getAuthHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Registro com login automático
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validações no frontend primeiro
      const validationError = this.validateRegisterData(data);
      if (validationError) {
        throw new Error(validationError);
      }

      console.log('🚀 Iniciando registro para:', data.email);

      const response = await fetch(`${this.baseURL}/api/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Status da resposta do registro:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro do servidor:', errorData);
        
        const errorMessage = this.mapStrapiError(errorData);
        throw new Error(errorMessage);
      }

      const authData: AuthResponse = await response.json();
      console.log('✅ Resposta do registro:', { 
        hasJwt: !!authData.jwt, 
        userConfirmed: authData.user?.confirmed,
        userId: authData.user?.id 
      });

      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // ALTERAÇÃO: não salvar token/usuário se a confirmação por e-mail estiver ativa
      // e o usuário ainda não estiver confirmado (confirmed === false) ou se não vier jwt.
      if (authData?.user?.confirmed && authData?.jwt) {
        // Conta já confirmada (ex.: ambientes sem email confirmation) -> login normal
        this.setToken(authData.jwt);
        this.setUser(authData.user);
        console.log('✅ Registro confirmado e login realizado com sucesso');
      } else {
        // Conta criada, porém aguardando confirmação por e-mail
        console.log('📧 Registro criado. Verifique seu e-mail para confirmar a conta antes de fazer login.');
        // Importante: NÃO salvar token nem usuário aqui
      }
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

      return authData;
    } catch (error) {
      console.error("❌ Erro no registro:", error);
      
      // Se for erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Erro de conexão. Verifique sua internet e tente novamente.");
      }
      
      throw error;
    }
  }

  // Confirmar email (novo método)
  async confirmEmail(confirmationToken: string): Promise<void> {
    try {
      if (!confirmationToken?.trim()) {
        throw new Error("Token de confirmação não encontrado. Verifique o link em seu e-mail.");
      }

      console.log('📧 Confirmando e-mail com token...');

      // Tentar primeiro com o endpoint email-confirmation (Strapi v4/v5)
      let response = await fetch(
        `${this.baseURL}/api/auth/email-confirmation?confirmation=${confirmationToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Se der 404, tentar com o endpoint alternativo
      if (response.status === 404) {
        console.log('� Tentando endpoint alternativo...');
        response = await fetch(
          `${this.baseURL}/api/auth/email-confirmation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ confirmation: confirmationToken }),
          }
        );
      }

      console.log('�📥 Status da confirmação de e-mail:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na confirmação:', errorData);
        
        // Erros específicos de confirmação
        if (response.status === 400) {
          throw new Error("Link de confirmação inválido ou expirado. Solicite um novo e-mail de confirmação.");
        }
        
        if (response.status === 404) {
          throw new Error("Endpoint de confirmação não encontrado. Verifique a configuração do servidor.");
        }
        
        const errorMessage = this.mapStrapiError(errorData);
        throw new Error(errorMessage);
      }

      // Opcional: fazer login automático após a confirmação
      const authData: AuthResponse = await response.json();
      if (authData.jwt && authData.user) {
        this.setToken(authData.jwt);
        this.setUser(authData.user);
        console.log("✅ E-mail confirmado e login realizado com sucesso!");
      } else {
        console.log("✅ E-mail confirmado com sucesso! Agora você pode fazer login.");
      }
    } catch (error) {
      console.error("❌ Erro na confirmação de e-mail:", error);
      
      // Se for erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Erro de conexão. Verifique sua internet e tente novamente.");
      }
      
      throw error;
    }
  }

  // Reenviar email de confirmação
  async resendEmailConfirmation(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/send-email-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Erro ao reenviar e-mail de confirmação."
        );
      }

      console.log("✅ E-mail de confirmação reenviado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao reenviar e-mail de confirmação:", error);
      throw error;
    }
  }

  // Login tradicional (email/senha)
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Validações no frontend primeiro
      const validationError = this.validateLoginData(data);
      if (validationError) {
        throw new Error(validationError);
      }

      console.log('🔐 Tentando fazer login para:', data.identifier);

      const response = await fetch(`${this.baseURL}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Status da resposta do login:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro do servidor no login:', errorData);
        
        const errorMessage = this.mapStrapiError(errorData);
        throw new Error(errorMessage);
      }

      const authData: AuthResponse = await response.json();
      console.log('✅ Resposta do login:', { 
        hasJwt: !!authData.jwt, 
        userConfirmed: authData.user?.confirmed,
        userId: authData.user?.id 
      });

      // Verificar se o usuário confirmou o email
      if (!authData.user.confirmed) {
        throw new Error("Você precisa confirmar seu e-mail antes de fazer login. Verifique sua caixa de entrada e clique no link de confirmação.");
      }

      // Verificar se o usuário não está bloqueado
      if (authData.user.blocked) {
        throw new Error("Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.");
      }

      // Salvar token e usuário no localStorage apenas se confirmado
      this.setToken(authData.jwt);
      this.setUser(authData.user);

      console.log('✅ Login realizado com sucesso');
      return authData;
    } catch (error) {
      console.error("❌ Erro no login:", error);
      
      // Se for erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Erro de conexão. Verifique sua internet e tente novamente.");
      }
      
      throw error;
    }
  }

  // Login com Google (redirecionamento)
  loginWithGoogle(): void {
    // URL para onde o usuário será redirecionado após o login com Google (seu frontend)
    const redirectUrl = `${window.location.origin}/connect/google/redirect`;

    // Construir URL de autenticação do Strapi (sem locale conforme solicitado)
    const authUrl = `${this.baseURL}/api/connect/google?redirect=${encodeURIComponent(redirectUrl)}`;

    console.log('🔗 Redirecionando para Google OAuth:', authUrl);
    console.log('🎯 URL de callback configurada:', redirectUrl);

    // Redirecionar para o endpoint de autenticação do Strapi
    window.location.href = authUrl;
  }

  // Processar callback do Google - REMOVIDO (não é mais necessário)
  // O callback agora é tratado diretamente na página de redirect

  // Esqueci minha senha (enviar email de recuperação)
  async forgotPassword(data: ForgotPasswordData): Promise<{ ok: boolean }> {
    try {
      // Validação básica
      if (!data.email?.trim()) {
        throw new Error("O e-mail é obrigatório.");
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Por favor, digite um e-mail válido.");
      }

      console.log('📧 Solicitando recuperação de senha para:', data.email);

      const response = await fetch(`${this.baseURL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Status da resposta de recuperação:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na recuperação de senha:', errorData);
        
        const errorMessage = this.mapStrapiError(errorData);
        throw new Error(errorMessage);
      }

      console.log('✅ E-mail de recuperação enviado com sucesso');
      return { ok: true };
    } catch (error) {
      console.error("❌ Erro ao enviar email de recuperação:", error);
      
      // Se for erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Erro de conexão. Verifique sua internet e tente novamente.");
      }
      
      throw error;
    }
  }

  // Resetar senha (com código recebido por email)
  async resetPassword(code: string, password: string, passwordConfirmation: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          password,
          passwordConfirmation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro ao resetar senha");
      }

      const authData: AuthResponse = await response.json();

      // Salvar token e usuário no localStorage
      this.setToken(authData.jwt);
      this.setUser(authData.user);

      return authData;
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      throw error;
    }
  }

  // Trocar senha (usuário logado)
  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/change-password`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro ao trocar senha");
      }

      const authData: AuthResponse = await response.json();

      // Atualizar token e usuário no localStorage
      this.setToken(authData.jwt);
      this.setUser(authData.user);

      return authData;
    } catch (error) {
      console.error("Erro ao trocar senha:", error);
      throw error;
    }
  }

  // Logout
  logout(): void {
    this.removeToken();
    // Opcional: redirecionar para página inicial
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  // Obter perfil do usuário (verificar se token ainda é válido)
  async getProfile(): Promise<User> {
    try {
      const response = await fetch(`${this.baseURL}/api/users/me`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Token inválido, fazer logout
        this.logout();
        throw new Error("Token inválido");
      }

      const user: User = await response.json();
      this.setUser(user);

      return user;
    } catch (error) {
      console.error("Erro ao obter perfil:", error);
      throw error;
    }
  }

  // Upload de arquivo para o Strapi e associar ao usuário
  async uploadFile(file: File): Promise<{ id: number; url: string }> {
    const token = this.getToken();
    const currentUser = this.getUser();

    if (!token || !currentUser) {
      throw new Error("Token de autenticação ou usuário não encontrado");
    }

    console.log("🔍 Debug Upload - Iniciando upload...");
    console.log("📁 Arquivo:", { name: file.name, size: file.size, type: file.type });
    console.log("🔑 Token presente:", !!token);
    console.log("👤 Usuário:", { id: currentUser.id, username: currentUser.username });

    try {
      const formData = new FormData();
      formData.append('files', file);

      // Adicionar parâmetros para associar ao usuário
      formData.append('refId', currentUser.id.toString());
      formData.append('ref', 'plugin::users-permissions.user');
      formData.append('field', 'avatar');

      console.log("📤 Enviando para:", `${this.baseURL}/api/upload`);
      console.log("🔗 Associando ao usuário:", currentUser.id);

      const response = await fetch(`${this.baseURL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("📥 Status da resposta:", response.status);
      console.log("📋 Headers da resposta:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na resposta:", errorText);

        let errorMessage = "Erro ao fazer upload da imagem";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // Se não conseguir fazer parse do JSON, usar o texto como está
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const uploadData = await response.json();
      console.log("✅ Upload bem-sucedido:", uploadData);

      const uploadedFile = uploadData[0]; // Strapi retorna array

      return {
        id: uploadedFile.id,
        url: `${this.baseURL}${uploadedFile.url}`
      };
    } catch (error) {
      console.error("💥 Erro no upload:", error);
      throw error;
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const token = this.getToken();
    const currentUser = this.getUser();

    if (!token || !currentUser) {
      throw new Error("Usuário não autenticado");
    }

    console.log("🔄 Atualizando perfil do usuário:", currentUser.id);
    console.log("📝 Dados para atualizar:", data);

    try {
      const updateData: Record<string, unknown> = {};

      if (data.username) updateData.username = data.username;
      if (data.email) updateData.email = data.email;

      // Se tem avatar, pode ser ID do arquivo ou URL completa
      if (data.avatar) {
        // Se é uma URL completa, extrair apenas o ID do arquivo
        if (data.avatar.includes('/uploads/')) {
          // Manter a URL como está
          updateData.avatar = data.avatar;
        } else {
          // Se é apenas ID, usar como está
          updateData.avatar = data.avatar;
        }
      }

      console.log("📤 Enviando atualização:", updateData);

      const response = await fetch(`${this.baseURL}/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log("📥 Status da atualização:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na atualização:", errorText);

        let errorMessage = "Erro ao atualizar perfil";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const updatedUser: User = await response.json();
      console.log("✅ Perfil atualizado:", updatedUser);

      this.setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      console.error("💥 Erro ao atualizar perfil:", error);
      throw error;
    }
  }

  // Verificar se o usuário pode aplicar para vagas
  canApplyToJobs(): boolean {
    const user = this.getUser();
    return this.isAuthenticated() && user?.confirmed === true && user?.blocked === false;
  }
}

// Exportar instância única do serviço
export const authService = new AuthService();
export default authService;
