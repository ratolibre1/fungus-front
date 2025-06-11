export type QuotationStatus = 'pending' | 'approved' | 'rejected' | 'converted';
export type DocumentType = 'boleta' | 'factura';

export interface QuotationItem {
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

export interface Quotation {
  _id: string;
  type: 'quotation';
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
  items: QuotationItem[];
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  status: QuotationStatus;
  user: string | {
    _id: string;
    name: string;
    email?: string;
  };
  isDeleted: boolean;
  description?: string;
  notes?: string;
  validUntil?: string;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationPreviewRequest {
  documentType: DocumentType;
  items: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  taxRate?: number;
}

export interface QuotationPreviewResponse {
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

export interface QuotationPagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QuotationsResponse {
  success: boolean;
  count: number;
  pagination: QuotationPagination;
  data: Quotation[];
}

export interface QuotationResponse {
  success: boolean;
  data: Quotation;
}

export interface QuotationStatusUpdateResponse {
  success: boolean;
  data: Quotation;
}

export interface QuotationDeleteResponse {
  success: boolean;
  message: string;
}

export interface CreateQuotationRequest {
  documentType: DocumentType;
  counterparty: string;
  validUntil?: string;
  items: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  taxRate?: number;
  observations?: string;
}

export interface UpdateQuotationRequest {
  documentType?: DocumentType;
  counterparty?: string;
  validUntil?: string;
  items?: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  taxRate?: number;
  observations?: string;
}

export interface QuotationFilters {
  page?: number;
  limit?: number;
  status?: QuotationStatus;
  startDate?: string;
  endDate?: string;
  counterparty?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
} 