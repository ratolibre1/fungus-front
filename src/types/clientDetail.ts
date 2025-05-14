// Tipos para la vista de detalle del cliente
export interface ClientBasic {
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

export interface ClientStatistics {
  totalPurchases: number;
  totalSpent: number;
  averagePurchase: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

export interface ClientDetailData {
  client: ClientBasic;
  purchases: Purchase[];
  statistics: ClientStatistics;
  isSupplier?: boolean;
  supplierId?: string;
}

export interface ClientDetailResponse {
  success: boolean;
  data: ClientDetailData;
} 