import api from '../api';
import type { Book } from './books';

export interface MemberResponse {
  id: number;
  user_id: number;
  name: string;
  email: string;
  student_id: string;
  status: string;
}

export interface BorrowTransaction {
  id: number;
  member_id: number;
  book_id: number;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  book?: Book;
  member?: MemberResponse;
}

export interface Fine {
  id: number;
  transaction_id: number;
  amount: number;
  overdue_days: number;
  status: string;
}

export const transactionService = {
  getTransactions: async (params?: { status?: string; member_id?: number; skip?: number; limit?: number }) => {
    const response = await api.get<BorrowTransaction[]>('/transactions/', { params });
    return response.data;
  },

  issueBook: async (data: { member_id: number; book_id: number }) => {
    const response = await api.post<BorrowTransaction>('/transactions/issue', data);
    return response.data;
  },

  returnBook: async (transactionId: number) => {
    const response = await api.post<{ transaction: BorrowTransaction; fine: Fine | null }>(`/transactions/${transactionId}/return`);
    return response.data;
  },

  getFines: async (params?: { status?: string }) => {
    const response = await api.get<Fine[]>('/transactions/fines/', { params });
    return response.data;
  },

  payFine: async (fineId: number) => {
    const response = await api.post<Fine>(`/transactions/fines/${fineId}/pay`);
    return response.data;
  }
};
