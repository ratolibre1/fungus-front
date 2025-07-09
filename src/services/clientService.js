import { fetchWithInterceptor, getAuthHeaders } from './apiInterceptor';
const API_URL = import.meta.env.VITE_API_URL;
// Obtener todos los clientes
export const getClients = async () => {
    return fetchWithInterceptor(`${API_URL}/clients`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
};
// Buscar clientes por término
export const searchClients = async (params) => {
    const queryParams = new URLSearchParams();
    if (params.term) {
        queryParams.append('term', params.term);
    }
    return fetchWithInterceptor(`${API_URL}/clients/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
};
// Obtener un cliente específico por ID
export const getClient = async (id) => {
    return fetchWithInterceptor(`${API_URL}/clients/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
};
// Crear un nuevo cliente
export const createClient = async (client) => {
    return fetchWithInterceptor(`${API_URL}/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(client)
    });
};
// Actualizar un cliente existente
export const updateClient = async (id, client) => {
    return fetchWithInterceptor(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(client)
    });
};
// Eliminar un cliente
export const deleteClient = async (id) => {
    return fetchWithInterceptor(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
};
