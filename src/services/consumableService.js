import { handleApiResponse, getAuthHeaders } from './apiInterceptor';
const API_URL = import.meta.env.VITE_API_URL;
// Obtener todos los consumibles con filtros opcionales
export const getConsumables = async (filters = {}) => {
    // Construir la URL con los filtros
    let url = `${API_URL}/consumables`;
    const queryParams = [];
    if (filters.minPrice !== undefined)
        queryParams.push(`minPrice=${filters.minPrice}`);
    if (filters.maxPrice !== undefined)
        queryParams.push(`maxPrice=${filters.maxPrice}`);
    if (filters.inStock !== undefined)
        queryParams.push(`inStock=${filters.inStock}`);
    if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
    }
    // Realizar la petición
    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    // Asumiendo que la API devuelve directamente: { success, count, data[] }
    const apiResponse = await handleApiResponse(response);
    console.log('API Response en getConsumables:', apiResponse);
    return {
        success: apiResponse.success,
        count: apiResponse.count || 0,
        data: apiResponse.data || []
    };
};
// Obtener un consumible específico por ID
export const getConsumable = async (id) => {
    const response = await fetch(`${API_URL}/consumables/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Crear un nuevo consumible
export const createConsumable = async (consumable) => {
    const response = await fetch(`${API_URL}/consumables`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(consumable)
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Actualizar un consumible existente
export const updateConsumable = async (id, consumable) => {
    const response = await fetch(`${API_URL}/consumables/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(consumable)
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Eliminar un consumible
export const deleteConsumable = async (id) => {
    const response = await fetch(`${API_URL}/consumables/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
