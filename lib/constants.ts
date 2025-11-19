// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Users
  USERS: '/api/users',
  USER_BY_USERNAME: (username: string) => `/api/users/${username}`,
  
  // Prize Config
  PRIZE_CONFIG: '/api/prize-config',
  PRIZE_CONFIG_BY_ID: (id: number) => `/api/prize-config/${id}`,
  
  // Coupons
  COUPONS: '/api/coupons',
  COUPON_BY_NUMBER: (number: string) => `/api/coupons/${number}`,
  COUPONS_GENERATE: '/api/coupons/generate',
  
  // Batches
  BATCHES: '/api/batches',
  BATCH_BY_NUMBER: (number: number) => `/api/batches/${number}`,
  BATCH_DETAIL: (number: number) => `/api/batches/${number}/detail`,
  BATCH_REPORT: (number: number) => `/api/batches/${number}/report`,
  
  // QC Validations
  QC_VALIDATIONS: '/api/qc-validations',
  QC_VALIDATION_BY_ID: (id: number) => `/api/qc-validations/${id}`,
  QC_VALIDATIONS_BY_BATCH: (batchId: number) => `/api/qc-validations/batch/${batchId}`,
  
  // Production Logs
  PRODUCTION_LOGS: '/api/production-logs',
  PRODUCTION_LOG_BY_ID: (id: number) => `/api/production-logs/${id}`,
  PRODUCTION_LOGS_BY_BATCH: (batchId: number) => `/api/production-logs/batch/${batchId}`,
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  QC_STAFF: 'qc_staff',
} as const;

// Batch Status
export const BATCH_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  QC_PASSED: 'qc_passed',
  QC_FAILED: 'qc_failed',
} as const;

// Validation Types
export const VALIDATION_TYPES = {
  DISTRIBUTION_CHECK: 'distribution_check',
  BOX_COMPOSITION: 'box_composition',
  CONSECUTIVE_CHECK: 'consecutive_check',
} as const;

// Validation Status
export const VALIDATION_STATUS = {
  PASS: 'pass',
  FAIL: 'fail',
} as const;

