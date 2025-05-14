import {
  ClientResponse,
  ClientsResponse,
  CreateClientRequest,
  UpdateClientRequest,
  ClientSearchParams
} from '../types/client';
import { fetchWithInterceptor, getAuthHeaders } from './apiInterceptor';

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todos los clientes
export const getClients = async (): Promise<ClientsResponse> => {
  return fetchWithInterceptor<ClientsResponse>(`${API_URL}/clients`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

// Buscar clientes por término
export const searchClients = async (params: ClientSearchParams): Promise<ClientsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.term) {
    queryParams.append('term', params.term);
  }

  return fetchWithInterceptor<ClientsResponse>(`${API_URL}/clients/search?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

// Obtener un cliente específico por ID
export const getClient = async (id: string): Promise<ClientResponse> => {
  return fetchWithInterceptor<ClientResponse>(`${API_URL}/clients/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

// Crear un nuevo cliente
export const createClient = async (client: CreateClientRequest): Promise<ClientResponse> => {
  return fetchWithInterceptor<ClientResponse>(`${API_URL}/clients`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(client)
  });
};

// Actualizar un cliente existente
export const updateClient = async (id: string, client: UpdateClientRequest): Promise<ClientResponse> => {
  return fetchWithInterceptor<ClientResponse>(`${API_URL}/clients/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(client)
  });
};

// Eliminar un cliente
export const deleteClient = async (id: string): Promise<{ success: boolean, data: Record<string, never> }> => {
  return fetchWithInterceptor<Record<string, never>>(`${API_URL}/clients/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}; 