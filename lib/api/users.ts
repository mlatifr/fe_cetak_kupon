import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import { User } from '@/types';

export const usersApi = {
  // Get all users
  getAll: async (params?: { role?: string; is_active?: boolean }): Promise<User[]> => {
    const response = await apiClient.get<User[]>(API_ENDPOINTS.USERS, { params });
    return response.data;
  },

  // Get user by username
  getByUsername: async (username: string): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.USER_BY_USERNAME(username));
    return response.data;
  },

  // Create user
  create: async (data: {
    username: string;
    email?: string;
    full_name: string;
    role: string;
    is_active?: boolean;
  }): Promise<{ message: string; user_id: number; username: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS, data);
    return response.data;
  },

  // Update user
  update: async (
    username: string,
    data: {
      email?: string;
      full_name?: string;
      role?: string;
      is_active?: boolean;
    }
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(API_ENDPOINTS.USER_BY_USERNAME(username), data);
    return response.data;
  },

  // Delete user (soft delete)
  delete: async (username: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(API_ENDPOINTS.USER_BY_USERNAME(username));
    return response.data;
  },
};

