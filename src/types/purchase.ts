export type PurchaseStatus = 'pending' | 'received' | 'rejected';
export type DocumentType = 'boleta' | 'factura';

export interface PurchaseItem {
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

export interface Purchase {
  _id: string;
  type: 'purchase';
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
  items: PurchaseItem[];
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  status: PurchaseStatus;
  user: string | {
    _id: string;
    name: string;
    email?: string;
  };
  isDeleted: boolean;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchasePreviewRequest {
  documentType: DocumentType;
  items: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  taxRate?: number;
}

export interface PurchasePreviewResponse {
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

export interface PurchasePagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PurchasesResponse {
  success: boolean;
  count: number;
  pagination: PurchasePagination;
  data: Purchase[];
}

export interface PurchaseResponse {
  success: boolean;
  data: Purchase;
}

export interface PurchaseStatusUpdateResponse {
  success: boolean;
  data: Purchase;
}

export interface PurchaseDeleteResponse {
  success: boolean;
  message: string;
}

export interface CreatePurchaseRequest {
  documentType: DocumentType;
  counterparty: string;
  items: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  date?: string;
  taxRate?: number;
  observations?: string;
}

export interface UpdatePurchaseRequest {
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

export interface PurchaseFilters {
  page?: number;
  limit?: number;
  status?: PurchaseStatus;
  startDate?: string;
  endDate?: string;
  counterparty?: string;
  user?: string;
  minAmount?: number;
  maxAmount?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

// Estados y transiciones válidas según especificación backend
export const PURCHASE_STATUSES = {
  PENDING: 'pending' as const,
  RECEIVED: 'received' as const,
  REJECTED: 'rejected' as const
};

export const VALID_PURCHASE_TRANSITIONS: Record<PurchaseStatus, PurchaseStatus[]> = {
  pending: ['received', 'rejected'],
  received: [], // Estado final
  rejected: [] // Estado final
};

// Utilidades para validaciones
export const canChangePurchaseStatus = (currentStatus: PurchaseStatus, newStatus: PurchaseStatus): boolean => {
  return VALID_PURCHASE_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

export const getPurchaseStatusColor = (status: PurchaseStatus): string => {
  const colors = {
    pending: 'warning',
    received: 'success',
    rejected: 'danger'
  };
  return colors[status] || 'secondary';
};

export const getPurchaseStatusLabel = (status: PurchaseStatus): string => {
  const labels = {
    pending: 'Pendiente',
    received: 'Recibida',
    rejected: 'Rechazada'
  };
  return labels[status] || status;
}; 