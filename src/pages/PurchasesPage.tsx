import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PurchasesBackground from '../components/PurchasesBackground';
import {
  getPurchases,
  deletePurchase,
  updatePurchaseStatus,
  createPurchase,
  updatePurchase
} from '../services/purchaseService';
import {
  Purchase,
  PurchasePagination,
  PurchaseStatus,
  PurchaseFilters,
  DocumentType
} from '../types/purchase';
import PurchaseTable from '../components/purchases/PurchaseTable';
import PurchaseDetailsModal from '../components/purchases/PurchaseDetailsModal';
import PurchaseFormModal from '../components/purchases/PurchaseFormModal';

export default function PurchasesPage() {
  // Estado para los datos
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pagination, setPagination] = useState<PurchasePagination>({
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
  const [filters, setFilters] = useState<PurchaseFilters>({
    page: 1,
    limit: 20,
    sortField: 'documentNumber',
    sortDirection: 'desc'
  });

  // Estado para modal
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Cargar datos de compras
  const loadPurchases = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPurchases(filters);
      setPurchases(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error al cargar compras:', err);
      setError('Ocurrió un error al cargar las compras. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente o cambiar filtros
  useEffect(() => {
    loadPurchases();
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
  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailModal(true);
  };

  // Manejar edición
  const handleEditPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowEditModal(true);
  };

  // Manejar envío del formulario de compra
  const handlePurchaseSubmit = async (formData: {
    documentType: DocumentType;
    counterparty: string;
    items: {
      item: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }[];
    date?: string;
    taxRate?: number;
    observations?: string;
  }) => {
    setLoading(true);
    try {
      if (selectedPurchase) {
        // Actualizar compra existente
        await updatePurchase(selectedPurchase._id, formData);
      } else {
        // Crear nueva compra
        await createPurchase(formData);
      }

      loadPurchases(); // Recargar la lista
      setShowEditModal(false);
      setSelectedPurchase(null);
    } catch (err) {
      console.error('Error saving purchase:', err);
      setError('No se pudo guardar la compra. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación
  const handleDeletePurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!selectedPurchase) return;

    setLoading(true);
    try {
      await deletePurchase(selectedPurchase._id);
      loadPurchases(); // Recargar la lista
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error al eliminar compra:', err);
      setError('No se pudo eliminar la compra. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de compra
  const handleStatusChange = async (purchase: Purchase, newStatus: PurchaseStatus) => {
    setLoading(true);
    try {
      await updatePurchaseStatus(purchase._id, newStatus);
      loadPurchases(); // Recargar la lista
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('No se pudo cambiar el estado de la compra. Por favor, intente nuevamente.');
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
      <div className="purchases-page-container">
        <PurchasesBackground />
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>Compras</h1>
          <div>
            <button
              className="btn btn-sm btn-success me-2"
              onClick={() => {
                setSelectedPurchase(null);
                setShowEditModal(true);
              }}
            >
              <i className="bi bi-plus-lg me-1"></i> Nueva Compra
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
                  <option value="received">Recibida</option>
                  <option value="rejected">Rechazada</option>
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
                    onClick={loadPurchases}
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

        {/* Tabla de compras */}
        <PurchaseTable
          purchases={purchases}
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onViewDetails={handleViewDetails}
          onEditPurchase={handleEditPurchase}
          onDeletePurchase={handleDeletePurchase}
          onStatusChange={handleStatusChange}
          onSort={handleSort}
          initialSort={{ field: 'documentNumber', direction: 'desc' }}
        />

        {/* Modal de detalles */}
        {showDetailModal && (
          <PurchaseDetailsModal
            purchase={selectedPurchase}
            onClose={() => setShowDetailModal(false)}
            onEdit={() => {
              setShowDetailModal(false);
              setShowEditModal(true);
            }}
          />
        )}

        {/* Modal de eliminación */}
        {showDeleteModal && selectedPurchase && (
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
                    <p>¿Está seguro que desea eliminar la compra <strong>{selectedPurchase.documentNumber}</strong>?</p>
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

        {/* Modal para editar/crear compras */}
        <PurchaseFormModal
          purchase={selectedPurchase}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPurchase(null);
          }}
          onSubmit={handlePurchaseSubmit}
          loading={loading}
        />
      </div>
    </Layout>
  );
} 