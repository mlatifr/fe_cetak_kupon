import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import { Coupon } from '@/types';

export const couponsApi = {
  // Get all coupons
  getAll: async (params?: {
    batch_id?: number;
    box_number?: number;
    is_winner?: boolean;
    generated_by?: number;
  }): Promise<Coupon[]> => {
    const response = await apiClient.get<Coupon[]>(API_ENDPOINTS.COUPONS, { params });
    return response.data;
  },

  // Get coupon by number
  getByNumber: async (couponNumber: string): Promise<Coupon> => {
    const response = await apiClient.get<Coupon>(API_ENDPOINTS.COUPON_BY_NUMBER(couponNumber));
    return response.data;
  },

  // Create coupon
  create: async (data: {
    coupon_number: string;
    prize_amount: number;
    prize_description?: string;
    box_number: number;
    batch_id: number;
    is_winner: boolean;
    generated_by?: number;
  }): Promise<{ message: string; coupon_number: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.COUPONS, data);
    return response.data;
  },

  // Update coupon
  update: async (
    couponNumber: string,
    data: {
      prize_amount?: number;
      prize_description?: string;
      box_number?: number;
      batch_id?: number;
      is_winner?: boolean;
      generated_by?: number;
    }
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(API_ENDPOINTS.COUPON_BY_NUMBER(couponNumber), data);
    return response.data;
  },

  // Delete coupon
  delete: async (couponNumber: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(API_ENDPOINTS.COUPON_BY_NUMBER(couponNumber));
    return response.data;
  },

  // Generate coupons for batch
  generate: async (data: {
    batch_id: number;
    generated_by?: number;
  }): Promise<{
    success: boolean;
    message: string;
    totalCoupons: number;
    batch_id: number;
  }> => {
    const response = await apiClient.post(API_ENDPOINTS.COUPONS_GENERATE, data);
    return response.data;
  },
};

