import api from './api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: {
    message: string;
  };
  message?: string;
}

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      return response.data;
    } catch (error: any) {
      // Return error in consistent format
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Login failed'
        }
      };
    }
  },

  /**
   * Register new user
   */
  register: async (
    email: string, 
    password: string, 
    name?: string
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        name 
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Registration failed'
        }
      };
    }
  },

  /**
   * Logout user (clear local storage)
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Get auth token from storage
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};