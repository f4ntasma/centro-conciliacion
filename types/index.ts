// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

export interface DocumentFilter {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Reconciliation Types
export interface Reconciliation {
  id: string;
  name: string;
  status: 'draft' | 'in-progress' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  progress: number;
}

export interface ReconciliationDetail extends Reconciliation {
  details: {
    totalRecords: number;
    matchedRecords: number;
    discrepancies: number;
  };
}

// Statistics Types
export interface DashboardStats {
  totalUsers: number;
  totalDocuments: number;
  totalReconciliations: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'document' | 'reconciliation' | 'user';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
