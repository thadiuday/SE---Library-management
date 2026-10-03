import api from './api';

export interface AdminProfile {
  name: string;
  title: string;
  department: string;
  phone: string;
  bio: string;
  avatarColor: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  name?: string;
  title?: string;
  department?: string;
  phone?: string;
  bio?: string;
  avatarColor?: string;
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
    let userRecord: User;
    if (response.data.role === 'admin') {
      const profile = authService.getStoredProfile();
      userRecord = {
        ...response.data,
        name: profile.name,
        title: profile.title,
        department: profile.department,
        phone: profile.phone,
        bio: profile.bio,
        avatarColor: profile.avatarColor,
      };
    } else {
      const member = response.data.member_profile;
      userRecord = {
        ...response.data,
        name: member?.name || 'Alex Rivera',
        title: member?.student_id || 'Student Member',
        department: member?.department || 'Computer Science',
        phone: member?.phone || '',
        bio: member?.year ? `Year ${member.year} Student` : 'Enrolled Student',
        avatarColor: 'from-violet-600 to-indigo-600',
      };
    }
    localStorage.setItem('user', JSON.stringify(userRecord));
    return userRecord;
  },
  
  getStoredProfile: (): AdminProfile => {
    const saved = localStorage.getItem('admin_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      name: 'System Administrator',
      title: 'Head of Library Services',
      department: 'Central Administration',
      phone: '+1 (555) 019-2834',
      bio: 'Oversees library circulation, catalog integrity, member compliance, and institutional archives.',
      avatarColor: 'from-indigo-600 to-violet-600'
    };
  },

  saveProfile: (profile: Partial<AdminProfile>): AdminProfile => {
    const current = authService.getStoredProfile();
    const updated: AdminProfile = { ...current, ...profile };
    localStorage.setItem('admin_profile', JSON.stringify(updated));
    return updated;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  
  getRole: (): string | null => {
    return localStorage.getItem('role');
  }
};
