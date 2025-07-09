import { fetchWithInterceptor, getAuthHeaders } from './apiInterceptor';
// Importar la nueva función de conversión
import { convertQuotationToSale } from './saleService';
const API_URL = import.meta.env.VITE_API_URL;
/**
 * Obtiene todas las cotizaciones con filtros opcionales
 */
export const getQuotations = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page)
        params.append('page', filters.page.toString());
    if (filters.limit)
        params.append('limit', filters.limit.toString());
    if (filters.status)
        params.append('status', filters.status);
    if (filters.startDate)
        params.append('startDate', filters.startDate);
    if (filters.endDate)
        params.append('endDate', filters.endDate);
    if (filters.counterparty)
        params.append('counterparty', filters.counterparty);
    if (filters.sortField)
        params.append('sort', filters.sortField);
    if (filters.sortDirection)
        params.append('order', filters.sortDirection);
    const url = `${API_URL}/quotations${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetchWithInterceptor(url, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Obtiene una cotización por su ID
 */
export const getQuotation = async (id) => {
    const response = await fetchWithInterceptor(`${API_URL}/quotations/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Crea una nueva cotización
 */
export const createQuotation = async (data) => {
    const response = await fetchWithInterceptor(`${API_URL}/quotations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};
/**
 * Actualiza una cotización existente
 */
export const updateQuotation = async (id, data) => {
    const response = await fetchWithInterceptor(`${API_URL}/quotations/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};
/**
 * Preview de cotización (sin guardar)
 */
export const previewQuotation = async (data) => {
    const response = await fetchWithInterceptor(`${API_URL}/quotations/preview`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};
/**
 * Elimina una cotización (borrado lógico)
 */
export const deleteQuotation = async (id) => {
    const response = await fetchWithInterceptor(`${API_URL}/quotations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Actualiza el estado de una cotización
 * ⚠️ DEPRECADO: Para conversión a venta, usar convertQuotationToSale en su lugar
 */
export const updateQuotationStatus = async (id, status) => {
    const response = await fetchWithInterceptor(`${API_URL}/quotations/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    return response;
};
/**
 * 🔄 Convierte una cotización aprobada a venta
 * Esta función reemplaza el flujo anterior de solo cambiar estado a 'converted'
 *
 * @param quotationId ID de la cotización a convertir
 * @returns Promesa que resuelve con la venta creada
 */
export { convertQuotationToSale };
