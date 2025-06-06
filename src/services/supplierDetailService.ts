import httpClient from './httpClient';
import { SupplierDetailResponse } from '../types/supplierDetail';
import { searchClients } from './clientService';

// Función para obtener métricas del proveedor
export const getSupplierMetrics = async (id: string) => {
  const response = await httpClient.get(`/suppliers/${id}/metrics`);
  return response.data;
};

// Función para obtener transacciones del proveedor
export const getSupplierTransactions = async (id: string, page: number = 1, limit: number = 10, type?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  if (type) {
    params.append('type', type);
  }

  const response = await httpClient.get(`/suppliers/${id}/transactions?${params}`);
  return response.data;
};

// Función legacy que combina métricas y transacciones para mantener compatibilidad
export const getSupplierDetails = async (id: string): Promise<SupplierDetailResponse> => {
  try {
    // Obtener métricas y transacciones en paralelo
    const [metricsResponse, transactionsResponse] = await Promise.all([
      getSupplierMetrics(id),
      getSupplierTransactions(id, 1, 50) // Obtener más transacciones para el historial
    ]);

    const metrics = metricsResponse.data;
    const transactions = transactionsResponse.data;

    // Verificar que tenemos datos válidos
    if (!metrics || !transactions) {
      throw new Error('No se pudieron obtener los datos del proveedor');
    }

    // Mapear a la estructura anterior para mantener compatibilidad
    const mappedData = {
      supplier: {
        _id: metrics.supplier?._id || '',
        name: metrics.supplier?.name || 'Sin nombre',
        rut: metrics.supplier?.rut || ''
      },
      purchases: (transactions.transactions || []).map((transaction: { _id: string; documentNumber: string; date: string; totalAmount: number; status: string; itemDetails: Array<{ name: string; quantity: number; unitPrice: number; lineTotal: number }> }) => ({
        _id: transaction._id,
        folio: transaction.documentNumber,
        date: transaction.date,
        total: transaction.totalAmount,
        status: transaction.status.toUpperCase() === 'COMPLETED' ? 'Pagada' :
          transaction.status.toUpperCase() === 'PENDING' ? 'Pendiente' : 'Anulada',
        items: (transaction.itemDetails || []).map((item: { name: string; quantity: number; unitPrice: number; lineTotal: number }) => ({
          product: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.lineTotal
        }))
      })),
      statistics: metrics.purchaseMetrics ? {
        totalPurchases: metrics.purchaseMetrics.totalPurchases || 0,
        totalPaid: metrics.purchaseMetrics.totalSpent || 0,
        averagePurchase: metrics.purchaseMetrics.averageTicket || 0,
        firstPurchaseDate: metrics.purchaseMetrics.firstPurchase,
        lastPurchaseDate: metrics.purchaseMetrics.lastPurchase
      } : undefined,
      isCustomer: metrics.supplier?.isCustomer || false,
      customerId: metrics.supplier?.isCustomer ? metrics.supplier._id : undefined
    };

    // Buscar si este proveedor también es cliente por RUT
    try {
      if (mappedData.supplier.rut) {
        const clientsResponse = await searchClients({ term: mappedData.supplier.rut });

        if (clientsResponse.data.length > 0) {
          // Encontramos un cliente con el mismo RUT
          const matchingClient = clientsResponse.data.find(
            client => client.rut === mappedData.supplier.rut
          );

          if (matchingClient) {
            mappedData.isCustomer = true;
            mappedData.customerId = matchingClient._id;
          }
        }
      }
    } catch (error) {
      console.error("Error al buscar cliente correspondiente:", error);
    }

    return {
      success: true,
      data: mappedData
    };
  } catch (error) {
    console.error('Error fetching supplier details:', error);
    throw error;
  }
}; 