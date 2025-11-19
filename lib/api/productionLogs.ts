import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import { ProductionLog } from '@/types';

export const productionLogsApi = {
  // Get all production logs
  getAll: async (params?: {
    batch_id?: number;
    action_type?: string;
    operator_name?: string;
    location?: string;
    operator_user_id?: number;
  }): Promise<ProductionLog[]> => {
    const response = await apiClient.get<ProductionLog[]>(API_ENDPOINTS.PRODUCTION_LOGS, {
      params,
    });
    return response.data;
  },

  // Get production log by ID
  getById: async (id: number): Promise<ProductionLog> => {
    const response = await apiClient.get<ProductionLog>(API_ENDPOINTS.PRODUCTION_LOG_BY_ID(id));
    return response.data;
  },

  // Get production logs by batch
  getByBatch: async (batchId: number): Promise<ProductionLog[]> => {
    const response = await apiClient.get<ProductionLog[]>(
      API_ENDPOINTS.PRODUCTION_LOGS_BY_BATCH(batchId)
    );
    return response.data;
  },

  // Create production log
  create: async (data: {
    batch_id: number;
    action_type: string;
    action_description?: string;
    operator_name: string;
    location: string;
    metadata?: string;
    operator_user_id?: number;
  }): Promise<{ message: string; log_id: number }> => {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTION_LOGS, data);
    return response.data;
  },

  // Update production log
  update: async (
    id: number,
    data: {
      action_type?: string;
      action_description?: string;
      operator_name?: string;
      location?: string;
      metadata?: string;
      operator_user_id?: number;
    }
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(API_ENDPOINTS.PRODUCTION_LOG_BY_ID(id), data);
    return response.data;
  },

  // Delete production log
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(API_ENDPOINTS.PRODUCTION_LOG_BY_ID(id));
    return response.data;
  },
};

