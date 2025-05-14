export interface Client {
  _id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  address?: string;
  isCustomer: boolean;
  isSupplier: boolean;
  isDeleted: boolean;
  needsReview?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientResponse {
  success: boolean;
  data: Client;
}

export interface ClientsResponse {
  success: boolean;
  count: number;
  data: Client[];
}

export interface CreateClientRequest {
  name: string;
  rut: string;
  email: string;
  phone: string;
  address?: string;
}

export interface UpdateClientRequest {
  name?: string;
  rut?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ClientSearchParams {
  term?: string;
} 