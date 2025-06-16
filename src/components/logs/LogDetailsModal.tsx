import { Log, TransactionLogDetails, ContactLogDetails, ItemLogDetails } from '../../types/Log';
import { formatDateTime } from '../../utils/dateUtils';
import PortalModal from '../common/PortalModal';
import { useEffect } from 'react';

interface LogDetailsModalProps {
  log: Log | null;
  onClose: () => void;
}

export default function LogDetailsModal({ log, onClose }: LogDetailsModalProps) {
  // Usar useEffect para añadir/quitar la clase modal-open al body
  useEffect(() => {
    if (!log) return;

    // Añadir la clase al montar
    document.body.classList.add('modal-open');

    // Agregar un backdrop fuera del componente
    const backdropElement = document.createElement('div');
    backdropElement.className = 'modal-backdrop fade show';
    document.body.appendChild(backdropElement);

    // Limpiar al desmontar
    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeChild(backdropElement);
    };
  }, [log]);

  if (!log) return null;

  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Mostrar el nombre de operación de forma legible
  const operationLabel = {
    'create': 'Creación',
    'update': 'Actualización',
    'delete': 'Eliminación'
  }[log.operation] || log.operation;

  // Mostrar el nombre de colección de forma legible
  const collectionLabel = {
    'product': 'Productos',
    'consumable': 'Insumos',
    'contact': 'Contactos',
    'quotation': 'Cotizaciones',
    'sale': 'Ventas',
    'purchase': 'Compras'
  }[log.collectionType] || log.collectionType;

  // Función para renderizar detalles de transacciones
  const renderTransactionDetails = (details: TransactionLogDetails) => {
    return (
      <>
        {/* Información del documento */}
        {details.documentNumber && (
          <div className="card mb-3">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">📄 Información del Documento</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Número:</strong> {details.documentNumber}</p>
                  {details.documentType && <p><strong>Tipo:</strong> {details.documentType === 'factura' ? 'Factura' : 'Boleta'}</p>}
                  {details.status && <p><strong>Estado:</strong> <span className="badge bg-secondary">{details.status}</span></p>}
                </div>
                <div className="col-md-6">
                  {details.validUntil && <p><strong>Válido hasta:</strong> {new Date(details.validUntil).toLocaleDateString('es-CL')}</p>}
                  {details.itemsCount && <p><strong>Cantidad de items:</strong> {details.itemsCount}</p>}
                  {details.isFromQuotation && <p><strong>Origen:</strong> <span className="badge bg-info">Desde cotización</span></p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información de contraparte */}
        {details.counterparty && (
          <div className="card mb-3">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">🏢 Contraparte</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Nombre:</strong> {details.counterparty.name}</p>
                  <p><strong>RUT:</strong> {details.counterparty.rut}</p>
                </div>
                <div className="col-md-6">
                  {details.counterparty.email && <p><strong>Email:</strong> {details.counterparty.email}</p>}
                  <p><strong>Roles:</strong>
                    {details.counterparty.isCustomer && <span className="badge bg-primary me-1">Cliente</span>}
                    {details.counterparty.isSupplier && <span className="badge bg-warning">Proveedor</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información financiera */}
        {(details.totalAmount || details.netAmount || details.taxAmount) && (
          <div className="card mb-3">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">💰 Información Financiera</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {details.netAmount && (
                  <div className="col-md-4">
                    <p><strong>Neto:</strong> {formatCurrency(details.netAmount)}</p>
                  </div>
                )}
                {details.taxAmount && (
                  <div className="col-md-4">
                    <p><strong>IVA:</strong> {formatCurrency(details.taxAmount)}</p>
                  </div>
                )}
                {details.totalAmount && (
                  <div className="col-md-4">
                    <p><strong>Total:</strong> <span className="fw-bold text-success">{formatCurrency(details.totalAmount)}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Operaciones especiales */}
        {details.operationType === 'STATUS_CHANGE' && details.statusTransition && (
          <div className="card mb-3">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">🔄 Cambio de Estado</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-center">
                <span className="badge bg-danger me-2">{details.statusTransition.from}</span>
                <i className="bi bi-arrow-right mx-2"></i>
                <span className="badge bg-success ms-2">{details.statusTransition.to}</span>
              </div>
              {details.transactionInfo && (
                <div className="mt-3">
                  <small className="text-muted">
                    Información adicional: Total {formatCurrency(details.transactionInfo.totalAmount)},
                    {details.transactionInfo.itemsCount} items
                  </small>
                </div>
              )}
            </div>
          </div>
        )}

        {details.operationType === 'QUOTATION_CONVERSION' && details.convertedFrom && (
          <div className="card mb-3">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">🔄 Conversión desde Cotización</h6>
            </div>
            <div className="card-body">
              <p><strong>Cotización origen:</strong> {details.convertedFrom.documentNumber}</p>
              <p><strong>Estado original:</strong> <span className="badge bg-secondary">{details.convertedFrom.originalStatus}</span></p>
              {details.conversionData && (
                <div>
                  <p><strong>Datos convertidos:</strong></p>
                  <ul className="list-unstyled">
                    <li>• Total: {formatCurrency(details.conversionData.totalAmount)}</li>
                    <li>• Items: {details.conversionData.itemsCount}</li>
                    <li>• Tipo: {details.conversionData.documentType}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cambios específicos */}
        {details.changes && Object.keys(details.changes).length > 0 && (
          <div className="card mb-3">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">📝 Cambios Realizados</h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Valor Anterior</th>
                      <th>Nuevo Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(details.changes).map(([field, change]) => (
                      <tr key={field}>
                        <td className="fw-bold">{field}</td>
                        <td className="text-danger">{String(change.from) || '-'}</td>
                        <td className="text-success">{String(change.to) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {details.observations && (
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0">💬 Observaciones</h6>
            </div>
            <div className="card-body">
              <p className="mb-0">{details.observations}</p>
            </div>
          </div>
        )}
      </>
    );
  };

  // Función para renderizar detalles de contactos
  const renderContactDetails = (details: ContactLogDetails) => {
    return (
      <>
        {/* Información del contacto */}
        <div className="card mb-3">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">👤 Información del Contacto</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                {details.contactName && <p><strong>Nombre:</strong> {details.contactName}</p>}
                {details.contactRut && <p><strong>RUT:</strong> {details.contactRut}</p>}
                {details.operationType && (
                  <p><strong>Tipo de operación:</strong>
                    <span className="badge bg-info ms-1">
                      {details.operationType.replace('_', ' ')}
                    </span>
                  </p>
                )}
              </div>
              <div className="col-md-6">
                {details.sourceController && <p><strong>Controlador:</strong> {details.sourceController}</p>}
                {details.wasReactivated && <p><span className="badge bg-success">Contacto Reactivado</span></p>}
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada del contacto */}
        {details.contactInfo && (
          <div className="card mb-3">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">📋 Datos del Contacto</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Nombre:</strong> {details.contactInfo.name}</p>
                  <p><strong>RUT:</strong> {details.contactInfo.rut}</p>
                  {details.contactInfo.email && <p><strong>Email:</strong> {details.contactInfo.email}</p>}
                </div>
                <div className="col-md-6">
                  {details.contactInfo.phone && <p><strong>Teléfono:</strong> {details.contactInfo.phone}</p>}
                  {details.contactInfo.address && <p><strong>Dirección:</strong> {details.contactInfo.address}</p>}
                  <p><strong>Roles:</strong>
                    {details.contactInfo.roles.isCustomer && <span className="badge bg-primary me-1">Cliente</span>}
                    {details.contactInfo.roles.isSupplier && <span className="badge bg-warning">Proveedor</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cambios específicos */}
        {details.changes && Object.keys(details.changes).length > 0 && (
          <div className="card mb-3">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">📝 Cambios Realizados</h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Valor Anterior</th>
                      <th>Nuevo Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(details.changes).map(([field, change]) => (
                      <tr key={field}>
                        <td className="fw-bold">{field}</td>
                        <td className="text-danger">{String(change.from) || '-'}</td>
                        <td className="text-success">{String(change.to) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Datos eliminados */}
        {details.deletedData && (
          <div className="card mb-3">
            <div className="card-header bg-danger text-white">
              <h6 className="mb-0">🗑️ Datos Eliminados</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Nombre:</strong> {details.deletedData.name}</p>
                  <p><strong>RUT:</strong> {details.deletedData.rut}</p>
                  {details.deletedData.email && <p><strong>Email:</strong> {details.deletedData.email}</p>}
                </div>
                <div className="col-md-6">
                  {details.deletedData.phone && <p><strong>Teléfono:</strong> {details.deletedData.phone}</p>}
                  {details.deletedData.address && <p><strong>Dirección:</strong> {details.deletedData.address}</p>}
                  <p><strong>Fecha creación original:</strong> {new Date(details.deletedData.originalCreationDate).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
              {details.deletionReason && (
                <div className="mt-2">
                  <p><strong>Razón:</strong> {details.deletionReason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  // Función para renderizar detalles de items
  const renderItemDetails = (details: ItemLogDetails) => {
    return (
      <>
        {/* Información del item */}
        <div className="card mb-3">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">📦 Información del Item</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                {details.itemName && <p><strong>Nombre:</strong> {details.itemName}</p>}
                {details.itemType && <p><strong>Tipo:</strong> <span className="badge bg-info">{details.itemType === 'Product' ? 'Producto' : 'Insumo'}</span></p>}
                {details.operationType && <p><strong>Operación:</strong> {details.operationType.replace('_', ' ')}</p>}
              </div>
              <div className="col-md-6">
                {details.sourceController && <p><strong>Controlador:</strong> {details.sourceController}</p>}
                {details.initialStock !== undefined && <p><strong>Stock inicial:</strong> {details.initialStock}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada del item */}
        {details.itemInfo && (
          <div className="card mb-3">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">📋 Datos del Item</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Nombre:</strong> {details.itemInfo.name}</p>
                  <p><strong>Descripción:</strong> {details.itemInfo.description}</p>
                  {details.itemInfo.dimensions && <p><strong>Dimensiones:</strong> {details.itemInfo.dimensions}</p>}
                </div>
                <div className="col-md-6">
                  <p><strong>Precio Neto:</strong> {formatCurrency(details.itemInfo.netPrice)}</p>
                  {details.itemInfo.stock !== undefined && <p><strong>Stock:</strong> {details.itemInfo.stock}</p>}
                  <p><strong>Inventariado:</strong>
                    <span className={`badge ${details.itemInfo.isInventoried ? 'bg-success' : 'bg-secondary'} ms-1`}>
                      {details.itemInfo.isInventoried ? 'Sí' : 'No'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Impacto de precios */}
        {details.priceImpact && (
          <div className="card mb-3">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">💰 Impacto de Precios</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Precio anterior:</strong> {formatCurrency(details.priceImpact.oldPrice)}</p>
                  <p><strong>Precio nuevo:</strong> {formatCurrency(details.priceImpact.newPrice)}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Diferencia:</strong>
                    <span className={`fw-bold ${details.priceImpact.difference > 0 ? 'text-success' : 'text-danger'}`}>
                      {details.priceImpact.difference > 0 ? '+' : ''}{formatCurrency(details.priceImpact.difference)}
                    </span>
                  </p>
                  <p><strong>Cambio porcentual:</strong>
                    <span className={`badge ${details.priceImpact.difference > 0 ? 'bg-success' : 'bg-danger'} ms-1`}>
                      {details.priceImpact.percentageChange}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Impacto de stock */}
        {details.stockImpact && (
          <div className="card mb-3">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">📊 Impacto de Stock</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Stock anterior:</strong> {details.stockImpact.oldStock}</p>
                  <p><strong>Stock nuevo:</strong> {details.stockImpact.newStock}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Diferencia:</strong>
                    <span className={`fw-bold ${details.stockImpact.difference > 0 ? 'text-success' : 'text-danger'}`}>
                      {details.stockImpact.difference > 0 ? '+' : ''}{details.stockImpact.difference}
                    </span>
                  </p>
                  {(details.stockImpact.becameInventoried || details.stockImpact.becameNonInventoried) && (
                    <p><strong>Cambio de estado:</strong>
                      {details.stockImpact.becameInventoried && <span className="badge bg-success ms-1">Ahora inventariado</span>}
                      {details.stockImpact.becameNonInventoried && <span className="badge bg-warning ms-1">Ya no inventariado</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Impacto financiero (para eliminaciones) */}
        {details.financialImpact && (
          <div className="card mb-3">
            <div className="card-header bg-danger text-white">
              <h6 className="mb-0">💸 Impacto Financiero de Eliminación</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Valor unitario:</strong> {formatCurrency(details.financialImpact.itemValue)}</p>
                  <p><strong>Valor stock perdido:</strong>
                    <span className="fw-bold text-danger">{formatCurrency(details.financialImpact.stockValue)}</span>
                  </p>
                </div>
                <div className="col-md-6">
                  <p><strong>Tenía stock:</strong>
                    <span className={`badge ${details.financialImpact.hadStock ? 'bg-warning' : 'bg-success'} ms-1`}>
                      {details.financialImpact.hadStock ? 'Sí' : 'No'}
                    </span>
                  </p>
                  <p><strong>Era inventariado:</strong>
                    <span className={`badge ${details.financialImpact.wasInventoried ? 'bg-warning' : 'bg-secondary'} ms-1`}>
                      {details.financialImpact.wasInventoried ? 'Sí' : 'No'}
                    </span>
                  </p>
                </div>
              </div>
              {details.deletionReason && (
                <div className="mt-2">
                  <p><strong>Razón de eliminación:</strong> {details.deletionReason}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Datos eliminados */}
        {details.deletedData && (
          <div className="card mb-3">
            <div className="card-header bg-danger text-white">
              <h6 className="mb-0">🗑️ Datos Eliminados</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Nombre:</strong> {details.deletedData.name}</p>
                  <p><strong>Descripción:</strong> {details.deletedData.description}</p>
                  <p><strong>Precio:</strong> {formatCurrency(details.deletedData.netPrice)}</p>
                </div>
                <div className="col-md-6">
                  {details.deletedData.dimensions && <p><strong>Dimensiones:</strong> {details.deletedData.dimensions}</p>}
                  {details.deletedData.stock !== undefined && <p><strong>Stock final:</strong> {details.deletedData.stock}</p>}
                  <p><strong>Fecha creación:</strong> {new Date(details.deletedData.originalCreationDate).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Función principal para renderizar detalles según el tipo
  const renderEnrichedDetails = () => {
    const details = log.details;

    // Verificar el tipo de log y renderizar accordingly
    if (log.collectionType === 'quotation' || log.collectionType === 'sale' || log.collectionType === 'purchase') {
      return renderTransactionDetails(details as TransactionLogDetails);
    }

    if (log.collectionType === 'contact') {
      return renderContactDetails(details as ContactLogDetails);
    }

    if (log.collectionType === 'product' || log.collectionType === 'consumable') {
      return renderItemDetails(details as ItemLogDetails);
    }

    // Fallback para logs sin información enriquecida
    return (
      <div className="card">
        <div className="card-header bg-light">
          <h6 className="mb-0">📄 Detalles Raw</h6>
        </div>
        <div className="card-body">
          <pre className="bg-light p-3 rounded" style={{ fontSize: '0.85rem', maxHeight: '300px', overflow: 'auto' }}>
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      </div>
    );
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
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-file-text-fill me-2"></i>
                Detalles del Registro de Actividad
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Cerrar"
              />
            </div>
            <div className="modal-body">
              {/* Información general del log */}
              <div className="card mb-4">
                <div className="card-header bg-dark text-white">
                  <h6 className="mb-0">ℹ️ Información General</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Fecha y hora:</strong> {formatDateTime(log.createdAt)}</p>
                      <p><strong>Operación:</strong>
                        <span className={`badge ms-1 ${log.operation === 'create' ? 'bg-success' :
                          log.operation === 'update' ? 'bg-primary' :
                            log.operation === 'delete' ? 'bg-danger' : 'bg-secondary'
                          }`}>
                          {operationLabel}
                        </span>
                      </p>
                      <p><strong>Colección:</strong> <span className="badge bg-light text-dark border">{collectionLabel}</span></p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>ID del documento:</strong> <code>{log.documentId}</code></p>
                      <p><strong>Usuario:</strong></p>
                      {typeof log.userId === 'object' && log.userId ? (
                        <div className="ms-3">
                          <p className="mb-0 fw-bold">{log.userId.name}</p>
                          <p className="mb-0 text-muted small">{log.userId.email}</p>
                          <p className="mb-0 text-muted small">ID: {log.userId._id}</p>
                        </div>
                      ) : (
                        <div className="ms-3">
                          <p className="mb-0">ID: {log.userId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles enriquecidos */}
              {renderEnrichedDetails()}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalModal>
  );
} 