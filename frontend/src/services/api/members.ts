import api from '../api';

export interface Member {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  student_id: string;
  department: string | null;
  year: number | null;
  status: string;
}

export interface PaginatedMembers {
  items: Member[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const memberService = {
  getMembers: async (params?: { search?: string; status?: string; page?: number; page_size?: number }) => {
    const response = await api.get<PaginatedMembers>('/members', { params });
    return response.data;
  },
  
  getMember: async (id: number) => {
    const response = await api.get<Member>(`/members/${id}`);
    return response.data;
  },
  
  createMember: async (data: any) => {
    const response = await api.post<Member>('/members', data);
    return response.data;
  },
  
  updateMember: async (id: number, data: Partial<Member>) => {
    const response = await api.put<Member>(`/members/${id}`, data);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch<Member>(`/members/${id}/status`, { status });
    return response.data;
  },
  
  getMyProfile: async () => {
    const response = await api.get<Member>('/members/me');
    return response.data;
  }
};
