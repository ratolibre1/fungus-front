export interface Sale {
  _id: string;
  correlative: number;
  documentType: 'factura' | 'boleta';
  documentNumber: number | string;
  date: string;
  client: {
    _id: string;
    name: string;
    rut: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: SaleItem[];
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  seller?: {
    _id: string;
    name: string;
    email?: string;
  };
  quotationRef?: {
    _id: string;
    correlative: number;
    date: string;
  };
  observations?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  _id?: string;
  product: {
    _id: string;
    name: string;
    description?: string;
    netPrice?: number;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface CreateSaleRequest {
  documentType: 'factura' | 'boleta';
  date?: string;
  client: string;
  items: CreateSaleItemRequest[];
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  quotationRef?: string;
  observations?: string;
}

export interface CreateSaleItemRequest {
  product: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface UpdateSaleRequest {
  documentType?: 'factura' | 'boleta';
  date?: string;
  client?: string;
  items?: CreateSaleItemRequest[];
  netAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  quotationRef?: string;
  observations?: string;
}

export interface SalesResponse {
  success: boolean;
  count?: number;
  data: Sale[];
}

export interface SaleResponse {
  success: boolean;
  data: Sale;
}

export interface SaleSearchParams {
  term?: string;
  startDate?: string;
  endDate?: string;
  clientId?: string;
}

export interface PeriodRequest {
  startDate: string;
  endDate: string;
}

export interface PeriodResponse {
  success: boolean;
  data: {
    sales: Sale[];
    summary: {
      totalSales: number;
      totalAmount: number;
      totalNetAmount: number;
      totalTaxAmount: number;
      byDocumentType: {
        [key: string]: {
          count: number;
          amount: number;
        }
      }
    }
  }
}

export interface ClientSalesResponse {
  success: boolean;
  count: number;
  data: {
    client: {
      _id: string;
      name: string;
      rut: string;
      email?: string;
      phone?: string;
      address?: string;
      isCustomer: boolean;
      isSupplier: boolean;
      isDeleted: boolean;
    };
    sales: Sale[];
    statistics: {
      totalSales: number;
      totalAmount: number;
      averageAmount: number;
      firstPurchase: string;
      lastPurchase: string;
    }
  }
}

export interface SalePdfResponse {
  success: boolean;
  message: string;
  data: {
    sale: Sale;
    companyInfo: {
      name: string;
      rut: string;
      address: string;
      phone: string;
      email: string;
    };
    generatedAt: string;
  }
} 