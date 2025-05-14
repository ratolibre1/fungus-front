export interface Consumable {
  _id: string;
  name: string;
  description: string;
  netPrice: number;
  stock: number | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  itemType: string;
}

export interface ConsumableResponse {
  success: boolean;
  data: Consumable;
}

export interface ConsumablesResponse {
  success: boolean;
  count: number;
  data: Consumable[] | [];
}

export interface CreateConsumableRequest {
  name: string;
  description: string;
  netPrice: number;
  stock: number | null;
}

export interface UpdateConsumableRequest {
  name?: string;
  description?: string;
  netPrice?: number;
  stock?: number | null;
}

export interface ConsumableFilters {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
} 