import React, { useState } from 'react';
import { Quotation, QuotationPagination, QuotationStatus, DocumentType } from '../../types/quotation';

interface QuotationTableProps {
  quotations: Quotation[];
  pagination: QuotationPagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetails: (quotation: Quotation) => void;
  onEditQuotation: (quotation: Quotation) => void;
  onDeleteQuotation: (quotation: Quotation) => void;
  onStatusChange: (quotation: Quotation, newStatus: QuotationStatus) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  initialSort?: { field: string; direction: 'asc' | 'desc' };
}

// Tipo para el ordenamiento
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

// Función para formatear moneda localmente
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function QuotationTable({
  quotations,
  pagination,
  loading,
  onPageChange,
  onLimitChange,
  onViewDetails,
  onEditQuotation,
  onDeleteQuotation,
  onStatusChange,
  onSort,
  initialSort
}: QuotationTableProps) {
  // Estado para manejar ordenamiento
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    initialSort ? { key: initialSort.field, direction: initialSort.direction } : null
  );
  // Estado para la entrada de página - validar que pagination existe
  const [pageInput, setPageInput] = useState<string>((pagination?.page || 1).toString());

  // Manejar ordenamiento de columnas
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }

    setSortConfig({ key, direction });

    if (onSort) {
      onSort(key, direction);
    }
  };

  // Obtener el ícono de ordenamiento estilo productos
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <i className="bi bi-arrow-down-square ms-1"></i>;
    }

    return sortConfig.direction === 'asc'
      ? <i className="bi bi-arrow-up-square-fill ms-1"></i>
      : <i className="bi bi-arrow-down-square-fill ms-1"></i>;
  };

  // Manejar cambio de página mediante input
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  // Manejar envío del formulario de página
  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    const maxPages = pagination?.pages || 1;
    if (!isNaN(page) && page >= 1 && page <= maxPages) {
      onPageChange(page);
    } else {
      setPageInput((pagination?.page || 1).toString());
    }
  };

  // Renderizar el indicador de carga
  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" style={{ color: '#099347' }} role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando cotizaciones...</p>
      </div>
    );
  }

  // Renderizar mensaje si no hay cotizaciones
  if (quotations.length === 0) {
    return (
      <div className="alert alert-info text-center my-4" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        No se encontraron cotizaciones con los filtros aplicados
      </div>
    );
  }

  // Mapeo de estados a etiquetas con colores - tamaño estandarizado
  const statusLabel = (status: QuotationStatus) => {
    const badgeClass = "badge fs-8"; // fs-8 para tamaño estándar
    switch (status) {
      case 'pending':
        return <span className={`${badgeClass} bg-warning text-dark`}>Pendiente</span>;
      case 'approved':
        return <span className={`${badgeClass} bg-success`}>Aprobada</span>;
      case 'rejected':
        return <span className={`${badgeClass} bg-danger`}>Rechazada</span>;
      case 'converted':
        return <span className={`${badgeClass} bg-primary`}>Convertida</span>;
      default:
        return <span className={`${badgeClass} bg-secondary`}>{status}</span>;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };

  // Obtener icono del tipo de documento
  const getDocumentTypeIcon = (documentType: DocumentType) => {
    switch (documentType) {
      case 'factura':
        return <i className="bi bi-receipt text-primary me-2" title="Factura"></i>;
      case 'boleta':
        return <i className="bi bi-file-earmark text-success me-2" title="Boleta"></i>;
      default:
        return <i className="bi bi-file-earmark-text text-secondary me-2"></i>;
    }
  };

  // Generar paginador mejorado y bonito
  const renderPagination = () => {
    if (!pagination) return null;

    const { page, pages: totalPages, total, limit } = pagination;

    // Calcular el rango de elementos mostrados
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return (
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center mt-3 p-3 bg-light rounded">
        {/* Información de registros mostrados */}
        <div className="d-flex flex-column flex-sm-row align-items-center mb-3 mb-lg-0">
          <span className="text-muted mb-2 mb-sm-0 me-sm-3">
            Mostrando <strong>{startItem}-{endItem}</strong> de <strong>{total}</strong> registros
          </span>

          <div className="d-flex align-items-center">
            <label htmlFor="page-size" className="form-label me-2 mb-0 text-nowrap text-muted">
              Registros por página:
            </label>
            <select
              id="page-size"
              className="form-select form-select-sm"
              value={limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              style={{ width: 'auto', minWidth: '70px' }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Controles de paginación principales */}
        {totalPages > 1 && (
          <div className="d-flex align-items-center">
            {/* Botones de navegación */}
            <nav aria-label="Paginación de cotizaciones" className="me-3">
              <div className="btn-group" role="group">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onPageChange(1)}
                  disabled={page === 1}
                  title="Primera página"
                >
                  <i className="bi bi-chevron-double-left"></i>
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                  title="Página anterior"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {/* Páginas numeradas */}
                {(() => {
                  // Generar array de páginas a mostrar
                  let pages = [];

                  // Mostrar siempre primera y última página
                  // Y algunas páginas alrededor de la actual
                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 || // Primera página
                      i === totalPages || // Última página
                      (i >= page - 1 && i <= page + 1) // Páginas cercanas a la actual
                    ) {
                      pages.push(i);
                    } else if (
                      (i === page - 2 && page > 3) || // Puntos suspensivos antes
                      (i === page + 2 && page < totalPages - 2) // Puntos suspensivos después
                    ) {
                      pages.push(-i); // Usamos número negativo para indicar puntos suspensivos
                    }
                  }

                  // Eliminar duplicados y ordenar
                  pages = [...new Set(pages)].sort((a, b) => Math.abs(a) - Math.abs(b));

                  return pages.map(p => (
                    p < 0 ? (
                      <button key={p} className="btn btn-outline-secondary btn-sm" disabled>
                        ...
                      </button>
                    ) : (
                      <button
                        key={p}
                        className={`btn btn-sm ${p === page ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => onPageChange(p)}
                        style={p === page ? { backgroundColor: '#099347', borderColor: '#099347' } : {}}
                      >
                        {p}
                      </button>
                    )
                  ));
                })()}

                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                  title="Página siguiente"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={page === totalPages}
                  title="Última página"
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </div>
            </nav>

            {/* Navegación rápida */}
            <form onSubmit={handlePageSubmit} className="d-flex align-items-center">
              <span className="me-2 text-muted text-nowrap">Página:</span>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: '60px' }}
                value={pageInput}
                onChange={handlePageInputChange}
                aria-label="Ir a página"
              />
              <span className="mx-2 text-muted">de {totalPages}</span>
            </form>
          </div>
        )}
      </div>
    );
  };

  // Mostrar el menú desplegable para cambio de estado
  const renderStatusDropdown = (quotation: Quotation) => {
    // Si está eliminada o convertida, no mostrar opciones para cambiar estado
    if (quotation.isDeleted || quotation.status === 'converted') {
      return statusLabel(quotation.status);
    }

    return (
      <div className="dropdown">
        <button
          className="btn btn-sm dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{ backgroundColor: 'transparent', border: 'none', padding: '0' }}
        >
          {statusLabel(quotation.status as QuotationStatus)}
        </button>
        <ul className="dropdown-menu">
          {/* No mostrar opción "Pendiente" si la cotización está aprobada */}
          {quotation.status !== 'approved' && (
            <li>
              <button
                className="dropdown-item"
                onClick={() => onStatusChange(quotation, 'pending')}
                disabled={quotation.status === 'pending'}
              >
                <i className="bi bi-hourglass me-2"></i>
                Pendiente
              </button>
            </li>
          )}
          <li>
            <button
              className="dropdown-item"
              onClick={() => onStatusChange(quotation, 'approved')}
              disabled={quotation.status === 'approved' || quotation.status === 'rejected'}
            >
              <i className="bi bi-check-circle me-2"></i>
              Aprobar
            </button>
          </li>
          <li>
            <button
              className="dropdown-item"
              onClick={() => onStatusChange(quotation, 'rejected')}
              disabled={quotation.status === 'rejected'}
            >
              <i className="bi bi-x-circle me-2"></i>
              Rechazar
            </button>
          </li>
          {/* Solo mostrar opción de convertir si está aprobada */}
          {quotation.status === 'approved' && (
            <li>
              <button
                className="dropdown-item"
                onClick={() => onStatusChange(quotation, 'converted')}
              >
                <i className="bi bi-arrow-right-circle me-2"></i>
                Convertir a venta
              </button>
            </li>
          )}
        </ul>
      </div>
    );
  };

  // Renderizar botones de acción - ocultar en lugar de deshabilitar
  const renderActionButtons = (quotation: Quotation) => {
    const canEdit = quotation.status !== 'converted' && !quotation.isDeleted;
    const canDelete = quotation.status !== 'converted' && !quotation.isDeleted;

    return (
      <div className="btn-group" role="group">
        {/* Botón ver detalles - siempre visible */}
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onViewDetails(quotation)}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Ver detalles"
        >
          <i className="bi bi-eye"></i>
        </button>

        {/* Botón editar - solo mostrar si se puede editar */}
        {canEdit && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => onEditQuotation(quotation)}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Editar cotización"
          >
            <i className="bi bi-pencil"></i>
          </button>
        )}

        {/* Botón eliminar - solo mostrar si se puede eliminar */}
        {canDelete && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDeleteQuotation(quotation)}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Eliminar cotización"
          >
            <i className="bi bi-trash"></i>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th onClick={() => handleSort('documentNumber')} style={{ cursor: 'pointer' }}>
                  Nº Documento
                  {getSortIcon('documentNumber')}
                </th>
                <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                  Fecha
                  {getSortIcon('date')}
                </th>
                <th onClick={() => handleSort('counterparty')} style={{ cursor: 'pointer' }}>
                  Cliente
                  {getSortIcon('counterparty')}
                </th>
                <th className="text-end" onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer' }}>
                  Monto Total
                  {getSortIcon('totalAmount')}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Estado
                  {getSortIcon('status')}
                </th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map(quotation => (
                <tr key={quotation._id}>
                  <td>{getDocumentTypeIcon(quotation.documentType)}{quotation.documentNumber}</td>
                  <td>{formatDate(quotation.date)}</td>
                  <td>
                    {typeof quotation.counterparty === 'object' ? (
                      quotation.counterparty.name
                    ) : (
                      <span className="text-muted">ID: {quotation.counterparty}</span>
                    )}
                  </td>
                  <td className="text-end">{formatCurrency(quotation.totalAmount)}</td>
                  <td>{renderStatusDropdown(quotation)}</td>
                  <td className="text-center">
                    {renderActionButtons(quotation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderPagination()}
      </div>
    </div>
  );
} 