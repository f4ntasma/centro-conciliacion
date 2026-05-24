import apiClient from '@/lib/api-client';
import { User, PaginationParams, PaginatedResponse } from '@/types';

export const userService = {
  getUsers: async (params: PaginationParams): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get<PaginatedResponse<User>>('/users', { params });
    return data;
  },

  getUserById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  createUser: async (user: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User> => {
    const { data } = await apiClient.post<User>('/users', user);
    return data;
  },

  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}`, user);
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  searchUsers: async (search: string, limit: number = 10): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users/search', {
      params: { search, limit },
    });
    return data;
  },
};
