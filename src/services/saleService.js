import { fetchWithInterceptor, getAuthHeaders } from './apiInterceptor';
const API_URL = import.meta.env.VITE_API_URL;
/**
 * Obtiene todas las ventas con filtros opcionales
 */
export const getSales = async (filters = {}) => {
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
    const url = `${API_URL}/sales${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetchWithInterceptor(url, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Obtiene una venta por su ID
 */
export const getSale = async (id) => {
    const response = await fetchWithInterceptor(`${API_URL}/sales/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Crea una nueva venta
 */
export const createSale = async (data) => {
    const response = await fetchWithInterceptor(`${API_URL}/sales`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};
/**
 * Actualiza una venta existente
 */
export const updateSale = async (id, data) => {
    const response = await fetchWithInterceptor(`${API_URL}/sales/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};
/**
 * Preview de venta (sin guardar)
 */
export const previewSale = async (data) => {
    const response = await fetchWithInterceptor(`${API_URL}/sales/preview`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};
/**
 * Elimina una venta (borrado lógico)
 */
export const deleteSale = async (id) => {
    const response = await fetchWithInterceptor(`${API_URL}/sales/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Actualiza el estado de una venta
 */
export const updateSaleStatus = async (id, status) => {
    const response = await fetchWithInterceptor(`${API_URL}/sales/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    return response;
};
/**
 * 🔄 Convierte una cotización aprobada a venta
 * Esta es la nueva función principal que reemplaza el cambio manual de estado
 */
export const convertQuotationToSale = async (quotationId) => {
    const response = await fetchWithInterceptor(`${API_URL}/sales/convert/${quotationId}`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Formatear monto para mostrar en pesos chilenos
 */
export const formatSaleAmount = (amount) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(amount);
};
