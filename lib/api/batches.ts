import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import { Batch, BatchDetail, ProductionReport } from '@/types';

export const batchesApi = {
  // Get all batches
  getAll: async (params?: {
    status?: string;
    operator_name?: string;
    location?: string;
    operator_id?: number;
    created_by?: number;
  }): Promise<Batch[]> => {
    const response = await apiClient.get<Batch[]>(API_ENDPOINTS.BATCHES, { params });
    return response.data;
  },

  // Get batch by number
  getByNumber: async (batchNumber: number): Promise<Batch> => {
    const response = await apiClient.get<Batch>(API_ENDPOINTS.BATCH_BY_NUMBER(batchNumber));
    return response.data;
  },

  // Get batch detail with relations
  getDetail: async (batchNumber: number): Promise<BatchDetail> => {
    const response = await apiClient.get<BatchDetail>(API_ENDPOINTS.BATCH_DETAIL(batchNumber));
    return response.data;
  },

  // Get production report
  getReport: async (batchNumber: number): Promise<{
    success: boolean;
    data: ProductionReport;
    formattedReport: string;
  }> => {
    const response = await apiClient.get(API_ENDPOINTS.BATCH_REPORT(batchNumber));
    return response.data;
  },

  // Create batch
  create: async (data: {
    batch_number: number;
    operator_name: string;
    location: string;
    production_date?: string;
    total_boxes?: number;
    status?: string;
    created_by?: number;
    operator_id?: number;
  }): Promise<{ message: string; batch_id: number; batch_number: number }> => {
    const response = await apiClient.post(API_ENDPOINTS.BATCHES, data);
    return response.data;
  },

  // Update batch
  update: async (
    batchNumber: number,
    data: {
      operator_name?: string;
      location?: string;
      production_date?: string;
      total_boxes?: number;
      status?: string;
      operator_id?: number;
    }
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(API_ENDPOINTS.BATCH_BY_NUMBER(batchNumber), data);
    return response.data;
  },

  // Delete batch
  delete: async (batchNumber: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(API_ENDPOINTS.BATCH_BY_NUMBER(batchNumber));
    return response.data;
  },
};

