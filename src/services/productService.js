import { handleApiResponse, getAuthHeaders } from './apiInterceptor';
const API_URL = import.meta.env.VITE_API_URL;
// Helper para construir la URL con los filtros
const buildQueryString = (filters) => {
    if (!filters)
        return '';
    const params = new URLSearchParams();
    if (filters.minPrice !== undefined) {
        params.append('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined) {
        params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters.inStock !== undefined) {
        params.append('inStock', filters.inStock.toString());
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
};
// Obtener todos los productos con filtros opcionales
export const getProducts = async (filters) => {
    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_URL}/products${queryString}`, {
        headers: getAuthHeaders()
    });
    // Asumiendo que la API devuelve directamente: { success, count, data[] }
    const apiResponse = await handleApiResponse(response);
    console.log('API Response en getProducts:', apiResponse);
    return {
        success: apiResponse.success,
        count: apiResponse.count || 0,
        data: apiResponse.data || []
    };
};
// Obtener un producto específico
export const getProduct = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        headers: getAuthHeaders()
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Crear un nuevo producto
export const createProduct = async (product) => {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Actualizar un producto existente
export const updateProduct = async (id, updates) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Eliminar un producto
export const deleteProduct = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success
    };
};
