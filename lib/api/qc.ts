import apiClient from './client';
import { API_ENDPOINTS } from '../constants';
import { QCValidation } from '@/types';

export const qcApi = {
  // Get all QC validations
  getAll: async (params?: {
    batch_id?: number;
    validation_status?: string;
    validated_by?: string;
    validated_by_user_id?: number;
  }): Promise<QCValidation[]> => {
    const response = await apiClient.get<QCValidation[]>(API_ENDPOINTS.QC_VALIDATIONS, { params });
    return response.data;
  },

  // Get QC validation by ID
  getById: async (id: number): Promise<QCValidation> => {
    const response = await apiClient.get<QCValidation>(API_ENDPOINTS.QC_VALIDATION_BY_ID(id));
    return response.data;
  },

  // Get QC validations by batch
  getByBatch: async (batchId: number): Promise<QCValidation[]> => {
    const response = await apiClient.get<QCValidation[]>(
      API_ENDPOINTS.QC_VALIDATIONS_BY_BATCH(batchId)
    );
    return response.data;
  },

  // Create QC validation
  create: async (data: {
    batch_id: number;
    validation_type: string;
    validation_status: 'pass' | 'fail';
    validation_details?: string;
    validated_by: string;
    validated_by_user_id?: number;
  }): Promise<{ message: string; qc_id: number }> => {
    const response = await apiClient.post(API_ENDPOINTS.QC_VALIDATIONS, data);
    return response.data;
  },

  // Update QC validation
  update: async (
    id: number,
    data: {
      validation_type?: string;
      validation_status?: 'pass' | 'fail';
      validation_details?: string;
      validated_by?: string;
      validated_by_user_id?: number;
    }
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(API_ENDPOINTS.QC_VALIDATION_BY_ID(id), data);
    return response.data;
  },

  // Delete QC validation
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(API_ENDPOINTS.QC_VALIDATION_BY_ID(id));
    return response.data;
  },
};

