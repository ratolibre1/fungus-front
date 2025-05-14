export interface Product {
  _id: string;
  name: string;
  description: string;
  netPrice: number;
  stock: number | null;
  dimensions?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  itemType: string;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  data: Product[] | [];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  netPrice: number;
  stock: number | null;
  dimensions?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  netPrice?: number;
  stock?: number | null;
  dimensions?: string;
}

export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
} 