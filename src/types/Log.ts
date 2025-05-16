// Tipos para los logs del sistema

export type LogOperation = 'create' | 'update' | 'delete';
export type LogCollection = 'product' | 'consumable' | 'contact' | 'quotation' | 'sale' | 'purchase';

export interface LogUser {
  _id: string;
  name: string;
  email: string;
}

export interface LogDetails {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Log {
  _id: string;
  operation: LogOperation;
  collectionType: LogCollection;
  documentId: string;
  userId: LogUser | string;
  details: LogDetails;
  createdAt: string;
  updatedAt: string;
}

export interface LogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LogsResponse {
  success: boolean;
  count: number;
  pagination: LogPagination;
  data: Log[];
}

export interface LogResponse {
  success: boolean;
  data: Log;
}

export interface LogDeleteResponse {
  success: boolean;
  message: string;
  data: Partial<Log>;
}

export interface LogCleanupResponse {
  success: boolean;
  message: string;
}

export interface LogFilters {
  operation?: LogOperation;
  collection?: LogCollection;
  startDate?: string;
  endDate?: string;
  documentId?: string;
  userId?: string;
  page?: number;
  limit?: number;
} 