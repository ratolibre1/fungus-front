import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LogFilters from '../components/logs/LogFilters';
import LogTable from '../components/logs/LogTable';
import LogDetailsModal from '../components/logs/LogDetailsModal';
import LogDeleteModal from '../components/logs/LogDeleteModal';
import LogCleanupModal from '../components/logs/LogCleanupModal';
import { useLogManagement } from '../hooks/useLogManagement';

export default function Logs() {
  const [isFiltersStored, setIsFiltersStored] = useState(false);
  const {
    logs,
    pagination,
    filters,
    loading,
    error,
    selectedLog,
    showDetails,
    showDeleteModal,
    showCleanupModal,
    handlePageChange,
    handleApplyFilters,
    handleViewDetails,
    handleCloseDetails,
    handleShowDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleShowCleanupModal,
    handleCloseCleanupModal,
    handleConfirmCleanup,
    handleRefresh
  } = useLogManagement();

  // Recuperar filtros almacenados en localStorage al cargar
  useEffect(() => {
    if (!isFiltersStored) {
      try {
        const storedFilters = localStorage.getItem('fungus_logs_filters');
        if (storedFilters) {
          handleApplyFilters(JSON.parse(storedFilters));
        }
        setIsFiltersStored(true);
      } catch (error) {
        console.error('Error al recuperar filtros guardados:', error);
      }
    }
  }, [handleApplyFilters, isFiltersStored]);

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    if (isFiltersStored) {
      try {
        localStorage.setItem('fungus_logs_filters', JSON.stringify(filters));
      } catch (error) {
        console.error('Error al guardar filtros:', error);
      }
    }
  }, [filters, isFiltersStored]);

  return (
    <Layout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Registros de actividad</h1>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Actualizar
            </button>

            <button
              type="button"
              className="btn btn-sm btn-warning"
              onClick={handleShowCleanupModal}
              disabled={loading}
            >
              <i className="bi bi-trash me-1"></i>
              Limpiar logs antiguos
            </button>
          </div>
        </div>

        <LogFilters
          filters={filters}
          onApplyFilters={handleApplyFilters}
        />

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <LogTable
          logs={logs}
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
          onDeleteLog={handleShowDeleteModal}
        />

        {/* Modales */}
        {showDetails && (
          <LogDetailsModal
            log={selectedLog}
            onClose={handleCloseDetails}
          />
        )}

        {showDeleteModal && (
          <LogDeleteModal
            log={selectedLog}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
          />
        )}

        {showCleanupModal && (
          <LogCleanupModal
            onClose={handleCloseCleanupModal}
            onConfirm={handleConfirmCleanup}
          />
        )}
      </div>
    </Layout>
  );
} 