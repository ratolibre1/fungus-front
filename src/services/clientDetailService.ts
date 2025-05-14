import { ClientDetailResponse, ClientDetailData } from '../types/clientDetail';
import { handleApiResponse, getAuthHeaders } from './apiInterceptor';
import { searchSuppliers } from './supplierService';

const API_URL = import.meta.env.VITE_API_URL;

// Obtener detalles completos de un cliente específico
export const getClientDetails = async (id: string): Promise<ClientDetailResponse> => {
  const response = await fetch(`${API_URL}/clients/${id}/details`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const apiResponse = await handleApiResponse<ClientDetailData>(response);

  // Buscar si este cliente también es proveedor por RUT
  try {
    if (apiResponse.data.client.rut) {
      const suppliersResponse = await searchSuppliers({ term: apiResponse.data.client.rut });

      if (suppliersResponse.data.length > 0) {
        // Encontramos un proveedor con el mismo RUT
        const matchingSupplier = suppliersResponse.data.find(
          supplier => supplier.rut === apiResponse.data.client.rut
        );

        if (matchingSupplier) {
          apiResponse.data.isSupplier = true;
          apiResponse.data.supplierId = matchingSupplier._id;
        }
      }
    }
  } catch (error) {
    console.error("Error al buscar proveedor correspondiente:", error);
  }

  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
}; 