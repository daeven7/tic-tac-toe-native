import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authAPI, AuthResponse } from '../services/api';
import { deleteItem, getItem, setItem } from '../utils/storage';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accessToken = await getItem('accessToken');
      const refreshToken = await getItem('refreshToken');
      
      if (accessToken && refreshToken) {
        await refreshTokenFunction();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const storeTokens = async (accessToken: string, refreshToken: string) => {
    try {
      console.log('Storing tokens...');
      await setItem('accessToken', accessToken);
      await setItem('refreshToken', refreshToken);
      console.log('Tokens stored successfully');
    } catch (error) {
      console.error('error storing tokens:', error);
      throw error;
    }
  };

  const clearTokens = async () => {
    try {
      await deleteItem('accessToken');
      await deleteItem('refreshToken');
      setUser(null);
    } catch (error) {
      console.error('error clearing tokens:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authAPI.login({ email, password });      
      if (response.accessToken && response.refreshToken) {
        await storeTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        console.log('Login successful');
      } else {
        throw new Error('No tokens received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register({ email, password });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshTokenFunction = async () => {
    try {
      const refreshToken = await getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refresh(refreshToken);
      await storeTokens(response.accessToken, response.refreshToken);
      
    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      if (error.response?.status === 403) {
        console.log('Refresh token is invalid/expired, clearing tokens');
        await clearTokens();
      } else {
        await clearTokens();
      }
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshToken: refreshTokenFunction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 