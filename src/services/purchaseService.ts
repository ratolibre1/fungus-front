import {
  PurchaseResponse,
  PurchasesResponse,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchaseSearchParams,
  Purchase
} from '../types/purchase';
import { handleApiResponse, getAuthHeaders } from './apiInterceptor';

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todas las compras
export const getPurchases = async (): Promise<PurchasesResponse> => {
  const response = await fetch(`${API_URL}/purchases`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  // Usar unknown para el tipo y validar la estructura después
  const apiResponse = await handleApiResponse<unknown>(response);
  console.log('Respuesta original API en purchaseService:', apiResponse);

  const result: PurchasesResponse = {
    success: true,
    data: []
  };

  if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
    result.success = (apiResponse as any).success;

    // Verificar la estructura de la respuesta para manejar ambos casos
    if ('data' in apiResponse && typeof (apiResponse as any).data === 'object') {
      if ('data' in (apiResponse as any).data && Array.isArray((apiResponse as any).data.data)) {
        // Estructura: { success: true, data: { count: number, data: Purchase[] } }
        result.data = (apiResponse as any).data.data || [];
      } else if (Array.isArray((apiResponse as any).data)) {
        // Estructura: { success: true, data: Purchase[] }
        result.data = (apiResponse as any).data || [];
      }
    }
  }

  return result;
};

// Buscar compras por término
export const searchPurchases = async (params: PurchaseSearchParams): Promise<PurchasesResponse> => {
  const queryParams = new URLSearchParams();

  if (params.term) {
    queryParams.append('term', params.term);
  }
  if (params.status) {
    queryParams.append('status', params.status);
  }
  if (params.supplierId) {
    queryParams.append('supplierId', params.supplierId);
  }

  const response = await fetch(`${API_URL}/purchases/search?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  // Usar unknown para el tipo y validar la estructura después
  const apiResponse = await handleApiResponse<unknown>(response);
  console.log('Respuesta de búsqueda API en purchaseService:', apiResponse);

  const result: PurchasesResponse = {
    success: true,
    data: []
  };

  if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
    result.success = (apiResponse as any).success;

    // Verificar la estructura de la respuesta para manejar ambos casos
    if ('data' in apiResponse && typeof (apiResponse as any).data === 'object') {
      if ('data' in (apiResponse as any).data && Array.isArray((apiResponse as any).data.data)) {
        // Estructura: { success: true, data: { count: number, data: Purchase[] } }
        result.data = (apiResponse as any).data.data || [];
      } else if (Array.isArray((apiResponse as any).data)) {
        // Estructura: { success: true, data: Purchase[] }
        result.data = (apiResponse as any).data || [];
      }
    }
  }

  return result;
};

// Obtener una compra específica por ID
export const getPurchase = async (id: string): Promise<PurchaseResponse> => {
  const response = await fetch(`${API_URL}/purchases/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const apiResponse = await handleApiResponse<Purchase>(response);
  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
};

// Crear una nueva compra
export const createPurchase = async (purchase: CreatePurchaseRequest): Promise<PurchaseResponse> => {
  // Validamos que los cálculos sean correctos
  validateCalculations(purchase);

  const response = await fetch(`${API_URL}/purchases`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(purchase)
  });

  const apiResponse = await handleApiResponse<Purchase>(response);
  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
};

// Actualizar una compra existente
export const updatePurchase = async (id: string, purchase: UpdatePurchaseRequest): Promise<PurchaseResponse> => {
  // Si hay items, validamos los cálculos
  if (purchase.items && purchase.items.length > 0 && purchase.netAmount !== undefined && purchase.taxAmount !== undefined && purchase.totalAmount !== undefined) {
    validateCalculations(purchase as CreatePurchaseRequest);
  }

  const response = await fetch(`${API_URL}/purchases/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(purchase)
  });

  const apiResponse = await handleApiResponse<Purchase>(response);
  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
};

// Cambiar el estado de una compra
export const updatePurchaseStatus = async (id: string, status: 'pending' | 'completed' | 'canceled'): Promise<PurchaseResponse> => {
  const response = await fetch(`${API_URL}/purchases/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  const apiResponse = await handleApiResponse<Purchase>(response);
  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
};

// Eliminar una compra
export const deletePurchase = async (id: string): Promise<{ success: boolean, data: Record<string, never> }> => {
  const response = await fetch(`${API_URL}/purchases/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const apiResponse = await handleApiResponse<Record<string, never>>(response);
  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
};

// Función para validar que los cálculos sean correctos
const validateCalculations = (purchase: CreatePurchaseRequest): void => {
  // Validar los subtotales de cada item
  let calculatedNetAmount = 0;

  purchase.items.forEach(item => {
    const calculatedSubtotal = item.quantity * item.unitPrice;
    if (Math.abs(calculatedSubtotal - item.subtotal) > 0.01) {
      throw new Error('Error en los cálculos: El subtotal de un item no coincide con quantity × unitPrice');
    }
    calculatedNetAmount += item.subtotal;
  });

  // Validar el monto neto
  if (Math.abs(calculatedNetAmount - purchase.netAmount) > 0.01) {
    throw new Error('Error en los cálculos: El monto neto no coincide con la suma de los subtotales');
  }

  // Validar el monto de impuestos (19%)
  const calculatedTaxAmount = purchase.netAmount * 0.19;
  if (Math.abs(calculatedTaxAmount - purchase.taxAmount) > 0.01) {
    throw new Error('Error en los cálculos: El monto de impuestos no coincide con el 19% del monto neto');
  }

  // Validar el monto total
  const calculatedTotalAmount = purchase.netAmount + purchase.taxAmount;
  if (Math.abs(calculatedTotalAmount - purchase.totalAmount) > 0.01) {
    throw new Error('Error en los cálculos: El monto total no coincide con la suma del neto más impuestos');
  }
}; 