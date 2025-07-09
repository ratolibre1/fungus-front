import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const { logs, pagination, filters, loading, error, selectedLog, showDetails, showDeleteModal, showCleanupModal, handlePageChange, handleApplyFilters, handleViewDetails, handleCloseDetails, handleShowDeleteModal, handleCloseDeleteModal, handleConfirmDelete, handleShowCleanupModal, handleCloseCleanupModal, handleConfirmCleanup, handleRefresh } = useLogManagement();
    // Recuperar filtros almacenados en localStorage al cargar
    useEffect(() => {
        if (!isFiltersStored) {
            try {
                const storedFilters = localStorage.getItem('fungus_logs_filters');
                if (storedFilters) {
                    handleApplyFilters(JSON.parse(storedFilters));
                }
                setIsFiltersStored(true);
            }
            catch (error) {
                console.error('Error al recuperar filtros guardados:', error);
            }
        }
    }, [handleApplyFilters, isFiltersStored]);
    // Guardar filtros en localStorage cuando cambien
    useEffect(() => {
        if (isFiltersStored) {
            try {
                localStorage.setItem('fungus_logs_filters', JSON.stringify(filters));
            }
            catch (error) {
                console.error('Error al guardar filtros:', error);
            }
        }
    }, [filters, isFiltersStored]);
    return (_jsx(Layout, { children: _jsxs("div", { className: "container-fluid py-4", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-4", children: [_jsx("h1", { className: "h3 mb-0", children: "Registros de actividad" }), _jsxs("div", { className: "d-flex gap-2", children: [_jsxs("button", { type: "button", className: "btn btn-sm btn-outline-secondary", onClick: handleRefresh, disabled: loading, children: [_jsx("i", { className: "bi bi-arrow-clockwise me-1" }), "Actualizar"] }), _jsxs("button", { type: "button", className: "btn btn-sm btn-warning", onClick: handleShowCleanupModal, disabled: loading, children: [_jsx("i", { className: "bi bi-trash me-1" }), "Limpiar logs antiguos"] })] })] }), _jsx(LogFilters, { filters: filters, onApplyFilters: handleApplyFilters }), error && (_jsxs("div", { className: "alert alert-danger", role: "alert", children: [_jsx("i", { className: "bi bi-exclamation-triangle-fill me-2" }), error] })), _jsx(LogTable, { logs: logs, pagination: pagination, loading: loading, onPageChange: handlePageChange, onViewDetails: handleViewDetails, onDeleteLog: handleShowDeleteModal }), showDetails && (_jsx(LogDetailsModal, { log: selectedLog, onClose: handleCloseDetails })), showDeleteModal && (_jsx(LogDeleteModal, { log: selectedLog, onClose: handleCloseDeleteModal, onConfirm: handleConfirmDelete })), showCleanupModal && (_jsx(LogCleanupModal, { onClose: handleCloseCleanupModal, onConfirm: handleConfirmCleanup }))] }) }));
}
