import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  displayName: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [localUser, setLocalUser] = useState<SelectUser | null>(null);
  
  // Direct login method (simplified for immediate access)
  const directLogin = (username: string) => {
    const mockUser = {
      id: 999,
      username,
      displayName: username,
      password: "",
      email: `${username}@smooches.app`,
      role: "admin",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: "Admin user",
      followers: 0,
      following: 0,
      isEmailVerified: true,
      verificationToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      googleId: null,
      facebookId: null,
      twitterId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as SelectUser;
    
    setLocalUser(mockUser);
    // Also set in query cache for compatibility
    queryClient.setQueryData(["/api/auth/user"], mockUser);
    
    // Show success toast
    toast({
      title: "Logged in successfully",
      description: `Welcome, ${username}!`,
    });
  };
  
  // Still keep the regular API-based auth for existing functionality
  const {
    data: apiUser,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false, // Don't retry on 401 errors
    enabled: !localUser, // Don't fetch if we have a local user
  });
  
  // Combined user from both sources
  const user = localUser || apiUser;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (userResponse: any) => {
      // If not already handled by directLogin
      if (!localUser && userResponse && userResponse.id) {
        queryClient.setQueryData(["/api/auth/user"], userResponse);
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${userResponse.displayName || userResponse.username}!`,
        });
      }
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Try the instant access or test account options",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to SMOOCHES, ${user.displayName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}