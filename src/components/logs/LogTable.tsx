import { Log, LogPagination } from '../../types/Log';

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
            <th scope="col">ID Documento</th>
            <th scope="col" className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>
                <div>{log.createdAt}</div>
                <small className="text-muted">{new Date(log.createdAt).toLocaleTimeString()}</small>
              </td>
              <td>
                {typeof log.userId === 'object' && log.userId ? (
                  <>
                    <div>{log.userId.name}</div>
                    <small className="text-muted">{log.userId.email}</small>
                  </>
                ) : (
                  <span className="text-muted">ID: {log.userId}</span>
                )}
              </td>
              <td>{operationLabel(log.operation)}</td>
              <td>{collectionLabel(log.collectionType)}</td>
              <td>
                <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                  {log.documentId}
                </span>
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
          ))}
        </tbody>
      </table>

      {renderPagination()}

      <p className="text-center text-muted">
        Mostrando {logs.length} de {pagination.total} registros, página {pagination.page} de {pagination.totalPages}
      </p>
    </div>
  );
} 