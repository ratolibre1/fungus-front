import React, { useState } from 'react';
import { Sale, SalePagination, SaleStatus, DocumentType, getSaleStatusLabel, getSaleStatusColor } from '../../types/sale';
import { formatCurrencyNoDecimals } from '../../utils/validators';

interface SaleTableProps {
  sales: Sale[];
  pagination: SalePagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetails: (sale: Sale) => void;
  onEditSale: (sale: Sale) => void;
  onDeleteSale: (sale: Sale) => void;
  onStatusChange: (sale: Sale, newStatus: SaleStatus) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  initialSort?: { field: string; direction: 'asc' | 'desc' };
}

// Tipo para el ordenamiento
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function SaleTable({
  sales,
  pagination,
  loading,
  onPageChange,
  onLimitChange,
  onViewDetails,
  onEditSale,
  onDeleteSale,
  onStatusChange,
  onSort,
  initialSort
}: SaleTableProps) {
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

  // Obtener el ícono de ordenamiento
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
        <p className="mt-2">Cargando ventas...</p>
      </div>
    );
  }

  // Renderizar mensaje si no hay ventas
  if (sales.length === 0) {
    return (
      <div className="alert alert-info text-center my-4" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        No se encontraron ventas con los filtros aplicados
      </div>
    );
  }

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

  // Generar paginador
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
            <nav aria-label="Paginación de ventas" className="me-3">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => onPageChange(1)}
                    disabled={!pagination.hasPrev}
                    title="Primera página"
                  >
                    <i className="bi bi-chevron-double-left"></i>
                  </button>
                </li>
                <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!pagination.hasPrev}
                    title="Página anterior"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!pagination.hasNext}
                    title="Página siguiente"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
                <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => onPageChange(totalPages)}
                    disabled={!pagination.hasNext}
                    title="Última página"
                  >
                    <i className="bi bi-chevron-double-right"></i>
                  </button>
                </li>
              </ul>
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
  const renderStatusDropdown = (sale: Sale) => {
    // Si está eliminada o es un estado final, no mostrar opciones
    if (sale.isDeleted || sale.status === 'paid') {
      return (
        <span className={`badge bg-${getSaleStatusColor(sale.status)}`}>
          {getSaleStatusLabel(sale.status)}
        </span>
      );
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
          <span className={`badge bg-${getSaleStatusColor(sale.status)}`}>
            {getSaleStatusLabel(sale.status)}
          </span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end" style={{ zIndex: 1050 }}>
          {sale.status === 'pending' && (
            <li>
              <button
                className="dropdown-item"
                onClick={() => onStatusChange(sale, 'invoiced')}
              >
                <i className="bi bi-receipt me-2"></i>
                Facturar
              </button>
            </li>
          )}
          {sale.status === 'invoiced' && (
            <li>
              <button
                className="dropdown-item"
                onClick={() => onStatusChange(sale, 'paid')}
              >
                <i className="bi bi-check-circle me-2"></i>
                Marcar como pagada
              </button>
            </li>
          )}
        </ul>
      </div>
    );
  };

  // Renderizar botones de acción
  const renderActionButtons = (sale: Sale) => {
    // Según especificación backend:
    // - Solo se pueden editar si están en pending o invoiced
    // - Solo se pueden eliminar si están en pending
    const canEdit = (sale.status === 'pending' || sale.status === 'invoiced') && !sale.isDeleted;
    const canDelete = sale.status === 'pending' && !sale.isDeleted;

    return (
      <div className="btn-group" role="group">
        {/* Botón ver detalles - siempre visible */}
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onViewDetails(sale)}
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
            onClick={() => onEditSale(sale)}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Editar venta"
          >
            <i className="bi bi-pencil"></i>
          </button>
        )}

        {/* Botón eliminar - solo mostrar si se puede eliminar */}
        {canDelete && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDeleteSale(sale)}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Eliminar venta"
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
              {sales.map(sale => (
                <tr key={sale._id}>
                  <td>{getDocumentTypeIcon(sale.documentType)}{sale.documentNumber}</td>
                  <td>{formatDate(sale.date)}</td>
                  <td>
                    {typeof sale.counterparty === 'object' ? (
                      sale.counterparty.name
                    ) : (
                      <span className="text-muted">ID: {sale.counterparty}</span>
                    )}
                  </td>
                  <td className="text-end">{formatCurrencyNoDecimals(sale.totalAmount)}</td>
                  <td>{renderStatusDropdown(sale)}</td>
                  <td className="text-center">
                    {renderActionButtons(sale)}
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