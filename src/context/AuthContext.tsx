"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
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

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const savedUser = localStorage.getItem("devjobs_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Erro ao carregar usuário salvo:", error);
        localStorage.removeItem("devjobs_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);

    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock user data
      const mockUser: User = {
        id: "1",
        name: email.split("@")[0],
        email,
        userType: "developer",
        avatar: `https://ui-avatars.com/api/?name=${
          email.split("@")[0]
        }&background=3b82f6&color=fff`,
      };

      setUser(mockUser);
      localStorage.setItem("devjobs_user", JSON.stringify(mockUser));
    } catch (error) {
      throw new Error("Erro ao fazer login", { cause: error });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);

    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        userType: userData.userType,
        avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=8b5cf6&color=fff`,
      };

      setUser(newUser);
      localStorage.setItem("devjobs_user", JSON.stringify(newUser));
    } catch (error) {
      throw new Error("Erro ao criar conta", { cause: error });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("devjobs_user");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("devjobs_user", JSON.stringify(updatedUser));
    } catch (error) {
      throw new Error("Erro ao atualizar perfil", { cause: error });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
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
