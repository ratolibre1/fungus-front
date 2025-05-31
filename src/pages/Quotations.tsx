import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import QuotationsBackground from '../components/QuotationsBackground';
import {
  getQuotations,
  deleteQuotation,
  updateQuotationStatus,
  createQuotation,
  updateQuotation,
  convertQuotationToSale
} from '../services/quotationService';
import {
  Quotation,
  QuotationPagination,
  QuotationStatus,
  QuotationFilters,
  DocumentType
} from '../types/quotation';
import QuotationTable from '../components/quotations/QuotationTable';
import QuotationDetailsModal from '../components/quotations/QuotationDetailsModal';
import QuotationFormModal from '../components/quotations/QuotationFormModal';

export default function Quotations() {
  // Estado para los datos
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [pagination, setPagination] = useState<QuotationPagination>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 20,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para los filtros
  const [filters, setFilters] = useState<QuotationFilters>({
    page: 1,
    limit: 20,
    sortField: 'documentNumber',
    sortDirection: 'desc'
  });

  // Estado para modal
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Cargar datos de cotizaciones
  const loadQuotations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getQuotations(filters);
      setQuotations(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
      setError('Ocurrió un error al cargar las cotizaciones. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente o cambiar filtros
  useEffect(() => {
    loadQuotations();
  }, [filters]);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Manejar cambio de límite por página
  const handleLimitChange = (limit: number) => {
    setFilters(prev => ({ ...prev, page: 1, limit }));
  };

  // Manejar ordenamiento
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      sortField: field,
      sortDirection: direction
    }));
  };

  // Manejar ver detalles
  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailModal(true);
  };

  // Manejar edición
  const handleEditQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowEditModal(true);
  };

  // Manejar envío del formulario de cotización
  const handleQuotationSubmit = async (formData: {
    documentType: DocumentType;
    counterparty: string;
    validUntil?: string;
    items: {
      item: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }[];
    taxRate?: number;
    observations?: string;
  }) => {
    setLoading(true);
    try {
      if (selectedQuotation) {
        // Actualizar cotización existente
        await updateQuotation(selectedQuotation._id, formData);
      } else {
        // Crear nueva cotización
        await createQuotation(formData);
      }

      loadQuotations(); // Recargar la lista
      setShowEditModal(false);
      setSelectedQuotation(null);
    } catch (err) {
      console.error('Error saving quotation:', err);
      setError('No se pudo guardar la cotización. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación
  const handleDeleteQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!selectedQuotation) return;

    setLoading(true);
    try {
      await deleteQuotation(selectedQuotation._id);
      loadQuotations(); // Recargar la lista
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error al eliminar cotización:', err);
      setError('No se pudo eliminar la cotización. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de cotización
  const handleStatusChange = async (quotation: Quotation, newStatus: QuotationStatus) => {
    setLoading(true);
    try {
      if (newStatus === 'converted') {
        const result = await convertQuotationToSale(quotation._id);

        // Mostrar notificación de éxito
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.innerHTML = `
          <i class="bi bi-check-circle-fill me-2"></i>
          <strong>¡Conversión exitosa!</strong> 
          Venta ${result.data.documentNumber} creada correctamente.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
          alert.remove();
        }, 5000);

        console.log('✅ Cotización convertida a venta:', result.data);
      } else {
        await updateQuotationStatus(quotation._id, newStatus);
      }

      loadQuotations(); // Recargar la lista
    } catch (err) {
      console.error('Error al cambiar estado:', err);

      if (newStatus === 'converted') {
        setError('No se pudo convertir la cotización a venta. Por favor, intente nuevamente.');
      } else {
        setError('No se pudo cambiar el estado de la cotización. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 })); // Reset a primera página
  };

  // Resetear filtros
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortField: 'documentNumber',
      sortDirection: 'desc'
    });
  };

  return (
    <Layout>
      <div className="quotations-page-container">
        <QuotationsBackground />
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>Cotizaciones</h1>
          <div>
            <button
              className="btn btn-sm btn-success me-2"
              onClick={() => {
                setSelectedQuotation(null);
                setShowEditModal(true);
              }}
            >
              <i className="bi bi-plus-lg me-1"></i> Nueva Cotización
            </button>
          </div>
        </div>

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6 col-lg-3">
                <label htmlFor="status" className="form-label">Estado</label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={filters.status || ''}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobada</option>
                  <option value="rejected">Rechazada</option>
                  <option value="converted">Convertida</option>
                </select>
              </div>
              <div className="col-md-6 col-lg-3">
                <label htmlFor="startDate" className="form-label">Desde</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-control"
                  value={filters.startDate || ''}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-6 col-lg-3">
                <label htmlFor="endDate" className="form-label">Hasta</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-control"
                  value={filters.endDate || ''}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-6 col-lg-3 d-flex align-items-end">
                <div className="d-grid gap-2 d-md-flex w-100">
                  <button
                    className="btn btn-outline-primary me-md-2 flex-grow-1"
                    type="button"
                    onClick={loadQuotations}
                  >
                    <i className="bi bi-search me-1"></i> Buscar
                  </button>
                  <button
                    className="btn btn-outline-secondary flex-grow-1"
                    type="button"
                    onClick={handleResetFilters}
                  >
                    <i className="bi bi-x-circle me-1"></i> Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de cotizaciones */}
        <QuotationTable
          quotations={quotations}
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onViewDetails={handleViewDetails}
          onEditQuotation={handleEditQuotation}
          onDeleteQuotation={handleDeleteQuotation}
          onStatusChange={handleStatusChange}
          onSort={handleSort}
          initialSort={{ field: 'documentNumber', direction: 'desc' }}
        />

        {/* Modal de detalles */}
        {showDetailModal && (
          <QuotationDetailsModal
            quotation={selectedQuotation}
            onClose={() => setShowDetailModal(false)}
            onEdit={() => {
              setShowDetailModal(false);
              setShowEditModal(true);
            }}
          />
        )}

        {/* Modal de eliminación */}
        {showDeleteModal && selectedQuotation && (
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
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirmar eliminación</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDeleteModal(false)}
                      disabled={loading}
                      aria-label="Cerrar"
                    />
                  </div>
                  <div className="modal-body">
                    <p>¿Está seguro que desea eliminar la cotización <strong>{selectedQuotation.documentNumber}</strong>?</p>
                    <p className="text-danger">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDeleteModal(false)}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={confirmDelete}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Eliminando...
                        </>
                      ) : (
                        <>Eliminar</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modal para editar/crear cotizaciones */}
        <QuotationFormModal
          quotation={selectedQuotation}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedQuotation(null);
          }}
          onSubmit={handleQuotationSubmit}
          loading={loading}
        />
      </div>
    </Layout>
  );
} 