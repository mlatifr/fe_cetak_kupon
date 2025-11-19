import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';
import { Batch } from '@/types';

// Get all batches
export const useBatches = (params?: {
  status?: string;
  operator_name?: string;
  location?: string;
  operator_id?: number;
  created_by?: number;
}) => {
  return useQuery({
    queryKey: ['batches', params],
    queryFn: () => batchesApi.getAll(params),
  });
};

// Get batch by number
export const useBatch = (batchNumber: number) => {
  return useQuery({
    queryKey: ['batch', batchNumber],
    queryFn: () => batchesApi.getByNumber(batchNumber),
    enabled: !!batchNumber,
  });
};

// Get batch detail with relations
export const useBatchDetail = (batchNumber: number) => {
  return useQuery({
    queryKey: ['batch-detail', batchNumber],
    queryFn: () => batchesApi.getDetail(batchNumber),
    enabled: !!batchNumber,
  });
};

// Get production report
export const useBatchReport = (batchNumber: number) => {
  return useQuery({
    queryKey: ['batch-report', batchNumber],
    queryFn: () => batchesApi.getReport(batchNumber),
    enabled: !!batchNumber,
  });
};

// Create batch mutation
export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof batchesApi.create>[0]) =>
      batchesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
};

// Update batch mutation
export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchNumber,
      data,
    }: {
      batchNumber: number;
      data: Parameters<typeof batchesApi.update>[1];
    }) => batchesApi.update(batchNumber, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch', variables.batchNumber] });
      queryClient.invalidateQueries({
        queryKey: ['batch-detail', variables.batchNumber],
      });
    },
  });
};

// Delete batch mutation
export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchNumber: number) => batchesApi.delete(batchNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
};

