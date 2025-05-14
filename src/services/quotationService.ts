import {
  QuotationsResponse,
  QuotationResponse,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationFilterParams,
  ConvertToSaleRequest,
  ConvertToSaleResponse,
  Quotation
} from '../types/quotation';
import { handleApiResponse, getAuthHeaders } from './apiInterceptor';

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todas las cotizaciones
export const getQuotations = async (): Promise<QuotationsResponse> => {
  const response = await fetch(`${API_URL}/quotations`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  // Usar unknown para el tipo y validar la estructura después
  const apiResponse = await handleApiResponse<unknown>(response);
  console.log('Respuesta original API en quotationService:', apiResponse);

  const result: QuotationsResponse = {
    success: true,
    count: 0,
    data: []
  };

  if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
    result.success = (apiResponse as any).success;

    // Verificar la estructura de la respuesta para manejar ambos casos
    if ('data' in apiResponse && typeof (apiResponse as any).data === 'object') {
      if ('data' in (apiResponse as any).data && Array.isArray((apiResponse as any).data.data)) {
        // Estructura: { success: true, data: { count: number, data: Quotation[] } }
        result.data = (apiResponse as any).data.data || [];
        result.count = (apiResponse as any).data.count || 0;
      } else if (Array.isArray((apiResponse as any).data)) {
        // Estructura: { success: true, data: Quotation[] }
        result.data = (apiResponse as any).data || [];
        result.count = (apiResponse as any).data.length || 0;
      }
    }

    // Si count está directamente en la respuesta
    if ('count' in apiResponse && typeof (apiResponse as any).count === 'number') {
      result.count = (apiResponse as any).count;
    }
  }

  return result;
};

// Obtener una cotización específica por ID
export const getQuotation = async (id: string): Promise<QuotationResponse> => {
  const response = await fetch(`${API_URL}/quotations/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const apiResponse = await handleApiResponse<Quotation>(response);
  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
};

// Crear una nueva cotización
export const createQuotation = async (quotation: CreateQuotationRequest): Promise<QuotationResponse> => {
  const response = await fetch(`${API_URL}/quotations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(quotation)
  });

  const apiResponse = await handleApiResponse<Quotation>(response);
  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
};

// Actualizar una cotización existente
export const updateQuotation = async (id: string, quotation: UpdateQuotationRequest): Promise<QuotationResponse> => {
  const response = await fetch(`${API_URL}/quotations/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(quotation)
  });

  const apiResponse = await handleApiResponse<Quotation>(response);
  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
};

// Eliminar una cotización
export const deleteQuotation = async (id: string): Promise<{ success: boolean, data: Record<string, never> }> => {
  const response = await fetch(`${API_URL}/quotations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const apiResponse = await handleApiResponse<Record<string, never>>(response);
  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
};

// Convertir cotización a venta
export const convertToSale = async (id: string, data: ConvertToSaleRequest): Promise<ConvertToSaleResponse> => {
  const response = await fetch(`${API_URL}/quotations/${id}/convert`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  type ConversionResponse = {
    sale: any;
    quotation: {
      _id: string;
      status: string;
    };
  };

  const apiResponse = await handleApiResponse<ConversionResponse>(response);
  return {
    success: apiResponse.success,
    message: "Cotización convertida a venta exitosamente",
    data: apiResponse.data
  };
};

// Filtrar cotizaciones
export const filterQuotations = async (filters: QuotationFilterParams): Promise<QuotationsResponse> => {
  const response = await fetch(`${API_URL}/quotations/filter`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(filters)
  });

  const apiResponse = await handleApiResponse<{ count: number, data: Quotation[] }>(response);
  return {
    success: apiResponse.success,
    count: apiResponse.data.count,
    data: apiResponse.data.data
  };
};

// Obtener cotizaciones pendientes
export const getPendingQuotations = async (): Promise<QuotationsResponse> => {
  const response = await fetch(`${API_URL}/quotations/pending`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const apiResponse = await handleApiResponse<{ count: number, data: Quotation[] }>(response);
  return {
    success: apiResponse.success,
    count: apiResponse.data.count,
    data: apiResponse.data.data
  };
}; 