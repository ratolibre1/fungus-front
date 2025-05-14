export interface QuotationClient {
  _id: string;
  name: string;
  rut: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface QuotationSeller {
  _id: string;
  name: string;
  email: string;
}

export interface QuotationProduct {
  _id: string;
  name: string;
  description: string;
  netPrice: number;
}

export interface QuotationItem {
  _id: string;
  product: QuotationProduct | string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface CreateQuotationItem {
  product: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export type QuotationStatus = 'pending' | 'approved' | 'rejected' | 'converted' | 'expired';

export interface Quotation {
  _id: string;
  correlative: number;
  date: string;
  client: QuotationClient | string;
  items?: QuotationItem[];
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: QuotationStatus;
  seller: QuotationSeller | string;
  observations: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuotationRequest {
  client: string;
  date: string;
  items: CreateQuotationItem[];
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  observations?: string;
}

export interface UpdateQuotationRequest {
  status?: QuotationStatus;
  observations?: string;
}

export interface ConvertToSaleRequest {
  documentType: 'boleta' | 'factura';
  documentNumber: number;
}

export interface QuotationFilterParams {
  client?: string;
  startDate?: string;
  endDate?: string;
  status?: QuotationStatus;
}

export interface QuotationsResponse {
  success: boolean;
  count: number;
  data: Quotation[];
}

export interface QuotationResponse {
  success: boolean;
  data: Quotation;
}

export interface ConvertToSaleResponse {
  success: boolean;
  message: string;
  data: {
    sale: any; // Podríamos definir un tipo Sale si fuera necesario
    quotation: {
      _id: string;
      status: QuotationStatus;
    }
  }
} 