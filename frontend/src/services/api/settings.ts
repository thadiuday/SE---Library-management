import api from '../api';

export interface LibrarySettings {
  fine_per_day: number;
  max_borrow_limit: number;
  loan_period_days: number;
  library_name: string;
  contact_email: string;
  contact_phone?: string;
  operating_hours?: string;
}

export interface SystemInfo {
  project_name: string;
  version: string;
  database_type: string;
  api_prefix: string;
  server_time: string;
  counts: {
    books: number;
    categories: number;
    members: number;
    active_borrows: number;
    fines: number;
  };
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export const settingsService = {
  getSettings: async (): Promise<LibrarySettings> => {
    const res = await api.get<LibrarySettings>('/settings');
    return res.data;
  },

  updateSettings: async (settings: LibrarySettings): Promise<LibrarySettings> => {
    const res = await api.put<LibrarySettings>('/settings', settings);
    return res.data;
  },

  resetDefaultSettings: async (): Promise<LibrarySettings> => {
    const res = await api.post<LibrarySettings>('/settings/reset-defaults');
    return res.data;
  },

  getSystemInfo: async (): Promise<SystemInfo> => {
    const res = await api.get<SystemInfo>('/settings/system-info');
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/change-password', payload);
    return res.data;
  }
};
