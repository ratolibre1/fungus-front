import { fetchWithInterceptor, getAuthHeaders } from './apiInterceptor';
const API_URL = import.meta.env.VITE_API_URL;
// Agregar rol de proveedor a un cliente
export const addSupplierRole = async (contactId) => {
    return fetchWithInterceptor(`${API_URL}/contacts/${contactId}/add-supplier-role`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });
};
// Agregar rol de cliente a un proveedor  
export const addCustomerRole = async (contactId) => {
    return fetchWithInterceptor(`${API_URL}/contacts/${contactId}/add-customer-role`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });
};
// Quitar rol de proveedor (mantener como cliente)
export const removeSupplierRole = async (contactId) => {
    return fetchWithInterceptor(`${API_URL}/contacts/${contactId}/remove-supplier-role`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });
};
// Quitar rol de cliente (mantener como proveedor)
export const removeCustomerRole = async (contactId) => {
    return fetchWithInterceptor(`${API_URL}/contacts/${contactId}/remove-customer-role`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });
};
