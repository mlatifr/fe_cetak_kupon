// User Types
export interface User {
  user_id: number;
  username: string;
  email?: string;
  full_name: string;
  role: 'admin' | 'operator' | 'qc_staff';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Prize Config Types
export interface PrizeConfig {
  config_id: number;
  prize_amount: number;
  total_coupons: number;
  coupons_per_box: number;
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  created_by_username?: string;
  created_by_name?: string;
  updated_by_username?: string;
  updated_by_name?: string;
}

// Coupon Types
export interface Coupon {
  coupon_id: number;
  coupon_number: string;
  prize_amount: number;
  prize_description: string;
  box_number: number;
  batch_id: number;
  is_winner: boolean;
  generated_at: string;
  generated_by?: number;
  generated_by_username?: string;
  generated_by_name?: string;
}

// Batch Types
export interface Batch {
  batch_id: number;
  batch_number: number;
  operator_name: string;
  location: string;
  production_date: string;
  total_boxes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'qc_passed' | 'qc_failed';
  created_by?: number;
  operator_id?: number;
  created_at: string;
  updated_at: string;
  created_by_username?: string;
  created_by_name?: string;
  operator_username?: string;
  operator_name_full?: string;
}

// QC Validation Types
export interface QCValidation {
  qc_id: number;
  batch_id: number;
  validation_type: string;
  validation_status: 'pass' | 'fail' | 'pending' | 'PENDING' | 'PASS' | 'FAIL';
  validation_details: string;
  validated_by: string;
  validated_by_user_id?: number;
  validated_at: string;
  validated_by_username?: string;
  validated_by_name?: string;
}

// Production Log Types
export interface ProductionLog {
  log_id: number;
  batch_id: number;
  action_type: string;
  action_description?: string;
  operator_name: string;
  operator_user_id?: number;
  location: string;
  timestamp: string;
  metadata?: string;
  operator_username?: string;
  operator_name_full?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Batch Detail (with relations)
export interface BatchDetail extends Batch {
  coupons: Coupon[];
  qc_validations: QCValidation[];
  production_logs: ProductionLog[];
}

// Production Report Types
export interface ProductionReport {
  batch_number: number;
  operator_name: string;
  location: string;
  production_date: string;
  coupons: Array<{
    box_number: number;
    coupon_number: string;
    prize_amount: number;
    prize_description: string;
  }>;
}

