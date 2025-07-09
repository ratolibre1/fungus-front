import { fetchWithInterceptor, getAuthHeaders } from './apiInterceptor';
const API_URL = import.meta.env.VITE_API_URL;
/**
 * Obtiene todas las compras con filtros opcionales
 */
export const getPurchases = async (filters = {}) => {
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
    if (filters.user)
        params.append('user', filters.user);
    if (filters.minAmount)
        params.append('minAmount', filters.minAmount.toString());
    if (filters.maxAmount)
        params.append('maxAmount', filters.maxAmount.toString());
    if (filters.sortField)
        params.append('sort', filters.sortField);
    if (filters.sortDirection)
        params.append('order', filters.sortDirection);
    if (filters.includeDeleted)
        params.append('includeDeleted', 'true');
    const url = `${API_URL}/purchases${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetchWithInterceptor(url, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Obtiene una compra por su ID
 */
export const getPurchase = async (id) => {
    const response = await fetchWithInterceptor(`${API_URL}/purchases/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Crea una nueva compra
 */
export const createPurchase = async (data) => {
    const response = await fetchWithInterceptor(`${API_URL}/purchases`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};
/**
 * Actualiza una compra existente (solo si está en estado pending)
 */
export const updatePurchase = async (id, data) => {
    const response = await fetchWithInterceptor(`${API_URL}/purchases/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};
/**
 * Preview de compra (sin guardar)
 */
export const previewPurchase = async (data) => {
    const response = await fetchWithInterceptor(`${API_URL}/purchases/preview`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response;
};
/**
 * Elimina una compra (borrado lógico - solo si está en estado pending)
 */
export const deletePurchase = async (id) => {
    const response = await fetchWithInterceptor(`${API_URL}/purchases/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return response;
};
/**
 * Actualiza el estado de una compra
 */
export const updatePurchaseStatus = async (id, status) => {
    const response = await fetchWithInterceptor(`${API_URL}/purchases/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    return response;
};
/**
 * Formatear monto para mostrar en pesos chilenos
 */
export const formatPurchaseAmount = (amount) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(amount);
};
