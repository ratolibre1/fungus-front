import {
  SalesResponse,
  SaleResponse,
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleSearchParams,
  PeriodRequest,
  PeriodResponse,
  ClientSalesResponse,
  SalePdfResponse
} from '../types/sale';
import { handleApiResponse, getAuthHeaders } from './apiInterceptor';

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todas las ventas
export const getSales = async (params?: SaleSearchParams): Promise<SalesResponse> => {
  try {
    let url = `${API_URL}/sales`;

    // Agregar parámetros de búsqueda si existen
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.term) queryParams.append('term', params.term);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.clientId) queryParams.append('clientId', params.clientId);

      if (queryParams.toString()) {
        url = `${url}?${queryParams.toString()}`;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw error;
  }
};

// Obtener una venta por ID
export const getSaleById = async (id: string): Promise<SaleResponse> => {
  try {
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error(`Error al obtener venta con ID ${id}:`, error);
    throw error;
  }
};

// Crear una nueva venta
export const createSale = async (saleData: CreateSaleRequest): Promise<SaleResponse> => {
  try {
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(saleData)
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error al crear venta:', error);
    throw error;
  }
};

// Actualizar una venta existente
export const updateSale = async (id: string, saleData: UpdateSaleRequest): Promise<SaleResponse> => {
  try {
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(saleData)
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error(`Error al actualizar venta con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar una venta
export const deleteSale = async (id: string): Promise<SaleResponse> => {
  try {
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error(`Error al eliminar venta con ID ${id}:`, error);
    throw error;
  }
};

// Obtener ventas por período
export const getSalesByPeriod = async (periodData: PeriodRequest): Promise<PeriodResponse> => {
  try {
    const response = await fetch(`${API_URL}/sales/period`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(periodData)
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error al obtener ventas por período:', error);
    throw error;
  }
};

// Obtener ventas por cliente
export const getSalesByClient = async (clientId: string): Promise<ClientSalesResponse> => {
  try {
    const response = await fetch(`${API_URL}/sales/client/${clientId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error(`Error al obtener ventas del cliente ${clientId}:`, error);
    throw error;
  }
};

// Generar PDF de una venta
export const generateSalePdf = async (id: string): Promise<SalePdfResponse> => {
  try {
    const response = await fetch(`${API_URL}/sales/${id}/pdf`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error(`Error al generar PDF de la venta ${id}:`, error);
    throw error;
  }
}; 