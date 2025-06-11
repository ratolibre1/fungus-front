export type SaleStatus = 'pending' | 'invoiced' | 'paid';
export type DocumentType = 'boleta' | 'factura';

export interface SaleItem {
  _id?: string;
  itemDetail: {
    _id: string;
    name: string;
    description: string;
    netPrice: number;
    dimensions?: string;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface Sale {
  _id: string;
  type: 'sale';
  correlative: number;
  documentNumber: string;
  documentType: DocumentType;
  date: string;
  counterparty: string | {
    _id: string;
    name: string;
    rut?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: SaleItem[];
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  status: SaleStatus;
  user: string | {
    _id: string;
    name: string;
    email?: string;
  };
  isDeleted: boolean;
  observations?: string;
  relatedQuotation?: string | {
    _id: string;
    documentNumber: string;
    correlative: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SalePreviewRequest {
  documentType: DocumentType;
  items: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  taxRate?: number;
}

export interface SalePreviewResponse {
  success: boolean;
  data: {
    items: {
      _id: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      subtotal: number;
    }[];
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
    taxRate: number;
    documentType: DocumentType;
  };
}

export interface SalePagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SalesResponse {
  success: boolean;
  count: number;
  pagination: SalePagination;
  data: Sale[];
}

export interface SaleResponse {
  success: boolean;
  data: Sale;
}

export interface SaleStatusUpdateResponse {
  success: boolean;
  data: Sale;
}

export interface SaleDeleteResponse {
  success: boolean;
  message: string;
}

export interface ConvertQuotationResponse {
  success: boolean;
  data: Sale;
  message: string;
}

export interface CreateSaleRequest {
  documentType: DocumentType;
  counterparty: string;
  items: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  taxRate?: number;
  observations?: string;
  relatedQuotation?: string;
}

export interface UpdateSaleRequest {
  documentType?: DocumentType;
  counterparty?: string;
  items?: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  taxRate?: number;
  observations?: string;
}

export interface SaleFilters {
  page?: number;
  limit?: number;
  status?: SaleStatus;
  startDate?: string;
  endDate?: string;
  counterparty?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// Estados y transiciones válidas según especificación backend
export const SALE_STATUSES = {
  PENDING: 'pending' as const,
  INVOICED: 'invoiced' as const,
  PAID: 'paid' as const
};

export const VALID_SALE_TRANSITIONS: Record<SaleStatus, SaleStatus[]> = {
  pending: ['invoiced'],
  invoiced: ['paid'],
  paid: [] // Estado final
};

// Utilidades para validaciones
export const canChangeSaleStatus = (currentStatus: SaleStatus, newStatus: SaleStatus): boolean => {
  return VALID_SALE_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

export const getSaleStatusColor = (status: SaleStatus): string => {
  const colors = {
    pending: 'warning',
    invoiced: 'primary',
    paid: 'success'
  };
  return colors[status] || 'secondary';
};

export const getSaleStatusLabel = (status: SaleStatus): string => {
  const labels = {
    pending: 'Pendiente',
    invoiced: 'Facturada',
    paid: 'Pagada'
  };
  return labels[status] || status;
}; 