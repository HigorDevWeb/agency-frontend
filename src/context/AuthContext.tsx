"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import authService, { User as StrapiUser, RegisterData as StrapiRegisterData, LoginData } from "@/services/authService";

interface User {
  id: string;
  name: string;
  email: string;
  userType: "developer" | "company";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (code: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  canApplyToJobs: () => boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: "developer" | "company";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Converter usuário do Strapi para formato local
  const convertStrapiUser = (strapiUser: StrapiUser): User => {
    // Tratar avatar do Strapi
    let avatarUrl = `https://ui-avatars.com/api/?name=${strapiUser.username}&background=3b82f6&color=fff`;
    
    if (strapiUser.avatar) {
      // Se o avatar já é uma URL completa, usar como está
      if (strapiUser.avatar.startsWith('http')) {
        avatarUrl = strapiUser.avatar;
      } else {
        // Se é um caminho relativo, adicionar o domínio do Strapi
        avatarUrl = `https://api.recruitings.info${strapiUser.avatar}`;
      }
    }

    return {
      id: strapiUser.id.toString(),
      name: strapiUser.username,
      email: strapiUser.email,
      userType: "developer", // Padrão, pode ser ajustado conforme sua lógica
      avatar: avatarUrl,
    };
  };

  useEffect(() => {
    // Verificar se há um usuário logado no authService
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const strapiUser = authService.getUser();
          if (strapiUser) {
            const localUser = convertStrapiUser(strapiUser);
            setUser(localUser);
          } else {
            // Token existe mas usuário não, tentar obter perfil atualizado do servidor
            try {
              const profile = await authService.getProfile();
              const localUser = convertStrapiUser(profile);
              setUser(localUser);
            } catch {
              // Token inválido, fazer logout
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const loginData: LoginData = {
        identifier: email,
        password: password,
      };

      const authResponse = await authService.login(loginData);
      const localUser = convertStrapiUser(authResponse.user);
      setUser(localUser);
    } catch (error) {
      throw new Error("Erro ao fazer login", { cause: error });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);

    try {
      const registerData: StrapiRegisterData = {
        username: userData.name,
        email: userData.email,
        password: userData.password,
      };

      const authResponse = await authService.register(registerData);
      const localUser = convertStrapiUser(authResponse.user);
      setUser(localUser);
    } catch (error) {
      throw new Error("Erro ao criar conta", { cause: error });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = () => {
    setIsLoading(true);
    authService.loginWithGoogle();
  };

  // Função interna para atualizar o usuário (usado apenas pelos callbacks)
  const handleGoogleAuthSuccess = (userData: StrapiUser) => {
    const localUser = convertStrapiUser(userData);
    setUser(localUser);
    setIsLoading(false);
  };

  // Expor função para componentes de callback
  if (typeof window !== 'undefined') {
    (window as unknown as { handleGoogleAuthSuccess?: (userData: StrapiUser) => void }).handleGoogleAuthSuccess = handleGoogleAuthSuccess;
  }

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword({ email });
    } catch (error) {
      throw new Error("Erro ao enviar email de recuperação", { cause: error });
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      // Preparar dados para o Strapi
      const updateData: { username?: string; email?: string; avatar?: string } = {};
      
      if (data.name) updateData.username = data.name;
      if (data.email) updateData.email = data.email;
      if (data.avatar) updateData.avatar = data.avatar;

      // Atualizar no Strapi
      const updatedStrapiUser = await authService.updateProfile(updateData);
      
      // Converter e atualizar estado local
      const updatedUser = convertStrapiUser(updatedStrapiUser);
      setUser(updatedUser);

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw new Error("Erro ao atualizar perfil", { cause: error });
    }
  };

  const refreshProfile = async () => {
    if (!authService.isAuthenticated()) return;

    try {
      const profile = await authService.getProfile();
      const localUser = convertStrapiUser(profile);
      setUser(localUser);
    } catch (error) {
      console.error("Erro ao recarregar perfil:", error);
      throw new Error("Erro ao recarregar perfil", { cause: error });
    }
  };

  const canApplyToJobs = (): boolean => {
    return authService.canApplyToJobs();
  };

  const resetPassword = async (code: string, password: string, passwordConfirmation: string) => {
    try {
      await authService.resetPassword(code, password, passwordConfirmation);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao redefinir senha";
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: authService.isAuthenticated(),
    login,
    register,
    loginWithGoogle,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    refreshProfile,
    canApplyToJobs,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
