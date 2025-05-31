import React from 'react';
import { Sale, SaleStatus, getSaleStatusLabel, getSaleStatusColor } from '../../types/sale';
import { formatSaleAmount } from '../../services/saleService';

interface SaleDetailsModalProps {
  sale: Sale | null;
  onClose: () => void;
  onEdit?: () => void;
}

export default function SaleDetailsModal({ sale, onClose, onEdit }: SaleDetailsModalProps) {
  if (!sale) return null;

  // Formatear fecha sin horario (solo día/mes/año)
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };

  // Función para formatear el tipo de documento
  const formatDocumentType = (documentType: string) => {
    switch (documentType) {
      case 'boleta':
        return <span className="badge bg-info text-dark">Boleta</span>;
      case 'factura':
        return <span className="badge bg-primary">Factura</span>;
      default:
        return <span className="badge bg-secondary">{documentType}</span>;
    }
  };

  // Obtener badge del estado
  const statusBadge = (status: SaleStatus) => {
    return (
      <span className={`badge bg-${getSaleStatusColor(status)}`}>
        {getSaleStatusLabel(status)}
      </span>
    );
  };

  // Manejar click en nombre del cliente para ir a detalle del comprador
  const handleClientClick = () => {
    if (typeof sale.counterparty === 'object' && sale.counterparty._id) {
      // Navegar a la página de detalle del comprador
      window.location.href = `/comprador/${sale.counterparty._id}`;
    }
  };

  // Obtener nombre del usuario vendedor
  const getUserName = () => {
    return typeof sale.user === 'object' ? sale.user.name : sale.user;
  };

  return (
    <>
      {/* Backdrop del modal */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>

      {/* Modal */}
      <div
        className="modal fade show"
        style={{
          display: 'block',
          zIndex: 1055,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Detalles de Venta {sale.documentNumber}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Cerrar"
              />
            </div>
            <div className="modal-body">
              {/* Información general */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="mb-3">Información General</h6>
                  <p><strong>Fecha:</strong> {formatDate(sale.date)}</p>
                  <p><strong>Tipo de documento:</strong> {formatDocumentType(sale.documentType)}</p>
                  <p><strong>Estado:</strong> {statusBadge(sale.status as SaleStatus)}</p>
                  <p><strong>Correlativo:</strong> {sale.correlative}</p>
                  <p><strong>Vendedor:</strong> {getUserName()}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-3">Cliente</h6>
                  {typeof sale.counterparty === 'object' ? (
                    <>
                      <p>
                        <strong>Nombre:</strong>{' '}
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-underline"
                          style={{ fontSize: 'inherit', color: '#0d6efd' }}
                          onClick={handleClientClick}
                          title="Ver detalles del comprador"
                        >
                          {sale.counterparty.name}
                        </button>
                      </p>
                      {sale.counterparty.rut && (
                        <p><strong>RUT:</strong> {sale.counterparty.rut}</p>
                      )}
                      {sale.counterparty.email && (
                        <p><strong>Email:</strong> {sale.counterparty.email}</p>
                      )}
                      {sale.counterparty.phone && (
                        <p><strong>Teléfono:</strong> {sale.counterparty.phone}</p>
                      )}
                      {sale.counterparty.address && (
                        <p><strong>Dirección:</strong> {sale.counterparty.address}</p>
                      )}
                    </>
                  ) : (
                    <p><strong>ID Cliente:</strong> {sale.counterparty}</p>
                  )}
                </div>
              </div>

              {/* Tabla de items */}
              <h6 className="mb-3">Detalle de Productos</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: '250px' }}>Producto</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">Precio Unit.</th>
                      <th className="text-end">Descuento</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item, index) => (
                      <tr key={item._id || index}>
                        <td>
                          {typeof item.itemDetail === 'object' ? (
                            <div>
                              <strong>{item.itemDetail.name}</strong>
                              <br />
                              <small className="text-muted">
                                {item.itemDetail.description}
                                {item.itemDetail.dimensions && ` (${item.itemDetail.dimensions})`}
                              </small>
                            </div>
                          ) : (
                            <span className="text-muted">ID: {item.itemDetail}</span>
                          )}
                        </td>
                        <td className="text-end">{item.quantity}</td>
                        <td className="text-end">{formatSaleAmount(item.unitPrice)}</td>
                        <td className="text-end">{formatSaleAmount(item.discount)}</td>
                        <td className="text-end">{formatSaleAmount(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={4} className="text-end"><strong>Neto</strong></td>
                      <td className="text-end">{formatSaleAmount(sale.netAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="text-end"><strong>IVA (19%)</strong></td>
                      <td className="text-end">{formatSaleAmount(sale.taxAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="text-end"><strong>Total</strong></td>
                      <td className="text-end">{formatSaleAmount(sale.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Observaciones - solo si existen */}
              {sale.observations && (
                <div className="mt-4">
                  <h6 className="mb-3">Observaciones</h6>
                  <div className="alert alert-light border" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    {sale.observations}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-success me-2"
                onClick={() => {
                  // TODO: Implementar generación de PDF para ventas
                  alert('Función de PDF pendiente de implementar');
                }}
                title="Generar PDF"
              >
                <i className="bi bi-file-earmark-pdf me-1"></i>
                Generar PDF
              </button>
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-primary me-2"
                  onClick={onEdit}
                >
                  <i className="bi bi-pencil-square me-1"></i>
                  Editar
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 