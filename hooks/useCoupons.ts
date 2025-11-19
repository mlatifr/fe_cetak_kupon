import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '@/lib/api/coupons';
import { Coupon } from '@/types';

// Get all coupons
export const useCoupons = (params?: {
  batch_id?: number;
  box_number?: number;
  is_winner?: boolean;
  generated_by?: number;
}) => {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: () => couponsApi.getAll(params),
  });
};

// Get coupon by number
export const useCoupon = (couponNumber: string) => {
  return useQuery({
    queryKey: ['coupon', couponNumber],
    queryFn: () => couponsApi.getByNumber(couponNumber),
    enabled: !!couponNumber,
  });
};

// Generate coupons mutation
export const useGenerateCoupons = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { batch_id: number; generated_by?: number }) =>
      couponsApi.generate(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({
        queryKey: ['batch-detail', variables.batch_id],
      });
    },
  });
};

// Create coupon mutation
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof couponsApi.create>[0]) =>
      couponsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

// Update coupon mutation
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      couponNumber,
      data,
    }: {
      couponNumber: string;
      data: Parameters<typeof couponsApi.update>[1];
    }) => couponsApi.update(couponNumber, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({
        queryKey: ['coupon', variables.couponNumber],
      });
    },
  });
};

// Delete coupon mutation
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponNumber: string) => couponsApi.delete(couponNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

