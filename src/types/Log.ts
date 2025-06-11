// Tipos para los logs del sistema

export type LogOperation = 'create' | 'update' | 'delete';
export type LogCollection = 'product' | 'consumable' | 'contact' | 'quotation' | 'sale' | 'purchase';

export interface LogUser {
  _id: string;
  name: string;
  email: string;
}

// Tipos enriquecidos para contrapartes en logs
export interface LogCounterparty {
  id: string;
  name: string;
  rut: string;
  email?: string;
  isCustomer: boolean;
  isSupplier: boolean;
}

// Tipos específicos para operaciones en transacciones
export interface TransactionLogDetails {
  documentNumber?: string;
  documentType?: 'factura' | 'boleta';
  counterparty?: LogCounterparty;
  totalAmount?: number;
  netAmount?: number;
  taxAmount?: number;
  itemsCount?: number;
  status?: string;
  validUntil?: string;
  isFromQuotation?: boolean;
  operationType?: 'STATUS_CHANGE' | 'QUOTATION_CONVERSION';
  statusTransition?: {
    from: string;
    to: string;
  };
  convertedFrom?: {
    documentNumber: string;
    quotationId: string;
    originalStatus: string;
  };
  conversionData?: {
    totalAmount: number;
    itemsCount: number;
    documentType: string;
  };
  transactionInfo?: {
    totalAmount: number;
    counterparty: string;
    itemsCount: number;
    observations?: string;
  };
  changes?: {
    [key: string]: {
      from: string | number | boolean | null;
      to: string | number | boolean | null;
      percentageChange?: string;
      stockDifference?: number;
    };
  };
  previousValues?: {
    [key: string]: string | number | boolean | null;
  };
  timestamp?: string;
  observations?: string;
}

// Tipos específicos para operaciones en contactos
export interface ContactLogDetails {
  contactName?: string;
  contactRut?: string;
  operationType?: 'CLIENT_CREATION' | 'SUPPLIER_CREATION' | 'CONTACT_CREATION' | 'CONTACT_REACTIVATION' | 'UPDATE' | 'DELETE' | 'MARK_AS_REVIEWED' | 'ROLE_CHANGE';
  contactInfo?: {
    name: string;
    rut: string;
    email?: string;
    phone?: string;
    address?: string;
    roles: {
      isCustomer: boolean;
      isSupplier: boolean;
    };
    needsReview: boolean;
  };
  changes?: {
    [key: string]: {
      from: string | number | boolean | null;
      to: string | number | boolean | null;
    };
  };
  previousValues?: {
    [key: string]: string | number | boolean | null;
  };
  currentValues?: {
    [key: string]: string | number | boolean | null;
  };
  deletionType?: 'full_deletion' | 'role_removal' | 'reactivation';
  deletedData?: {
    name: string;
    rut: string;
    email?: string;
    phone?: string;
    address?: string;
    roles: {
      isCustomer: boolean;
      isSupplier: boolean;
    };
    needsReview: boolean;
    originalCreationDate: string;
  };
  wasReactivated?: boolean;
  sourceController?: string;
  deletionReason?: string;
  previousDeletionStatus?: boolean;
  timestamp?: string;
}

// Tipos específicos para operaciones en items (productos/consumibles)
export interface ItemLogDetails {
  itemName?: string;
  itemType?: 'Product' | 'Consumable';
  operationType?: 'PRODUCT_CREATION' | 'CONSUMABLE_CREATION' | 'UPDATE' | 'DELETE';
  itemInfo?: {
    name: string;
    description: string;
    netPrice: number;
    dimensions?: string;
    stock?: number;
    isInventoried?: boolean;
    itemType: string;
  };
  pricing?: {
    netPrice: number;
    currency: string;
  };
  inventory?: {
    stock?: number;
    isInventoried: boolean;
    hasStock: boolean;
  };
  changes?: {
    [key: string]: {
      from: string | number | boolean | null;
      to: string | number | boolean | null;
      percentageChange?: string;
      stockDifference?: number;
    };
  };
  previousValues?: {
    [key: string]: string | number | boolean | null;
  };
  currentValues?: {
    [key: string]: string | number | boolean | null;
  };
  priceImpact?: {
    oldPrice: number;
    newPrice: number;
    difference: number;
    percentageChange: string;
  };
  stockImpact?: {
    oldStock: number;
    newStock: number;
    difference: number;
    becameInventoried: boolean;
    becameNonInventoried: boolean;
  };
  deletedData?: {
    name: string;
    description: string;
    netPrice: number;
    dimensions?: string;
    stock?: number;
    isInventoried: boolean;
    itemType: string;
    originalCreationDate: string;
  };
  financialImpact?: {
    itemValue: number;
    stockValue: number;
    hadStock: boolean;
    wasInventoried: boolean;
  };
  sourceController?: string;
  deletionReason?: string;
  finalStockValue?: number;
  initialStock?: number;
  timestamp?: string;
}

// Unión de todos los tipos de detalles
export type LogDetails = TransactionLogDetails | ContactLogDetails | ItemLogDetails | {
  [key: string]: string | number | boolean | null | object;
};

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