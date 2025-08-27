"use client";

import { getBrowserLocale } from "@/lib/api";

// Interfaces para tipagem
export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
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

// Classe para gerenciar autenticação
class AuthService {
  private baseURL = "https://api.recruitings.info";
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
    return this.getToken() !== null && this.getUser() !== null;
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
      const response = await fetch(`${this.baseURL}/api/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro no registro");
      }

      const authData: AuthResponse = await response.json();
      
      // Salvar token e usuário no localStorage
      this.setToken(authData.jwt);
      this.setUser(authData.user);

      return authData;
    } catch (error) {
      console.error("Erro no registro:", error);
      throw error;
    }
  }

  // Login tradicional (email/senha)
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro no login");
      }

      const authData: AuthResponse = await response.json();
      
      // Salvar token e usuário no localStorage
      this.setToken(authData.jwt);
      this.setUser(authData.user);

      return authData;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }

  // Login com Google (redirecionamento)
  loginWithGoogle(): void {
    const locale = getBrowserLocale();
    // Adicionando o redirect_uri explicitamente para resolver o mismatch
    const redirectUri = encodeURIComponent('https://api.recruitings.info/api/connect/google/callback');
    window.location.href = `${this.baseURL}/api/connect/google?locale=${locale}&redirect_uri=${redirectUri}`;
  }

  // Processar callback do Google (para quando o usuário volta do Google)
  async handleGoogleCallback(accessToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/google/callback`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro na autenticação com Google");
      }

      const authData: AuthResponse = await response.json();
      
      // Salvar token e usuário no localStorage
      this.setToken(authData.jwt);
      this.setUser(authData.user);

      return authData;
    } catch (error) {
      console.error("Erro no callback do Google:", error);
      throw error;
    }
  }

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

  // Verificar se o usuário pode aplicar para vagas
  canApplyToJobs(): boolean {
    const user = this.getUser();
    return this.isAuthenticated() && user?.confirmed === true && user?.blocked === false;
  }
}

// Exportar instância única do serviço
export const authService = new AuthService();
export default authService;
