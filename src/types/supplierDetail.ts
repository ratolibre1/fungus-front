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
  purchases: Purchase[];
  statistics: SupplierStatistics;
  isCustomer?: boolean;
  customerId?: string;
}

export interface SupplierDetailResponse {
  success: boolean;
  data: SupplierDetailData;
} 