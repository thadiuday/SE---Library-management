import api from './api';

export interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  member_profile?: any;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: number;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects 'username'
    formData.append('password', password);
    
    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  
  getRole: (): string | null => {
    return localStorage.getItem('role');
  }
};
