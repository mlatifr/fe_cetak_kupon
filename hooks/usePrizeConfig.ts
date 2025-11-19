import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prizeConfigApi } from '@/lib/api/prizeConfig';
import { PrizeConfig } from '@/types';

// Get all prize configs
export const usePrizeConfigs = () => {
  return useQuery({
    queryKey: ['prize-configs'],
    queryFn: () => prizeConfigApi.getAll(),
  });
};

// Get prize config by ID
export const usePrizeConfig = (id: number) => {
  return useQuery({
    queryKey: ['prize-config', id],
    queryFn: () => prizeConfigApi.getById(id),
    enabled: !!id,
  });
};

// Create prize config mutation
export const useCreatePrizeConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof prizeConfigApi.create>[0]) =>
      prizeConfigApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prize-configs'] });
    },
  });
};

// Update prize config mutation
export const useUpdatePrizeConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof prizeConfigApi.update>[1];
    }) => prizeConfigApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prize-configs'] });
      queryClient.invalidateQueries({ queryKey: ['prize-config', variables.id] });
    },
  });
};

// Delete prize config mutation
export const useDeletePrizeConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => prizeConfigApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prize-configs'] });
    },
  });
};

