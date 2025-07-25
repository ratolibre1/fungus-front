import { handleApiResponse, getAuthHeaders } from './apiInterceptor';
const API_URL = import.meta.env.VITE_API_URL;
// Obtener todos los proveedores
export const getSuppliers = async () => {
    const response = await fetch(`${API_URL}/suppliers`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Buscar proveedores por término
export const searchSuppliers = async (params) => {
    const queryParams = new URLSearchParams();
    if (params.term) {
        queryParams.append('term', params.term);
    }
    const response = await fetch(`${API_URL}/suppliers/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Obtener un proveedor específico por ID
export const getSupplier = async (id) => {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Crear un nuevo proveedor
export const createSupplier = async (supplier) => {
    const response = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplier)
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Actualizar un proveedor existente
export const updateSupplier = async (id, supplier) => {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplier)
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
// Eliminar un proveedor
export const deleteSupplier = async (id) => {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const apiResponse = await handleApiResponse(response);
    return {
        success: apiResponse.success,
        data: apiResponse.data
    };
};
