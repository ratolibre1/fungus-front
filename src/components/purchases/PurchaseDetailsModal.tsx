import { Purchase, PurchaseStatus, getPurchaseStatusLabel, getPurchaseStatusColor } from '../../types/purchase';
import { formatCurrency, formatCurrencyNoDecimals } from '../../utils/validators';
import PortalModal from '../common/PortalModal';

interface PurchaseDetailsModalProps {
  purchase: Purchase | null;
  onClose: () => void;
  onEdit?: () => void;
}

export default function PurchaseDetailsModal({ purchase, onClose, onEdit }: PurchaseDetailsModalProps) {
  if (!purchase) return null;

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
  const statusBadge = (status: PurchaseStatus) => {
    return (
      <span className={`badge bg-${getPurchaseStatusColor(status)}`}>
        {getPurchaseStatusLabel(status)}
      </span>
    );
  };

  // Manejar click en nombre del proveedor para ir a detalle del proveedor
  const handleProviderClick = () => {
    if (typeof purchase.counterparty === 'object' && purchase.counterparty._id) {
      // Navegar a la página de detalle del proveedor
      window.location.href = `/proveedor/${purchase.counterparty._id}`;
    }
  };

  // Obtener nombre del usuario comprador
  const getUserName = () => {
    return typeof purchase.user === 'object' ? purchase.user.name : purchase.user;
  };

  return (
    <PortalModal isOpen={true} onClose={onClose}>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="modal fade show"
        style={{
          display: 'block',
          zIndex: 1055
        }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Detalles de Compra {purchase.documentNumber}
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
                  <p><strong>Fecha:</strong> {formatDate(purchase.date)}</p>
                  <p><strong>Tipo de documento:</strong> {formatDocumentType(purchase.documentType)}</p>
                  <p><strong>Estado:</strong> {statusBadge(purchase.status as PurchaseStatus)}</p>
                  <p><strong>Correlativo:</strong> {purchase.correlative}</p>
                  <p><strong>Comprador:</strong> {getUserName()}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-3">Proveedor</h6>
                  {typeof purchase.counterparty === 'object' ? (
                    <>
                      <p>
                        <strong>Nombre:</strong>{' '}
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-underline"
                          style={{ fontSize: 'inherit', color: '#0d6efd' }}
                          onClick={handleProviderClick}
                          title="Ver detalles del proveedor"
                        >
                          {purchase.counterparty.name}
                        </button>
                      </p>
                      {purchase.counterparty.rut && (
                        <p><strong>RUT:</strong> {purchase.counterparty.rut}</p>
                      )}
                      {purchase.counterparty.email && (
                        <p><strong>Email:</strong> {purchase.counterparty.email}</p>
                      )}
                      {purchase.counterparty.phone && (
                        <p><strong>Teléfono:</strong> {purchase.counterparty.phone}</p>
                      )}
                      {purchase.counterparty.address && (
                        <p><strong>Dirección:</strong> {purchase.counterparty.address}</p>
                      )}
                    </>
                  ) : (
                    <p><strong>ID Proveedor:</strong> {purchase.counterparty}</p>
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
                    {purchase.items.map((item, index) => (
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
                        <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-end">{formatCurrencyNoDecimals(item.discount)}</td>
                        <td className="text-end">{formatCurrencyNoDecimals(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={4} className="text-end"><strong>Neto</strong></td>
                      <td className="text-end">{formatCurrencyNoDecimals(purchase.netAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="text-end"><strong>IVA (19%)</strong></td>
                      <td className="text-end">{formatCurrencyNoDecimals(purchase.taxAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="text-end"><strong>Total</strong></td>
                      <td className="text-end">{formatCurrencyNoDecimals(purchase.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Observaciones - solo si existen */}
              {purchase.observations && (
                <div className="mt-4">
                  <h6 className="mb-3">Observaciones</h6>
                  <div className="alert alert-light border" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    {purchase.observations}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
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
    </PortalModal>
  );
} 