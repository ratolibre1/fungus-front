import { fetchWithInterceptor, getAuthHeaders } from './apiInterceptor';
import {
  SalesResponse,
  SaleResponse,
  SaleStatusUpdateResponse,
  SaleDeleteResponse,
  ConvertQuotationResponse,
  SaleFilters,
  CreateSaleRequest,
  UpdateSaleRequest,
  SalePreviewRequest,
  SalePreviewResponse,
  SaleStatus
} from '../types/sale';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene todas las ventas con filtros opcionales
 */
export const getSales = async (filters: SaleFilters = {}): Promise<SalesResponse> => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.counterparty) params.append('counterparty', filters.counterparty);
  if (filters.sortField) params.append('sort', filters.sortField);
  if (filters.sortDirection) params.append('order', filters.sortDirection);

  const url = `${API_URL}/sales${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetchWithInterceptor<SalesResponse>(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return response as unknown as SalesResponse;
};

/**
 * Obtiene una venta por su ID
 */
export const getSale = async (id: string): Promise<SaleResponse> => {
  const response = await fetchWithInterceptor<SaleResponse>(`${API_URL}/sales/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return response as unknown as SaleResponse;
};

/**
 * Crea una nueva venta
 */
export const createSale = async (data: CreateSaleRequest): Promise<SaleResponse> => {
  const response = await fetchWithInterceptor<SaleResponse>(`${API_URL}/sales`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return response as unknown as SaleResponse;
};

/**
 * Actualiza una venta existente
 */
export const updateSale = async (id: string, data: UpdateSaleRequest): Promise<SaleResponse> => {
  const response = await fetchWithInterceptor<SaleResponse>(`${API_URL}/sales/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return response as unknown as SaleResponse;
};

/**
 * Preview de venta (sin guardar)
 */
export const previewSale = async (data: SalePreviewRequest): Promise<SalePreviewResponse> => {
  const response = await fetchWithInterceptor<SalePreviewResponse>(`${API_URL}/sales/preview`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return response as unknown as SalePreviewResponse;
};

/**
 * Elimina una venta (borrado lógico)
 */
export const deleteSale = async (id: string): Promise<SaleDeleteResponse> => {
  const response = await fetchWithInterceptor<SaleDeleteResponse>(`${API_URL}/sales/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return response as unknown as SaleDeleteResponse;
};

/**
 * Actualiza el estado de una venta
 */
export const updateSaleStatus = async (id: string, status: SaleStatus): Promise<SaleStatusUpdateResponse> => {
  const response = await fetchWithInterceptor<SaleStatusUpdateResponse>(`${API_URL}/sales/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  return response as unknown as SaleStatusUpdateResponse;
};

/**
 * 🔄 Convierte una cotización aprobada a venta
 * Esta es la nueva función principal que reemplaza el cambio manual de estado
 */
export const convertQuotationToSale = async (quotationId: string): Promise<ConvertQuotationResponse> => {
  const response = await fetchWithInterceptor<ConvertQuotationResponse>(`${API_URL}/sales/convert/${quotationId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  return response as unknown as ConvertQuotationResponse;
};

/**
 * Formatear monto para mostrar en pesos chilenos
 */
export const formatSaleAmount = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
}; 