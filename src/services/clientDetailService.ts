import httpClient from './httpClient';
import { ClientDetailResponse } from '../types/clientDetail';
import { searchSuppliers } from './supplierService';

// Función para obtener métricas del cliente
export const getClientMetrics = async (id: string) => {
  const response = await httpClient.get(`/clients/${id}/metrics`);
  return response.data;
};

// Función para obtener transacciones del cliente
export const getClientTransactions = async (id: string, page: number = 1, limit: number = 10, type?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  if (type) {
    params.append('type', type);
  }

  const response = await httpClient.get(`/clients/${id}/transactions?${params}`);
  return response.data;
};

// Función legacy que combina métricas y transacciones para mantener compatibilidad
export const getClientDetails = async (id: string): Promise<ClientDetailResponse> => {
  try {
    // Obtener métricas y transacciones en paralelo
    const [metricsResponse, transactionsResponse] = await Promise.all([
      getClientMetrics(id),
      getClientTransactions(id, 1, 50) // Obtener más transacciones para el historial
    ]);

    const metrics = metricsResponse.data;
    const transactions = transactionsResponse.data;

    // Verificar que tenemos datos válidos
    if (!metrics || !transactions) {
      throw new Error('No se pudieron obtener los datos del cliente');
    }

    // Mapear a la estructura anterior para mantener compatibilidad
    const mappedData = {
      client: {
        _id: metrics.client?._id || '',
        name: metrics.client?.name || 'Sin nombre',
        rut: metrics.client?.rut || ''
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
      statistics: metrics.salesMetrics ? {
        totalPurchases: metrics.salesMetrics.totalSales || 0,
        totalSpent: metrics.salesMetrics.totalRevenue || 0,
        averagePurchase: metrics.salesMetrics.averageTicket || 0,
        firstPurchaseDate: metrics.salesMetrics.firstSale,
        lastPurchaseDate: metrics.salesMetrics.lastSale
      } : undefined,
      isSupplier: metrics.client?.isSupplier || false,
      supplierId: metrics.client?.isSupplier ? metrics.client._id : undefined
    };

    // Buscar si este cliente también es proveedor por RUT
    try {
      if (mappedData.client.rut) {
        const suppliersResponse = await searchSuppliers({ term: mappedData.client.rut });

        if (suppliersResponse.data.length > 0) {
          // Encontramos un proveedor con el mismo RUT
          const matchingSupplier = suppliersResponse.data.find(
            supplier => supplier.rut === mappedData.client.rut
          );

          if (matchingSupplier) {
            mappedData.isSupplier = true;
            mappedData.supplierId = matchingSupplier._id;
          }
        }
      }
    } catch (error) {
      console.error("Error al buscar proveedor correspondiente:", error);
    }

    return {
      success: true,
      data: mappedData
    };
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
}; 