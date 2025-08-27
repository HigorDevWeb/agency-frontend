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

  // Métodos para gerenciar token no localStorage
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

  // Registro tradicional (email/senha)
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validações básicas
      if (!data.email || !data.password || !data.username) {
        throw new Error("Todos os campos são obrigatórios");
      }
      
      if (data.password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Email inválido");
      }

      const response = await fetch(`${this.baseURL}/api/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 
                           errorData.message?.[0]?.messages?.[0]?.message || 
                           "Erro no registro";
        throw new Error(errorMessage);
      }

      const authData: AuthResponse = await response.json();
      
      // Salvar token e usuário no localStorage
      this.setToken(authData.jwt);
      this.setUser(authData.user);

      console.log('✅ Registro realizado com sucesso');
      return authData;
    } catch (error) {
      console.error("❌ Erro no registro:", error);
      throw error;
    }
  }

  // Login tradicional (email/senha)
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Validações básicas
      if (!data.identifier || !data.password) {
        throw new Error("Email e senha são obrigatórios");
      }

      const response = await fetch(`${this.baseURL}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 
                           errorData.message?.[0]?.messages?.[0]?.message || 
                           "Credenciais inválidas";
        throw new Error(errorMessage);
      }

      const authData: AuthResponse = await response.json();
      
      // Salvar token e usuário no localStorage
      this.setToken(authData.jwt);
      this.setUser(authData.user);

      console.log('✅ Login realizado com sucesso');
      return authData;
    } catch (error) {
      console.error("❌ Erro no login:", error);
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
      const response = await fetch(`${this.baseURL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro ao enviar email de recuperação");
      }

      return { ok: true };
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error);
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
