import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import { PrizeConfig } from '@/types';

export const prizeConfigApi = {
  // Get all prize configs
  getAll: async (): Promise<PrizeConfig[]> => {
    const response = await apiClient.get<PrizeConfig[]>(API_ENDPOINTS.PRIZE_CONFIG);
    return response.data;
  },

  // Get prize config by ID
  getById: async (id: number): Promise<PrizeConfig> => {
    const response = await apiClient.get<PrizeConfig>(API_ENDPOINTS.PRIZE_CONFIG_BY_ID(id));
    return response.data;
  },

  // Create prize config
  create: async (data: {
    prize_amount: number;
    total_coupons: number;
    coupons_per_box: number;
    is_active?: boolean;
    created_by?: number;
  }): Promise<{ message: string; config_id: number }> => {
    const response = await apiClient.post(API_ENDPOINTS.PRIZE_CONFIG, data);
    return response.data;
  },

  // Update prize config
  update: async (
    id: number,
    data: {
      prize_amount?: number;
      total_coupons?: number;
      coupons_per_box?: number;
      is_active?: boolean;
      updated_by?: number;
    }
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(API_ENDPOINTS.PRIZE_CONFIG_BY_ID(id), data);
    return response.data;
  },

  // Delete prize config
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(API_ENDPOINTS.PRIZE_CONFIG_BY_ID(id));
    return response.data;
  },
};

