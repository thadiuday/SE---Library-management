import api from '../api';

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  category_id: number | null;
  publisher: string | null;
  publication_year: number | null;
  description: string | null;
  total_copies: int;
  available_copies: int;
  shelf_location: string | null;
  category?: Category;
}

export interface PaginatedBooks {
  items: Book[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const bookService = {
  getBooks: async (params?: { search?: string; category_id?: number; available?: boolean; page?: number; page_size?: number }) => {
    const response = await api.get<PaginatedBooks>('/books', { params });
    return response.data;
  },
  
  getBook: async (id: number) => {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  },
  
  createBook: async (data: Partial<Book>) => {
    const response = await api.post<Book>('/books', data);
    return response.data;
  },
  
  updateBook: async (id: number, data: Partial<Book>) => {
    const response = await api.put<Book>(`/books/${id}`, data);
    return response.data;
  },
  
  deleteBook: async (id: number) => {
    await api.delete(`/books/${id}`);
  },

  getCategories: async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  }
};
