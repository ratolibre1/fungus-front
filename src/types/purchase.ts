export interface Purchase {
  _id: string;
  number: number;
  documentType: 'factura' | 'boleta';
  documentNumber: string;
  date: string;
  supplier: {
    _id: string;
    name: string;
  };
  description: string;
  items: PurchaseItem[];
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'canceled';
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: {
    _id: string;
    name: string;
  };
}

export interface CreatePurchaseRequest {
  documentType: 'factura' | 'boleta';
  documentNumber: string;
  date?: string;
  supplier: string;
  description: string;
  items: CreatePurchaseItemRequest[];
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status?: 'pending' | 'completed' | 'canceled';
}

export interface CreatePurchaseItemRequest {
  product: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface UpdatePurchaseRequest {
  documentType?: 'factura' | 'boleta';
  documentNumber?: string;
  date?: string;
  supplier?: string;
  description?: string;
  items?: CreatePurchaseItemRequest[];
  netAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  status?: 'pending' | 'completed' | 'canceled';
}

export interface PurchasesResponse {
  success: boolean;
  data: Purchase[];
  count?: number;
}

export interface PurchaseResponse {
  success: boolean;
  data: Purchase;
}

export interface PurchaseSearchParams {
  term?: string;
  status?: 'pending' | 'completed' | 'canceled';
  supplierId?: string;
} 