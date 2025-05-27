import { fetchWithInterceptor, getAuthHeaders } from './apiInterceptor';
import {
  QuotationsResponse,
  QuotationResponse,
  QuotationStatusUpdateResponse,
  QuotationDeleteResponse,
  QuotationFilters,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationPreviewRequest,
  QuotationPreviewResponse
} from '../types/quotation';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene todas las cotizaciones con filtros opcionales
 */
export const getQuotations = async (filters: QuotationFilters = {}): Promise<QuotationsResponse> => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.counterparty) params.append('counterparty', filters.counterparty);
  if (filters.sortField) params.append('sortField', filters.sortField);
  if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

  const url = `${API_URL}/quotations${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetchWithInterceptor<QuotationsResponse>(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return response as unknown as QuotationsResponse;
};

/**
 * Obtiene una cotización por su ID
 */
export const getQuotation = async (id: string): Promise<QuotationResponse> => {
  const response = await fetchWithInterceptor<QuotationResponse>(`${API_URL}/quotations/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return response as unknown as QuotationResponse;
};

/**
 * Crea una nueva cotización
 */
export const createQuotation = async (data: CreateQuotationRequest): Promise<QuotationResponse> => {
  const response = await fetchWithInterceptor<QuotationResponse>(`${API_URL}/quotations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return response as unknown as QuotationResponse;
};

/**
 * Actualiza una cotización existente
 */
export const updateQuotation = async (id: string, data: UpdateQuotationRequest): Promise<QuotationResponse> => {
  const response = await fetchWithInterceptor<QuotationResponse>(`${API_URL}/quotations/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return response as unknown as QuotationResponse;
};

/**
 * Preview de cotización (sin guardar)
 */
export const previewQuotation = async (data: QuotationPreviewRequest): Promise<QuotationPreviewResponse> => {
  const response = await fetchWithInterceptor<QuotationPreviewResponse>(`${API_URL}/quotations/preview`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return response as unknown as QuotationPreviewResponse;
};

/**
 * Elimina una cotización (borrado lógico)
 */
export const deleteQuotation = async (id: string): Promise<QuotationDeleteResponse> => {
  const response = await fetchWithInterceptor<QuotationDeleteResponse>(`${API_URL}/quotations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return response as unknown as QuotationDeleteResponse;
};

/**
 * Actualiza el estado de una cotización
 */
export const updateQuotationStatus = async (id: string, status: string): Promise<QuotationStatusUpdateResponse> => {
  const response = await fetchWithInterceptor<QuotationStatusUpdateResponse>(`${API_URL}/quotations/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  return response as unknown as QuotationStatusUpdateResponse;
}; 