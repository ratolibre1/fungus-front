import { SupplierDetailResponse, SupplierDetailData } from '../types/supplierDetail';
import { handleApiResponse, getAuthHeaders } from './apiInterceptor';
import { searchClients } from './clientService';

const API_URL = import.meta.env.VITE_API_URL;

// Obtener detalles completos de un proveedor específico
export const getSupplierDetails = async (id: string): Promise<SupplierDetailResponse> => {
  const response = await fetch(`${API_URL}/suppliers/${id}/details`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const apiResponse = await handleApiResponse<SupplierDetailData>(response);

  // Buscar si este proveedor también es cliente por RUT
  try {
    if (apiResponse.data.supplier.rut) {
      const clientsResponse = await searchClients({ term: apiResponse.data.supplier.rut });

      if (clientsResponse.data.length > 0) {
        // Encontramos un cliente con el mismo RUT
        const matchingClient = clientsResponse.data.find(
          client => client.rut === apiResponse.data.supplier.rut
        );

        if (matchingClient) {
          apiResponse.data.isCustomer = true;
          apiResponse.data.customerId = matchingClient._id;
        }
      }
    }
  } catch (error) {
    console.error("Error al buscar cliente correspondiente:", error);
  }

  return {
    success: apiResponse.success,
    data: apiResponse.data
  };
}; 