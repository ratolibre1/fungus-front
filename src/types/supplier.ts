export interface Supplier {
  _id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  address?: string;
  needsReview?: boolean;
  isCustomer?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  rut: string;
  email: string;
  phone: string;
  address?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  rut?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SuppliersResponse {
  success: boolean;
  data: Supplier[];
}

export interface SupplierResponse {
  success: boolean;
  data: Supplier;
}

export interface SupplierSearchParams {
  term?: string;
} 