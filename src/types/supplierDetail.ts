// Tipos para la vista de detalle del proveedor
export interface SupplierBasic {
  _id: string;
  name: string;
  rut: string;
}

export interface PurchaseItem {
  product: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Purchase {
  _id: string;
  folio: string;
  date: string;
  total: number;
  status: string;
  items: PurchaseItem[];
}

export interface SupplierStatistics {
  totalPurchases: number;
  totalPaid: number;
  averagePurchase: number;
  firstPurchaseDate: string | null;
  lastPurchaseDate: string | null;
}

export interface SupplierDetailData {
  supplier: SupplierBasic;
  purchases?: Purchase[];
  statistics?: SupplierStatistics;
  isCustomer?: boolean;
  customerId?: string;
}

export interface SupplierDetailResponse {
  success: boolean;
  data: SupplierDetailData;
}

// Nuevos tipos para los endpoints del backend
export interface SupplierMetrics {
  _id: string;
  name: string;
  rut: string;
  email?: string;
  phone?: string;
  address?: string;
  isCustomer: boolean;
  isSupplier: boolean;
}

export interface PurchaseMetrics {
  totalPurchases: number;
  totalSpent: number;
  averageTicket: number;
  minAmount: number;
  maxAmount: number;
  firstPurchase: string | null;
  lastPurchase: string | null;
}

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  minAmount: number;
  maxAmount: number;
  firstSale: string | null;
  lastSale: string | null;
}

export interface SupplierMetricsResponse {
  success: boolean;
  data: {
    supplier: SupplierMetrics;
    purchaseMetrics?: PurchaseMetrics;
    salesMetrics?: SalesMetrics;
  };
}

export interface TransactionItem {
  _id: string;
  name: string;
  description: string;
  netPrice: number;
  dimensions?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Transaction {
  _id: string;
  type: 'PURCHASE' | 'SALE';
  correlative: number;
  documentType: string;
  documentNumber: string;
  date: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  itemDetails: TransactionItem[];
  userDetails: {
    _id: string;
    name: string;
    email: string;
  };
  relatedQuotationDetails?: {
    _id: string;
    documentNumber: string;
    status: string;
  };
}

export interface TransactionsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SupplierTransactionsResponse {
  success: boolean;
  data: {
    supplier: SupplierMetrics;
    transactions: Transaction[];
    pagination: TransactionsPagination;
  };
} 