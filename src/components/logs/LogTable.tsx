import { Log, LogPagination, TransactionLogDetails, ContactLogDetails, ItemLogDetails } from '../../types/Log';

interface LogTableProps {
  logs: Log[];
  pagination: LogPagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  onViewDetails: (log: Log) => void;
  onDeleteLog: (log: Log) => void;
}

export default function LogTable({
  logs,
  pagination,
  loading,
  onPageChange,
  onViewDetails,
  onDeleteLog
}: LogTableProps) {

  // Renderizar el indicador de carga
  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" style={{ color: '#099347' }} role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando registros...</p>
      </div>
    );
  }

  // Renderizar mensaje si no hay logs
  if (logs.length === 0) {
    return (
      <div className="alert alert-info text-center my-4" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        No se encontraron registros con los filtros aplicados
      </div>
    );
  }

  // Mapeo de operaciones a etiquetas con colores
  const operationLabel = (operation: string) => {
    switch (operation) {
      case 'create':
        return <span className="badge bg-success">Creación</span>;
      case 'update':
        return <span className="badge bg-primary">Actualización</span>;
      case 'delete':
        return <span className="badge bg-danger">Eliminación</span>;
      default:
        return <span className="badge bg-secondary">{operation}</span>;
    }
  };

  // Mapeo de colecciones a nombres legibles
  const collectionLabel = (collection: string) => {
    const collections: Record<string, string> = {
      'product': 'Productos',
      'consumable': 'Insumos',
      'contact': 'Contactos',
      'quotation': 'Cotizaciones',
      'sale': 'Ventas',
      'purchase': 'Compras'
    };

    return collections[collection] || collection;
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Función para obtener información clave del log
  const getKeyInfo = (log: Log): { title: string; subtitle?: string; badge?: string } => {
    const details = log.details;

    // Para transacciones (cotizaciones, ventas, compras)
    if (log.collectionType === 'quotation' || log.collectionType === 'sale' || log.collectionType === 'purchase') {
      const transactionDetails = details as TransactionLogDetails;

      if (transactionDetails.documentNumber) {
        const subtitle = transactionDetails.counterparty?.name ||
          transactionDetails.transactionInfo?.counterparty ||
          'Contraparte no disponible';

        let badge = '';
        if (transactionDetails.operationType === 'STATUS_CHANGE') {
          badge = `${transactionDetails.statusTransition?.from} → ${transactionDetails.statusTransition?.to}`;
        } else if (transactionDetails.operationType === 'QUOTATION_CONVERSION') {
          badge = 'Conversión desde cotización';
        } else if (transactionDetails.totalAmount) {
          badge = formatCurrency(transactionDetails.totalAmount);
        }

        return {
          title: transactionDetails.documentNumber,
          subtitle,
          badge
        };
      }
    }

    // Para contactos
    if (log.collectionType === 'contact') {
      const contactDetails = details as ContactLogDetails;

      if (contactDetails.contactName) {
        let badge = '';
        if (contactDetails.operationType) {
          const operationMap: Record<string, string> = {
            'CLIENT_CREATION': 'Nuevo Cliente',
            'SUPPLIER_CREATION': 'Nuevo Proveedor',
            'CONTACT_CREATION': 'Nuevo Contacto',
            'CONTACT_REACTIVATION': 'Reactivado',
            'ROLE_CHANGE': 'Cambio de Rol',
            'MARK_AS_REVIEWED': 'Revisado'
          };
          badge = operationMap[contactDetails.operationType] || contactDetails.operationType;
        }

        return {
          title: contactDetails.contactName,
          subtitle: contactDetails.contactRut,
          badge
        };
      }
    }

    // Para items (productos/consumibles)
    if (log.collectionType === 'product' || log.collectionType === 'consumable') {
      const itemDetails = details as ItemLogDetails;

      if (itemDetails.itemName) {
        let badge = '';
        if (itemDetails.priceImpact?.percentageChange) {
          badge = `Precio ${itemDetails.priceImpact.percentageChange}`;
        } else if (itemDetails.stockImpact?.difference) {
          badge = `Stock ${itemDetails.stockImpact.difference > 0 ? '+' : ''}${itemDetails.stockImpact.difference}`;
        } else if (itemDetails.financialImpact?.stockValue) {
          badge = `Valor: ${formatCurrency(itemDetails.financialImpact.stockValue)}`;
        } else if (itemDetails.pricing?.netPrice) {
          badge = formatCurrency(itemDetails.pricing.netPrice);
        }

        return {
          title: itemDetails.itemName,
          subtitle: itemDetails.itemType === 'Product' ? 'Producto' : 'Insumo',
          badge
        };
      }
    }

    // Fallback para logs sin información enriquecida
    return {
      title: `ID: ${log.documentId.substring(0, 8)}...`,
      subtitle: undefined,
      badge: undefined
    };
  };

  // Generar paginador
  const renderPagination = () => {
    const { page, totalPages } = pagination;

    // Si no hay suficientes páginas, no mostrar paginador
    if (totalPages <= 1) return null;

    // Generar array de páginas a mostrar
    let pages = [];

    // Mostrar siempre primera y última página
    // Y algunas páginas alrededor de la actual
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Primera página
        i === totalPages || // Última página
        (i >= page - 2 && i <= page + 2) // Páginas cercanas a la actual
      ) {
        pages.push(i);
      } else if (
        (i === page - 3 && page > 3) || // Puntos suspensivos antes
        (i === page + 3 && page < totalPages - 2) // Puntos suspensivos después
      ) {
        pages.push(-i); // Usamos número negativo para indicar puntos suspensivos
      }
    }

    // Eliminar duplicados y ordenar
    pages = [...new Set(pages)].sort((a, b) => Math.abs(a) - Math.abs(b));

    return (
      <nav aria-label="Paginación de logs">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>

          {pages.map(p => (
            p < 0 ? (
              // Puntos suspensivos
              <li key={p} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            ) : (
              // Número de página
              <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(p)}
                  style={p === page ? { backgroundColor: '#099347', borderColor: '#099347' } : {}}
                >
                  {p}
                </button>
              </li>
            )
          ))}

          <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped">
        <thead className="table-light">
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Usuario</th>
            <th scope="col">Operación</th>
            <th scope="col">Colección</th>
            <th scope="col">Información Clave</th>
            <th scope="col" className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => {
            const keyInfo = getKeyInfo(log);
            return (
              <tr key={log._id}>
                <td>
                  <div>{new Date(log.createdAt).toLocaleDateString('es-CL')}</div>
                  <small className="text-muted">{new Date(log.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</small>
                </td>
                <td>
                  {typeof log.userId === 'object' && log.userId ? (
                    <>
                      <div className="fw-medium">{log.userId.name}</div>
                      <small className="text-muted">{log.userId.email}</small>
                    </>
                  ) : (
                    <span className="text-muted">ID: {log.userId}</span>
                  )}
                </td>
                <td>{operationLabel(log.operation)}</td>
                <td>
                  <span className="badge bg-light text-dark border">
                    {collectionLabel(log.collectionType)}
                  </span>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <div className="fw-medium text-truncate" style={{ maxWidth: '200px' }} title={keyInfo.title}>
                      {keyInfo.title}
                    </div>
                    {keyInfo.subtitle && (
                      <small className="text-muted text-truncate" style={{ maxWidth: '200px' }} title={keyInfo.subtitle}>
                        {keyInfo.subtitle}
                      </small>
                    )}
                    {keyInfo.badge && (
                      <span className="badge bg-info mt-1 align-self-start" style={{ fontSize: '0.7rem' }}>
                        {keyInfo.badge}
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-center">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onViewDetails(log)}
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDeleteLog(log)}
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Eliminar registro"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Información de paginación */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">
          Mostrando {logs.length} de {pagination.total} registros
          {pagination.total > 0 && (
            <span> (página {pagination.page} de {pagination.totalPages})</span>
          )}
        </div>
        {renderPagination()}
      </div>
    </div>
  );
} 